import { useState, useEffect } from 'react'
import { AttachmentMenu } from './AttachmentMenu'
import { TextInput } from './TextInput'
import { SendButton } from './SendButton'
import { AudioRecorder } from './AudioRecorder'

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
  const [isRecording, setIsRecording] = useState(false)

  // Sync edit text
  useEffect(() => {
    if (editMode && editText !== undefined) {
      setText(editText)
    } else if (!editMode) {
      setText('')
    }
  }, [editMode, editText])

  const handleSend = () => {
    const trimmedText = text.trim()
    if (!trimmedText || disabled) return

    if (editMode && onSaveEdit) {
      onSaveEdit(trimmedText)
    } else {
      onSend(trimmedText)
    }

    setText('')
  }

  const handleCancel = () => {
    setText('')
    onCancelEdit?.()
  }

  const hasText = text.trim().length > 0

  return (
    <div className="relative flex items-end gap-2 p-4 border-t border-dark-200 dark:border-dark-800 bg-transparent">
      {/* Attach Button - hide in edit mode or recording */}
      {!editMode && !isRecording && (
        <AttachmentMenu onAttachment={onAttachment} disabled={disabled} />
      )}

      {/* Text Input - hide only when recording */}
      {!isRecording && (
        <TextInput
          value={text}
          onChange={setText}
          onSend={handleSend}
          disabled={disabled}
          editMode={editMode}
          onCancelEdit={handleCancel}
        />
      )}

      {/* Right side buttons */}
      {!editMode && (
        <>
          {hasText ? (
            <SendButton onClick={handleSend} disabled={disabled} />
          ) : (
            <AudioRecorder
              onSendAudio={onSendAudio}
              disabled={disabled}
              onRecordingChange={setIsRecording}
            />
          )}
        </>
      )}
    </div>
  )
}
