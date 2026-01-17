import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ComboBox } from '@/components/ui/ComboBox'
import { Checkbox } from '@/components/ui/Checkbox'
import { User, UserRole } from '@minc-hub/shared/types'
import { ROLE_OPTIONS } from '@/lib/userUtils'

interface UserFormModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly user: User | null
  readonly people: Array<{ id: string; name: string }>
  readonly isLoading?: boolean
  readonly onSubmit: (data: Record<string, unknown>) => Promise<void>
}

export function UserFormModal({
  isOpen,
  onClose,
  user,
  people,
  isLoading = false,
  onSubmit,
}: UserFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.SERVO,
    personId: '',
    canCheckIn: false,
  })

  // Person options for ComboBox
  const personOptions = people.map(p => ({
    value: p.id,
    label: p.name,
  }))

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          password: '',
          role: user.role,
          personId: user.personId ?? '',
          canCheckIn: user.canCheckIn ?? false,
        })
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: UserRole.SERVO,
          personId: '',
          canCheckIn: false,
        })
      }
    }
  }, [isOpen, user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Editar Usuário' : 'Novo Usuário'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="space-y-1 overflow-y-auto overscroll-contain max-h-[calc(78vh-12rem)]">
          <Input
            label="Nome *"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
            {!user && (
              <Input
                label="Senha *"
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required={!user}
              />
            )}
          </div>
          <ComboBox
            label="Papel *"
            value={formData.role}
            onValueChange={val => val && setFormData({ ...formData, role: val as UserRole })}
            options={ROLE_OPTIONS}
            searchable={false}
          />
          <ComboBox
            label="Servo Vinculado (Opcional)"
            value={formData.personId}
            onValueChange={val => setFormData({ ...formData, personId: val || '' })}
            options={personOptions}
            placeholder="Selecione um servo"
            searchable
            searchPlaceholder="Buscar servo..."
            disabled={people.length === 0}
            emptyMessage="Nenhum servo encontrado"
          />
          <div className="pt-2">
            <Checkbox
              id="canCheckIn"
              label="Permitir realizar check-in (Scan QR Code)"
              checked={formData.canCheckIn}
              onChange={e => setFormData({ ...formData, canCheckIn: e.target.checked })}
              disabled={formData.role === UserRole.ADMIN}
            />
            <p className="text-xs text-dark-500 mt-1 ml-6">
              Usuários com papel Admin sempre têm permissão.
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-8 border-t border-dark-200 dark:border-dark-800 mt-8 flex-shrink-0 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {user ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
