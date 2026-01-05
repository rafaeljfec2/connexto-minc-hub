import { User, UserRole, Person, Team, Ministry, Service, Schedule, ServiceType, Church } from '@minc-hub/shared/types'

export const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'admin@minc.com',
  name: 'Usuário Admin',
  role: UserRole.ADMIN,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const MOCK_CHURCHES: Church[] = [
  {
    id: '1',
    name: 'Minha Igreja na Cidade - Sede',
    address: 'Rua Exemplo, 123 - Centro',
    phone: '(11) 3333-3333',
    email: 'contato@minhaigrejanacidade.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@minchteams.com',
    name: 'Usuário Admin',
    role: UserRole.ADMIN,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'coord@minchteams.com',
    name: 'Coordenador Teste',
    role: UserRole.COORDINATOR,
    personId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const MOCK_MINISTRIES: Ministry[] = [
  {
    id: '1',
    name: 'Time Boas-Vindas',
    description: 'Time responsável por receber e acolher visitantes',
    churchId: '1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Time de Louvor',
    description: 'Time responsável pela música e adoração',
    churchId: '1',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Equipe Manhã',
    description: 'Equipe responsável pelo culto da manhã',
    ministryId: '1',
    memberIds: ['1', '2'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Equipe Noite',
    description: 'Equipe responsável pelo culto da noite',
    ministryId: '1',
    memberIds: ['3'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Equipe Louvor',
    description: 'Equipe de música e adoração',
    ministryId: '2',
    memberIds: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const MOCK_PEOPLE: Person[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '(11) 99999-9999',
    birthDate: '1990-01-15',
    ministryId: '1',
    teamId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '(11) 88888-8888',
    birthDate: '1985-05-20',
    ministryId: '1',
    teamId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@example.com',
    phone: '(11) 77777-7777',
    birthDate: '1992-03-10',
    ministryId: '1',
    teamId: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    churchId: '1',
    type: ServiceType.SUNDAY_MORNING,
    dayOfWeek: 0,
    time: '09:00',
    name: 'Culto Dominical Manhã',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    churchId: '1',
    type: ServiceType.SUNDAY_EVENING,
    dayOfWeek: 0,
    time: '19:00',
    name: 'Culto Dominical Noite',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const MOCK_SCHEDULES: Schedule[] = [
  {
    id: '1',
    serviceId: '1',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    teamIds: ['1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    serviceId: '1',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    teamIds: ['2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
