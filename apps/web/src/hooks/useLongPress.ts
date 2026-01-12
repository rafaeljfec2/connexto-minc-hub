import { useCallback, useRef, useState } from 'react'

interface LongPressOptions {
  threshold?: number
  onStart?: (event: React.TouchEvent | React.MouseEvent) => void
  onFinish?: (event: React.TouchEvent | React.MouseEvent) => void
  onCancel?: (event: React.TouchEvent | React.MouseEvent) => void
}

export function useLongPress(
  callback: (event: React.TouchEvent | React.MouseEvent) => void,
  options: LongPressOptions = {}
) {
  const { threshold = 500, onStart, onFinish, onCancel } = options
  const [isLongPress, setIsLongPress] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const targetRef = useRef<EventTarget | null>(null)

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      // Prevent recurring events
      if (isLongPress) return

      if (event.type === 'mousedown' || event.type === 'touchstart') {
        targetRef.current = event.target
        onStart?.(event)

        timeoutRef.current = setTimeout(() => {
          setIsLongPress(true)
          callback(event)
        }, threshold)
      }
    },
    [callback, threshold, onStart, isLongPress]
  )

  const clear = useCallback(
    (event: React.TouchEvent | React.MouseEvent, shouldTriggerFinish = true) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (shouldTriggerFinish && isLongPress) {
        onFinish?.(event)
      } else if (!isLongPress) {
        onCancel?.(event)
      }

      setIsLongPress(false)
      targetRef.current = null
    },
    [isLongPress, onFinish, onCancel]
  )

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
  }
}
