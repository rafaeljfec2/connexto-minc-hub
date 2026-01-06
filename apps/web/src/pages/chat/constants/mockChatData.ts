export interface Message {
  id: string
  text: string
  senderId: string
  timestamp: string
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

export const MOCK_MESSAGES: Record<string, Message[]> = {
  conv1: [
    {
      id: 'm1',
      text: 'Olá Rafael, tudo bem?',
      senderId: 'user1',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'm2',
      text: 'Oi Ana! Tudo ótimo e com você?',
      senderId: 'me',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60000).toISOString(),
      read: true,
    },
    {
      id: 'm3',
      text: 'Precisamos alinhar a escala de domingo.',
      senderId: 'user1',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 120000).toISOString(),
      read: false,
    },
  ],
  conv2: [
    {
      id: 'm4',
      text: 'O ensaio foi confirmado?',
      senderId: 'user2',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 'm5',
      text: 'Sim, às 19h no salão principal.',
      senderId: 'me',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 300000).toISOString(),
      read: true,
    },
  ],
  conv3: [
    {
      id: 'm6',
      text: 'Pessoal, a lista de músicas já está no drive.',
      senderId: 'user3',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ],
}

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
