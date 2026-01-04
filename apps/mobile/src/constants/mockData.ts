import { User, UserRole } from '@minc-hub/shared/types'

export const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'admin@minc.com',
  name: 'Usuário Admin',
  role: UserRole.ADMIN,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
