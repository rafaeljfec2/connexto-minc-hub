import { useState, useCallback } from 'react'

interface UseModalReturn {
  visible: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export function useModal(): UseModalReturn {
  const [visible, setVisible] = useState(false)

  const open = useCallback(() => {
    setVisible(true)
  }, [])

  const close = useCallback(() => {
    setVisible(false)
  }, [])

  const toggle = useCallback(() => {
    setVisible(prev => !prev)
  }, [])

  return {
    visible,
    open,
    close,
    toggle,
  }
}
