import { useState, useRef, useCallback } from 'react'
import { Mic } from 'lucide-react'
import { useLongPress } from '@/hooks/useLongPress'
import { Alert, AlertType } from '@/components/ui/Alert'
import { AudioRecorderUI } from './AudioRecorderUI'

interface AudioRecorderProps {
  readonly onSendAudio?: (file: Blob, duration: number) => Promise<void>
  readonly disabled?: boolean
}

export function AudioRecorder({
  onSendAudio,
  disabled,
  onRecordingChange,
}: AudioRecorderProps & { onRecordingChange?: (isRecording: boolean) => void }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean
    type: AlertType
    title: string
    message: string
  } | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startTimeRef = useRef<number>(0)
  const recordingSessionIdRef = useRef<number>(0)
  const isCancelledRef = useRef(false)

  // Notify parent about recording state
  const setRecordingState = useCallback(
    (recording: boolean) => {
      setIsRecording(recording)
      onRecordingChange?.(recording)
    },
    [onRecordingChange]
  )

  const startRecording = useCallback(async () => {
    const currentSessionId = ++recordingSessionIdRef.current
    isCancelledRef.current = false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      if (recordingSessionIdRef.current !== currentSessionId) {
        stream.getTracks().forEach(track => track.stop())
        return
      }

      audioChunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop())

        if (!isCancelledRef.current && audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)

          if (audioBlob.size > 0 && onSendAudio) {
            try {
              await onSendAudio(audioBlob, duration)
            } catch (error) {
              console.error('Failed to send audio:', error)
            }
          }
        }

        audioChunksRef.current = []
        setRecordingDuration(0)
      }

      mediaRecorder.start()
      setRecordingState(true)
      startTimeRef.current = Date.now()

      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setRecordingDuration(elapsed)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Erro ao acessar microfone',
        message: 'Não foi possível acessar o microfone. Verifique as permissões do navegador.',
      })

      if (recordingSessionIdRef.current === currentSessionId) {
        setRecordingState(false)
        setRecordingDuration(0)
      }
    }
  }, [onSendAudio, setRecordingState])

  const stopRecording = useCallback(async () => {
    isCancelledRef.current = false

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    setRecordingState(false)
  }, [setRecordingState])

  const cancelRecording = useCallback(() => {
    isCancelledRef.current = true

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    audioChunksRef.current = []
    setRecordingState(false)
    setRecordingDuration(0)
  }, [setRecordingState])

  const longPressProps = useLongPress(
    () => {
      // This callback is triggered when long press threshold is reached
      // The actual recording start is handled in onStart
    },
    {
      onStart: startRecording,
      onFinish: stopRecording,
      onCancel: cancelRecording,
      threshold: 200,
    }
  )

  return (
    <>
      {isRecording ? (
        <AudioRecorderUI
          duration={recordingDuration}
          onCancel={cancelRecording}
          onSend={() => void stopRecording()}
        />
      ) : (
        <button
          type="button"
          {...longPressProps}
          disabled={disabled}
          className="p-2.5 rounded-full transition-all mb-0.5 select-none bg-primary-500 text-white hover:bg-primary-600 flex-shrink-0"
          aria-label="Gravar áudio"
        >
          <Mic className="h-5 w-5" />
        </button>
      )}

      {alertConfig && (
        <Alert
          isOpen={alertConfig.isOpen}
          onClose={() => setAlertConfig(null)}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
        />
      )}
    </>
  )
}
