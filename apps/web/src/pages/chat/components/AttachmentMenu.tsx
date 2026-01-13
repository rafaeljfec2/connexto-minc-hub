import { useState, useRef, useEffect } from 'react'
import { Camera, Image, FileText, MapPin, X } from 'lucide-react'

interface AttachmentOption {
  id: 'camera' | 'gallery' | 'document' | 'location'
  label: string
  icon: React.ReactNode
  color: string
  accept?: string
}

interface AttachmentMenuProps {
  readonly onAttachment?: (
    type: 'camera' | 'gallery' | 'document' | 'location',
    file?: File
  ) => void
  readonly disabled?: boolean
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

export function AttachmentMenu({ onAttachment, disabled }: AttachmentMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [currentAccept, setCurrentAccept] = useState<string>('')
  const [currentAttachType, setCurrentAttachType] = useState<AttachmentOption['id'] | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleAttachmentClick = (option: AttachmentOption) => {
    if (option.id === 'location') {
      onAttachment?.(option.id)
      setShowMenu(false)
      return
    }

    setCurrentAccept(option.accept || '')
    setCurrentAttachType(option.id)
    setShowMenu(false)
    setTimeout(() => fileInputRef.current?.click(), 100)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && currentAttachType) {
      onAttachment?.(currentAttachType, file)
    }
    event.target.value = ''
    setCurrentAttachType(null)
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={currentAccept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Attachment Menu Popup */}
      {showMenu && (
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
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled}
        className={`p-2.5 rounded-full transition-all mb-0.5 flex-shrink-0 ${
          showMenu
            ? 'bg-primary-500 text-white rotate-45'
            : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
        }`}
        aria-label="Anexar"
      >
        {showMenu ? (
          <X className="h-6 w-6" />
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    </>
  )
}
