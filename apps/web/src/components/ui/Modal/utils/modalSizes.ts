export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export const MODAL_SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
}
