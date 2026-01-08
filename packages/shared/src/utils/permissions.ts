import { User, UserRole } from '../types'

export function canUserCheckIn(user?: User | null): boolean {
  if (!user) return false
  return user.role === UserRole.ADMIN || !!user.canCheckIn
}
