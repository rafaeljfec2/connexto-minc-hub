import { useState, useCallback } from 'react'
import { useModal } from './useModal'

interface CrudOperations<T> {
  readonly create: (item: Partial<T>) => void
  readonly update: (id: string, item: Partial<T>) => void
  readonly remove: (id: string) => void
}

interface UseCrudFormOptions<T extends { id: string }, F> {
  readonly crud: CrudOperations<T>
  readonly initialFormData: F
  readonly resetFormData: () => F
  readonly mapToFormData: (item: T) => F
}

export function useCrudForm<T extends { id: string }, F extends Record<string, unknown>>({
  crud,
  initialFormData,
  resetFormData,
  mapToFormData,
}: UseCrudFormOptions<T, F>) {
  const modal = useModal()
  const deleteModal = useModal()
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<F>(initialFormData)

  const handleOpenModal = useCallback(
    (item?: T) => {
      if (item) {
        setEditingItem(item)
        setFormData(mapToFormData(item))
      } else {
        setEditingItem(null)
        setFormData(resetFormData())
      }
      modal.open()
    },
    [mapToFormData, modal, resetFormData],
  )

  const handleCloseModal = useCallback(() => {
    modal.close()
    setEditingItem(null)
    setFormData(resetFormData())
  }, [modal, resetFormData])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (editingItem) {
        crud.update(editingItem.id, formData as Partial<T>)
      } else {
        crud.create(formData as Partial<T>)
      }

      handleCloseModal()
    },
    [crud, editingItem, formData, handleCloseModal],
  )

  const handleDeleteClick = useCallback(
    (id: string) => {
      setDeletingId(id)
      deleteModal.open()
    },
    [deleteModal],
  )

  const handleDeleteConfirm = useCallback(() => {
    if (deletingId) {
      crud.remove(deletingId)
      setDeletingId(null)
    }
  }, [crud, deletingId])

  return {
    modal,
    deleteModal,
    editingItem,
    deletingId,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDeleteClick,
    handleDeleteConfirm,
  }
}
