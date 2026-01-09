import { useState, useRef, useEffect } from 'react'
import { Camera, Image, FileText, MapPin, X } from 'lucide-react'

interface ChatInputProps {
  readonly onSend: (text: string) => void
  readonly onAttachment?: (type: 'camera' | 'gallery' | 'document' | 'location', file?: File) => void
}

interface AttachmentOption {
  id: 'camera' | 'gallery' | 'document' | 'location'
  label: string
  icon: React.ReactNode
  color: string
  accept?: string
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

export function ChatInput({ onSend, onAttachment }: ChatInputProps) {
  const [text, setText] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [currentAccept, setCurrentAccept] = useState<string>('')
  const [currentAttachType, setCurrentAttachType] = useState<AttachmentOption['id'] | null>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [text])

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
      onSend(text)
      setText('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
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
            alert('Não foi possível obter sua localização. Verifique as permissões.')
          }
        )
      } else {
        alert('Geolocalização não é suportada neste navegador.')
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

      {/* Attach Button */}
      <button
        type="button"
        onClick={() => setShowAttachMenu(!showAttachMenu)}
        className={`p-2.5 rounded-full transition-all mb-0.5 ${
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>

      <div className="flex-1 bg-dark-100 dark:bg-dark-800 rounded-2xl px-4 py-3 min-h-[44px]">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma mensagem..."
          className="w-full bg-transparent text-dark-900 dark:text-dark-50 placeholder:text-dark-500 dark:placeholder:text-dark-400 text-sm resize-none outline-none max-h-[120px] overflow-y-auto block"
          rows={1}
          maxLength={500}
        />
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={!text.trim()}
        className={`p-2.5 rounded-full transition-colors mb-0.5 ${
          text.trim()
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-dark-200 dark:bg-dark-800 text-dark-500 dark:text-dark-400 cursor-not-allowed'
        }`}
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
    </div>
  )
}
