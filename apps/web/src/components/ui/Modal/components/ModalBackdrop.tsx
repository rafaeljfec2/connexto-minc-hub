interface ModalBackdropProps {
  readonly onClose: () => void
}

export function ModalBackdrop({ onClose }: ModalBackdropProps) {
  return (
    <button
      type="button"
      className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm animate-fade-in cursor-pointer"
      onClick={onClose}
      onTouchStart={onClose}
      aria-label="Fechar modal"
      tabIndex={-1}
    />
  )
}
