import { themeColors } from '@/theme'

export interface Message {
  id: string
  text: string
  senderId: string
  timestamp: string // ISO string
  read: boolean
}

export interface User {
  id: string
  name: string
  avatar: string
  isOnline: boolean
}

export interface Conversation {
  id: string
  participants: User[]
  lastMessage: Message
  unreadCount: number
}

// Mock Users
export const MOCK_USERS: Record<string, User> = {
  me: {
    id: 'me',
    name: 'Rafael',
    avatar: 'https://i.pravatar.cc/150?u=rafael',
    isOnline: true,
  },
  user1: {
    id: 'user1',
    name: 'Ana Silva',
    avatar: 'https://i.pravatar.cc/150?u=ana',
    isOnline: true,
  },
  user2: {
    id: 'user2',
    name: 'Carlos Oliveira',
    avatar: 'https://i.pravatar.cc/150?u=carlos',
    isOnline: false,
  },
  user3: {
    id: 'user3',
    name: 'Equipe de Louvor',
    avatar: 'https://ui-avatars.com/api/?name=Equipe+Louvor&background=random',
    isOnline: true,
  },
}

// Mock Messages
export const MOCK_MESSAGES: Record<string, Message[]> = {
  conv1: [
    {
      id: 'm1',
      text: 'Olá Rafael, tudo bem?',
      senderId: 'user1',
      timestamp: '2024-03-10T10:30:00Z',
      read: true,
    },
    {
      id: 'm2',
      text: 'Oi Ana! Tudo ótimo e com você?',
      senderId: 'me',
      timestamp: '2024-03-10T10:31:00Z',
      read: true,
    },
    {
      id: 'm3',
      text: 'Precisamos alinhar a escala de domingo.',
      senderId: 'user1',
      timestamp: '2024-03-10T10:32:00Z',
      read: false,
    },
  ],
  conv2: [
    {
      id: 'm4',
      text: 'O ensaio foi confirmado?',
      senderId: 'user2',
      timestamp: '2024-03-09T18:00:00Z',
      read: true,
    },
    {
      id: 'm5',
      text: 'Sim, às 19h no salão principal.',
      senderId: 'me',
      timestamp: '2024-03-09T18:05:00Z',
      read: true,
    },
  ],
  conv3: [
    {
      id: 'm6',
      text: 'Pessoal, a lista de músicas já está no drive.',
      senderId: 'user3',
      timestamp: '2024-03-08T09:00:00Z',
      read: true,
    },
  ],
}

// Mock Conversations
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    participants: [MOCK_USERS.user1],
    lastMessage: MOCK_MESSAGES.conv1[2],
    unreadCount: 1,
  },
  {
    id: 'conv2',
    participants: [MOCK_USERS.user2],
    lastMessage: MOCK_MESSAGES.conv2[1],
    unreadCount: 0,
  },
  {
    id: 'conv3',
    participants: [MOCK_USERS.user3],
    lastMessage: MOCK_MESSAGES.conv3[0],
    unreadCount: 0,
  },
]
