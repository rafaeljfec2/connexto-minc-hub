export enum UserRole {
  PASTOR = "PASTOR",
  LIDER_DE_TIME = "lider_de_time",
  LIDER_DE_EQUIPE = "lider_de_equipe",
  SERVO = "servo",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  personId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  notes?: string;
  ministryId?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ministryId: string;
  leaderId?: string;
  memberIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Ministry {
  id: string;
  name: string;
  description?: string;
  churchId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Church {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ServiceType {
  SUNDAY_MORNING = "sunday_morning",
  SUNDAY_EVENING = "sunday_evening",
  WEDNESDAY = "wednesday",
  FRIDAY = "friday",
  SPECIAL = "special",
}

export interface Service {
  id: string;
  churchId: string;
  type: ServiceType;
  dayOfWeek: number;
  time: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  serviceId: string;
  date: string;
  teamIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  scheduleId: string;
  personId: string;
  isPresent: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleReassignment {
  id: string;
  scheduleId: string;
  fromTeamId: string;
  toTeamId: string;
  personId: string;
  reason?: string;
  createdBy: string;
  createdAt: string;
}
