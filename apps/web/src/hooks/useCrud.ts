import { useState, useCallback } from 'react'

interface UseCrudOptions<T> {
  initialItems?: T[]
  onCreate?: (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T> | T
  onUpdate?: (id: string, item: Partial<T>) => Promise<T> | T
  onDelete?: (id: string) => Promise<void> | void
}

interface UseCrudReturn<T> {
  items: T[]
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  create: (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  update: (id: string, item: Partial<T>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export function useCrud<T extends { id: string; createdAt: string; updatedAt: string }>({
  initialItems = [],
  onCreate,
  onUpdate,
  onDelete,
}: UseCrudOptions<T> = {}): UseCrudReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems)

  const create = useCallback(
    async (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (onCreate) {
        const newItem = await onCreate(item)
        setItems((prev) => [...prev, newItem])
      } else {
        const newItem = {
          ...item,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as T
        setItems((prev) => [...prev, newItem])
      }
    },
    [onCreate]
  )

  const update = useCallback(
    async (id: string, item: Partial<T>) => {
      if (onUpdate) {
        const updatedItem = await onUpdate(id, item)
        setItems((prev) =>
          prev.map((i) => (i.id === id ? updatedItem : i))
        )
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, ...item, updatedAt: new Date().toISOString() }
              : i
          )
        )
      }
    },
    [onUpdate]
  )

  const remove = useCallback(
    async (id: string) => {
      if (onDelete) {
        await onDelete(id)
      }
      setItems((prev) => prev.filter((i) => i.id !== id))
    },
    [onDelete]
  )

  return {
    items,
    setItems,
    create,
    update,
    remove,
  }
}
