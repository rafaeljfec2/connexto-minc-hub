import { useState, useRef, useEffect, Fragment, useCallback } from 'react'
import { Camera, Image, FileText, MapPin, X, Mic } from 'lucide-react'
import { useLongPress } from '@/hooks/useLongPress'
import { Alert, AlertType } from '@/components/ui/Alert'

interface ChatInputProps {
  readonly onSend: (text: string) => void
  readonly onSendAudio?: (file: Blob, duration: number) => Promise<void>
  readonly onAttachment?: (
    type: 'camera' | 'gallery' | 'document' | 'location',
    file?: File
  ) => void
  readonly disabled?: boolean
  readonly editMode?: boolean
  readonly editText?: string
  readonly onCancelEdit?: () => void
  readonly onSaveEdit?: (text: string) => void
}

interface AttachmentOption {
  id: 'camera' | 'gallery' | 'document' | 'location'
  label: string
  icon: React.ReactNode
  color: string
  accept?: string
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getPlaceholderText(disabled?: boolean, editMode?: boolean): string {
  if (disabled) return 'Enviando arquivo...'
  if (editMode) return 'Edite a mensagem...'
  return 'Digite uma mensagem...'
}

const attachmentOptions: AttachmentOption[] = [
  {
    id: 'camera',
    label: 'Câmera',
    icon: <Camera className="h-5 w-5" />,
    color: 'bg-red-500',
    accept: 'image/*',
  },
  {
    id: 'gallery',
    label: 'Galeria',
    icon: <Image className="h-5 w-5" />,
    color: 'bg-purple-500',
    accept: 'image/*',
  },
  {
    id: 'document',
    label: 'Documento',
    icon: <FileText className="h-5 w-5" />,
    color: 'bg-blue-500',
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt',
  },
  {
    id: 'location',
    label: 'Localização',
    icon: <MapPin className="h-5 w-5" />,
    color: 'bg-green-500',
  },
]

export function ChatInput({
  onSend,
  onSendAudio,
  onAttachment,
  disabled,
  editMode,
  editText,
  onCancelEdit,
  onSaveEdit,
}: ChatInputProps) {
  const [text, setText] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [currentAccept, setCurrentAccept] = useState<string>('')
  const [currentAttachType, setCurrentAttachType] = useState<AttachmentOption['id'] | null>(null)
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean
    type: AlertType
    title: string
    message: string
  } | null>(null)

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<number>(0)
  const onSendAudioRef = useRef(onSendAudio)

  const recordingSessionIdRef = useRef<string | null>(null)

  // Keep ref updated
  useEffect(() => {
    onSendAudioRef.current = onSendAudio
  }, [onSendAudio])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      recordingSessionIdRef.current = null
    }
  }, [])

  const startRecording = useCallback(async () => {
    const sessionId = Date.now().toString()
    recordingSessionIdRef.current = sessionId

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Check if session is still valid (user hasn't released button yet)
      if (recordingSessionIdRef.current !== sessionId) {
        stream.getTracks().forEach(track => track.stop())
        return
      }

      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      startTimeRef.current = Date.now()
      setRecordingDuration(0)

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      recordingSessionIdRef.current = null
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Erro no Microfone',
        message: 'Não foi possível acessar o microfone. Verifique as permissões.',
      })
    }
  }, [])

  const stopRecording = useCallback(async () => {
    recordingSessionIdRef.current = null // Invalidate session

    if (mediaRecorderRef.current?.state !== 'recording') {
      setIsRecording(false)
      setRecordingDuration(0)
      return
    }

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      const duration = recordingDuration

      // Stop all tracks
      mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())

      // Reset state
      setIsRecording(false)
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      setRecordingDuration(0)

      // Send audio only if it's a valid recording (has chunks)
      if (onSendAudioRef.current && audioBlob.size > 0) {
        await onSendAudioRef.current(audioBlob, duration)
      }
    }

    mediaRecorderRef.current.stop()
  }, [recordingDuration])

  const cancelRecording = useCallback(() => {
    recordingSessionIdRef.current = null // Invalidate session

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    setIsRecording(false)
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    setRecordingDuration(0)
    audioChunksRef.current = []
  }, [])

  const longPressProps = useLongPress(() => {}, {
    threshold: 200,
    onStart: () => {
      void startRecording()
    },
    onFinish: _ => {
      // Check if it was a short click (recording hasn't started or duration is 0)
      const pressDuration = Date.now() - startTimeRef.current
      if (!isRecording && pressDuration < 500) {
        setAlertConfig({
          isOpen: true,
          type: 'info',
          title: 'Segure para gravar',
          message: 'Mantenha o botão pressionado para gravar seu áudio.',
        })
      }
      void stopRecording()
    },
    onCancel: cancelRecording,
  })

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [text])

  // Set text when entering edit mode
  useEffect(() => {
    if (editMode && editText) {
      setText(editText)
    }
  }, [editMode, editText])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false)
      }
    }

    if (showAttachMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAttachMenu])

  function handleSend() {
    if (text.trim()) {
      if (editMode && onSaveEdit) {
        onSaveEdit(text)
      } else {
        onSend(text)
      }
      setText('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  function handleCancel() {
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    onCancelEdit?.()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleAttachmentClick(option: AttachmentOption) {
    setShowAttachMenu(false)

    if (option.id === 'location') {
      // Handle location - request geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords
            const locationText = `📍 Localização: https://maps.google.com/?q=${latitude},${longitude}`
            onSend(locationText)
          },
          error => {
            console.error('Error getting location:', error)
            setAlertConfig({
              isOpen: true,
              type: 'error',
              title: 'Erro de Localização',
              message:
                'Não foi possível obter sua localização. Verifique as permissões do navegador.',
            })
          }
        )
      } else {
        setAlertConfig({
          isOpen: true,
          type: 'error',
          title: 'Recurso Não Suportado',
          message: 'Geolocalização não é suportada neste navegador.',
        })
      }
      return
    }

    if (option.id === 'camera') {
      // For camera, we need to use capture attribute
      setCurrentAccept('image/*')
      setCurrentAttachType('camera')
      if (fileInputRef.current) {
        fileInputRef.current.setAttribute('capture', 'environment')
        fileInputRef.current.click()
      }
      return
    }

    // For gallery and document
    if (option.accept) {
      setCurrentAccept(option.accept)
      setCurrentAttachType(option.id)
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture')
        fileInputRef.current.click()
      }
    }

    onAttachment?.(option.id)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file && currentAttachType) {
      onAttachment?.(currentAttachType, file)
      // Reset
      e.target.value = ''
      setCurrentAttachType(null)
    }
  }

  return (
    <Fragment>
      <div className="relative flex items-end gap-2 p-4 border-t border-dark-200 dark:border-dark-800 bg-transparent">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={currentAccept}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attachment Menu */}
        {showAttachMenu && (
          <div
            ref={menuRef}
            className="absolute bottom-full left-2 mb-2 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-dark-200 dark:border-dark-700 p-3 animate-in slide-in-from-bottom-2 fade-in duration-200"
          >
            <div className="flex gap-4">
              {attachmentOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleAttachmentClick(option)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`${option.color} p-3 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    {option.icon}
                  </div>
                  <span className="text-xs text-dark-600 dark:text-dark-400 font-medium">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Attach Button - hide in edit mode or when recording */}
        {!editMode && !isRecording && (
          <button
            type="button"
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2.5 rounded-full transition-all mb-0.5 flex-shrink-0 ${
              showAttachMenu
                ? 'bg-primary-500 text-white rotate-45'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
            }`}
            aria-label="Anexar"
          >
            {showAttachMenu ? (
              <X className="h-6 w-6" />
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
          </button>
        )}

        {/* Cancel/Trash button - show only when recording */}
        {isRecording && (
          <button
            type="button"
            onClick={cancelRecording}
            className="p-2.5 rounded-full transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0 mb-0.5"
            aria-label="Cancelar gravação"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}

        {/* Recording UI - WhatsApp Style */}
        {isRecording ? (
          <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-bottom-2">
            {/* Recording indicator with timer */}
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-sm font-medium text-dark-700 dark:text-dark-300 min-w-[3rem]">
              {formatDuration(recordingDuration)}
            </span>

            {/* Audio waveform visualization */}
            <div className="flex items-center gap-0.5 flex-1 h-6">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-dark-400 dark:bg-dark-500 rounded-full transition-all"
                  style={{
                    height: `${Math.random() * 60 + 20}%`,
                    animation: `pulse ${Math.random() * 0.5 + 0.5}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Normal Input Area */
          <div className="flex-1 bg-dark-100 dark:bg-dark-800 rounded-full px-4 py-2.5 min-h-[44px] flex items-center">
            {editMode && (
              <div className="flex items-center gap-2 mr-2 pb-0.5 border-r border-dark-300 dark:border-dark-700 pr-2">
                <svg
                  className="h-4 w-4 text-primary-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="text-xs text-dark-600 dark:text-dark-400 font-medium">
                  Editando
                </span>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholderText(disabled, editMode)}
              disabled={disabled}
              rows={1}
              className="w-full resize-none bg-transparent text-sm text-dark-900 dark:text-dark-50 placeholder-dark-400 dark:placeholder-dark-500 focus:outline-none disabled:cursor-not-allowed max-h-32 overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
              }}
            />
          </div>
        )}

        {/* Right side buttons */}
        {editMode ? (
          <>
            <button
              type="button"
              onClick={handleCancel}
              className="p-2.5 rounded-full transition-colors mb-0.5 text-dark-500 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700 flex-shrink-0"
              aria-label="Cancelar"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() || disabled}
              className={`p-2.5 rounded-full transition-colors mb-0.5 flex-shrink-0 ${
                text.trim() && !disabled
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-dark-200 dark:bg-dark-800 text-dark-500 dark:text-dark-400 cursor-not-allowed'
              }`}
              aria-label="Salvar"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          </>
        ) : isRecording ? (
          /* Send button when recording */
          <button
            type="button"
            onClick={() => void stopRecording()}
            className="p-2.5 rounded-full transition-colors mb-0.5 bg-primary-500 text-white hover:bg-primary-600 flex-shrink-0"
            aria-label="Enviar áudio"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        ) : text.trim() ? (
          /* Send button when has text */
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled}
            className="p-2.5 rounded-full transition-colors mb-0.5 bg-primary-500 text-white hover:bg-primary-600 flex-shrink-0"
            aria-label="Enviar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        ) : (
          /* Mic button when no text */
          <button
            type="button"
            {...longPressProps}
            className="p-2.5 rounded-full transition-all mb-0.5 select-none bg-primary-500 text-white hover:bg-primary-600 flex-shrink-0"
            aria-label="Gravar áudio"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Alert Component */}
      {alertConfig && (
        <Alert
          isOpen={alertConfig.isOpen}
          onClose={() => setAlertConfig(null)}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
        />
      )}
    </Fragment>
  )
}
