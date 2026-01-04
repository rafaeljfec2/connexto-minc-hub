import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Person, UserRole } from '@/types'
import { ROLE_OPTIONS } from '@/lib/userUtils'

interface CreateUserFormProps {
  readonly person: Person
  readonly email: string
  readonly password: string
  readonly role: UserRole
  readonly onEmailChange: (email: string) => void
  readonly onPasswordChange: (password: string) => void
  readonly onRoleChange: (role: UserRole) => void
  readonly onSubmit: (e: React.FormEvent) => void
  readonly onCancel: () => void
  readonly isLoading?: boolean
}

export function CreateUserForm({
  person,
  email,
  password,
  role,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
  onSubmit,
  onCancel,
  isLoading = false,
}: CreateUserFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20 mb-4">
        <p className="text-sm text-primary-600 dark:text-primary-400">
          <strong>Servo:</strong> {person.name}
        </p>
      </div>
      <Input
        label="Email *"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        required
      />
      <Input
        label="Senha *"
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        required
      />
      <Select
        label="Papel *"
        value={role}
        onChange={(e) => onRoleChange(e.target.value as UserRole)}
        options={ROLE_OPTIONS}
      />
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Criar Usuário
        </Button>
      </div>
    </form>
  )
}
