import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { sanitizeUrl, isValidUrl } from '@/lib/sanitize'

interface AudioPreviewProps {
  readonly url: string
  readonly duration?: number
  readonly timestamp?: string
  readonly isRead?: boolean
  readonly isSent?: boolean
  readonly avatarUrl?: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function AudioPreview({
  url,
  duration,
  timestamp,
  isRead = false,
  isSent = true,
  avatarUrl,
}: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(duration || 0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    const audio = audioRef.current
    if (!audio || !audioDuration) return

    if ('clientX' in e) {
      // Mouse event
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      const newTime = percentage * audioDuration

      audio.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSeek(e)
    }
  }

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0

  // Generate waveform bars (simplified - in production, use actual audio data)
  const waveformBars = Array.from({ length: 40 }, (_, i) => {
    const height = Math.sin(i * 0.5) * 30 + 50 // Simulated waveform
    return height
  })

  const sanitizedUrl = sanitizeUrl(url)
  const sanitizedAvatarUrl = avatarUrl ? sanitizeUrl(avatarUrl) : null

  if (!sanitizedUrl || !isValidUrl(sanitizedUrl)) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 min-w-[280px] max-w-[340px]">
        <span className="text-sm text-dark-500 dark:text-dark-400">
          Áudio inválido ou não permitido
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 min-w-[280px] max-w-[340px]">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={sanitizedUrl} preload="metadata">
        <track kind="captions" />
      </audio>

      {/* Avatar (optional) */}
      {sanitizedAvatarUrl && isValidUrl(sanitizedAvatarUrl) && (
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <img src={sanitizedAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center flex-shrink-0 transition-colors"
        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
      </button>

      {/* Waveform and Progress */}
      <div className="flex-1 flex flex-col gap-1">
        {/* Waveform */}
        <div
          className="flex items-center gap-0.5 h-8 cursor-pointer"
          onClick={handleSeek}
          onKeyDown={handleKeyDown}
          role="button"
          aria-label="Barra de progresso do áudio"
          tabIndex={0}
        >
          {waveformBars.map((height, i) => {
            const barProgress = (i / waveformBars.length) * 100
            const isActive = barProgress <= progress

            return (
              <div
                key={`waveform-bar-${i}`}
                className={`w-0.5 rounded-full transition-colors ${
                  isActive ? 'bg-primary-500 dark:bg-primary-400' : 'bg-dark-300 dark:bg-dark-600'
                }`}
                style={{
                  height: `${height}%`,
                }}
              />
            )
          })}
        </div>

        {/* Duration */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-dark-600 dark:text-dark-400">
            {formatTime(isPlaying ? currentTime : audioDuration)}
          </span>
        </div>
      </div>

      {/* Timestamp and Read Status */}
      <div className="flex items-center gap-1 text-xs text-dark-500 dark:text-dark-400 flex-shrink-0">
        {timestamp && <span>{timestamp}</span>}
        {isSent && (
          <svg
            className={`h-4 w-4 ${isRead ? 'text-blue-500' : 'text-dark-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" />
          </svg>
        )}
      </div>
    </div>
  )
}
