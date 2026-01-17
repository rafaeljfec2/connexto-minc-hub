export enum UserRole {
  ADMIN = 'admin',
  PASTOR = 'pastor',
  LIDER_DE_TIME = 'lider_de_time',
  LIDER_DE_EQUIPE = 'lider_de_equipe',
  SERVO = 'servo',
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  personId?: string
  avatar?: string | null
  canCheckIn: boolean
  createdAt: string
  updatedAt: string
}

export enum MemberType {
  FIXED = 'fixed',
  EVENTUAL = 'eventual',
}

export interface TeamMember {
  id: string
  teamId: string
  personId: string
  memberType: MemberType
  createdAt: string
  team?: Team
}

export interface Person {
  id: string
  name: string
  email?: string
  phone?: string
  birthDate?: string
  address?: string
  notes?: string
  avatar?: string | null
  ministryId?: string
  teamId?: string
  teamMembers?: TeamMember[]
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  name: string
  description?: string
  ministryId: string
  leaderId?: string
  memberIds: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Ministry {
  id: string
  name: string
  description?: string
  churchId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Church {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  createdAt: string
  updatedAt: string
}

export enum ServiceType {
  SUNDAY_MORNING = 'sunday_morning',
  SUNDAY_EVENING = 'sunday_evening',
  WEDNESDAY = 'wednesday',
  FRIDAY = 'friday',
  SPECIAL = 'special',
}

export interface Service {
  id: string
  churchId: string
  type: ServiceType
  dayOfWeek: number
  time: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Schedule {
  id: string
  serviceId: string
  date: string
  teamIds: string[]
  createdAt: string
  updatedAt: string
}

export interface GuestVolunteer {
  id: string
  scheduleId: string
  personId: string
  person?: Person
  addedBy: string
  createdAt: string
}

export interface Attendance {
  id: string
  scheduleId: string
  personId: string
  checkedInBy: string
  checkedInAt: string
  method: 'qr_code' | 'manual'
  qrCodeData?: Record<string, unknown> | null
  absenceReason?: string | null
  createdAt: string
  updatedAt: string
}

export interface QrCodeData {
  scheduleId: string
  personId: string
  serviceId: string
  date: string
  timestamp: number
}

export interface GenerateQrCodeResponse {
  qrCode: string
  schedule: {
    id: string
    serviceId: string
    date: string
  }
  expiresAt: string
}

export interface ScheduleReassignment {
  id: string
  scheduleId: string
  fromTeamId: string
  toTeamId: string
  personId: string
  reason?: string
  createdBy: string
  createdAt: string
}

export interface SchedulePlanningConfig {
  id: string
  churchId: string
  maxTeamMembers: number
  servicesPerSunday: number
  teamsServeOncePerMonth: boolean
  enableLotteryForExtraServices: boolean
  enableTimeRotation: boolean
  createdAt: string
  updatedAt: string
}

export interface TeamPlanningConfig {
  id: string
  teamId: string
  maxTeamMembers: number | null
  teamsServeOncePerMonth: boolean | null
  enableLotteryForExtraServices: boolean | null
  enableTimeRotation: boolean | null
  createdAt: string
  updatedAt: string
}

export interface SchedulePlanningTemplate {
  id: string
  name: string
  description?: string | null
  isSystemTemplate: boolean
  createdByChurchId?: string | null
  maxTeamMembers: number
  servicesPerSunday: number
  teamsServeOncePerMonth: boolean
  enableLotteryForExtraServices: boolean
  enableTimeRotation: boolean
  createdAt: string
  updatedAt: string
}

export interface ChatUser {
  id: string
  name: string
  avatar?: string | null
  isOnline?: boolean
  role?: string
}

export interface MessageAttachment {
  url: string
  name: string
  type: string
  size: number
}

export interface Message {
  id: string
  text: string
  senderId: string
  timestamp: string // ISO 8601
  read: boolean
  conversationId: string
  createdAt: string
  updatedAt: string
  isEdited?: boolean
  deletedForEveryone?: boolean
  deletedBy?: string[]
  // Attachment fields
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentType?: string | null
  attachmentSize?: number | null
  sender?: ChatUser
}

export interface Conversation {
  id: string
  type: 'private' | 'group'
  name?: string
  createdBy?: string
  participants: ChatUser[]
  lastMessage: Message | null
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export * from './api-response'
