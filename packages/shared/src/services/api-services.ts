import type { AxiosInstance } from 'axios'
import type {
  Person,
  Team,
  Service,
  Schedule,
  Attendance,
  Church,
  Ministry,
  User,
  ApiResponse,
  SchedulePlanningConfig,
  TeamPlanningConfig,
  SchedulePlanningTemplate,
} from '../types'

type CreateEntity<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Helper function to extract array data from ApiResponse
 */
function extractArrayData<T>(response: unknown): T[] {
  if (response && typeof response === 'object' && 'success' in response) {
    const apiResponse = response as ApiResponse<T[]>
    return apiResponse.data ?? []
  }
  return (response as T[]) ?? []
}

/**
 * Helper function to extract single entity data from ApiResponse
 */
function extractEntityData<T>(response: unknown, errorMessage: string): T {
  if (response && typeof response === 'object' && 'success' in response) {
    const apiResponse = response as ApiResponse<T>
    if (!apiResponse.data) {
      throw new Error(errorMessage)
    }
    return apiResponse.data
  }
  const entity = response as T
  if (!entity) {
    throw new Error(errorMessage)
  }
  return entity
}

export function createApiServices(api: AxiosInstance) {
  return {
    peopleService: {
      getAll: () =>
        api.get<ApiResponse<Person[]>>('/persons').then(res => extractArrayData<Person>(res.data)),
      getById: (id: string) =>
        api
          .get<ApiResponse<Person>>(`/persons/${id}`)
          .then(res => extractEntityData<Person>(res.data, 'Person not found')),
      create: (data: CreateEntity<Person>) =>
        api
          .post<ApiResponse<Person>>('/persons', data)
          .then(res => extractEntityData<Person>(res.data, 'Failed to create person')),
      update: (id: string, data: Partial<Person>) =>
        api
          .patch<ApiResponse<Person>>(`/persons/${id}`, data)
          .then(res => extractEntityData<Person>(res.data, 'Failed to update person')),
      delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/persons/${id}`).then(() => {
          // Delete doesn't return data
        }),
    },

    teamsService: {
      getAll: (ministryId?: string) =>
        api
          .get<ApiResponse<Team[]>>('/teams', {
            params: ministryId ? { ministryId } : undefined,
          })
          .then(res => extractArrayData<Team>(res.data)),
      getById: (id: string) =>
        api
          .get<ApiResponse<Team>>(`/teams/${id}`)
          .then(res => extractEntityData<Team>(res.data, 'Team not found')),
      getMembers: (id: string) =>
        api
          .get<
            ApiResponse<Array<{ id: string; teamId: string; personId: string; person: Person }>>
          >(`/teams/${id}/members`)
          .then(res => {
            const members = extractArrayData<{
              id: string
              teamId: string
              personId: string
              person: Person
            }>(res.data)
            // Retornar array de personIds
            return members.map(m => m.personId)
          }),
      create: (data: Omit<CreateEntity<Team>, 'memberIds'>) =>
        api
          .post<ApiResponse<Team>>('/teams', data)
          .then(res => extractEntityData<Team>(res.data, 'Failed to create team')),
      update: (id: string, data: Partial<Omit<Team, 'memberIds'>>) =>
        api
          .patch<ApiResponse<Team>>(`/teams/${id}`, data)
          .then(res => extractEntityData<Team>(res.data, 'Failed to update team')),
      delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/teams/${id}`).then(() => {
          // Delete doesn't return data
        }),
    },

    servicesService: {
      getAll: (churchId?: string) =>
        api
          .get<ApiResponse<Service[]>>('/services', {
            params: churchId ? { churchId } : undefined,
          })
          .then(res => extractArrayData<Service>(res.data)),
      getById: (id: string) =>
        api
          .get<ApiResponse<Service>>(`/services/${id}`)
          .then(res => extractEntityData<Service>(res.data, 'Service not found')),
      create: (data: CreateEntity<Service>) =>
        api
          .post<ApiResponse<Service>>('/services', data)
          .then(res => extractEntityData<Service>(res.data, 'Failed to create service')),
      update: (id: string, data: Partial<Service>) =>
        api
          .patch<ApiResponse<Service>>(`/services/${id}`, data)
          .then(res => extractEntityData<Service>(res.data, 'Failed to update service')),
      delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/services/${id}`).then(() => {
          // Delete doesn't return data
        }),
    },

    schedulesService: {
      getAll: (serviceId?: string, startDate?: string, endDate?: string) =>
        api
          .get<ApiResponse<Schedule[]>>('/schedules', {
            params: {
              ...(serviceId && { serviceId }),
              ...(startDate && { startDate }),
              ...(endDate && { endDate }),
            },
          })
          .then(res => {
            const schedules = extractArrayData<Schedule>(res.data)
            // Extract teamIds from scheduleTeams relationship if present
            return schedules.map(schedule => {
              if ('scheduleTeams' in schedule && Array.isArray((schedule as any).scheduleTeams)) {
                return {
                  ...schedule,
                  teamIds: (schedule as any).scheduleTeams
                    .map((st: any) => st.teamId || st.team?.id)
                    .filter(Boolean),
                }
              }
              return schedule
            })
          }),
      getById: (id: string) =>
        api.get<ApiResponse<Schedule>>(`/schedules/${id}`).then(res => {
          const schedule = extractEntityData<Schedule>(res.data, 'Schedule not found')
          // Extract teamIds from scheduleTeams relationship if present
          if ('scheduleTeams' in schedule && Array.isArray((schedule as any).scheduleTeams)) {
            return {
              ...schedule,
              teamIds: (schedule as any).scheduleTeams
                .map((st: any) => st.teamId || st.team?.id)
                .filter(Boolean),
            }
          }
          return schedule
        }),
      create: (data: CreateEntity<Schedule>) =>
        api.post<ApiResponse<Schedule>>('/schedules', data).then(res => {
          const schedule = extractEntityData<Schedule>(res.data, 'Failed to create schedule')
          // Extract teamIds from scheduleTeams relationship if present
          if ('scheduleTeams' in schedule && Array.isArray((schedule as any).scheduleTeams)) {
            return {
              ...schedule,
              teamIds: (schedule as any).scheduleTeams
                .map((st: any) => st.teamId || st.team?.id)
                .filter(Boolean),
            }
          }
          return schedule
        }),
      update: (id: string, data: Partial<Schedule>) =>
        api.patch<ApiResponse<Schedule>>(`/schedules/${id}`, data).then(res => {
          const schedule = extractEntityData<Schedule>(res.data, 'Failed to update schedule')
          // Extract teamIds from scheduleTeams relationship if present
          if ('scheduleTeams' in schedule && Array.isArray((schedule as any).scheduleTeams)) {
            return {
              ...schedule,
              teamIds: (schedule as any).scheduleTeams
                .map((st: any) => st.teamId || st.team?.id)
                .filter(Boolean),
            }
          }
          return schedule
        }),
      delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/schedules/${id}`).then(() => {
          // Delete doesn't return data
        }),
    },

    attendanceService: {
      getBySchedule: (scheduleId: string) =>
        api.get<Attendance[]>(`/attendance/schedule/${scheduleId}`),
      mark: (data: CreateEntity<Attendance>) => api.post<Attendance>('/attendance', data),
      update: (id: string, data: Partial<Attendance>) =>
        api.put<Attendance>(`/attendance/${id}`, data),
    },

    communicationService: {
      send: (data: {
        title: string
        content: string
        recipients: { type: 'all' | 'team' | 'person'; ids: string[] }
      }) => api.post('/communication/send', data),
      getHistory: () => api.get('/communication/history'),
    },

    churchesService: {
      getAll: () =>
        api.get<ApiResponse<Church[]>>('/churches').then(res => extractArrayData<Church>(res.data)),
      getById: (id: string) =>
        api
          .get<ApiResponse<Church>>(`/churches/${id}`)
          .then(res => extractEntityData<Church>(res.data, 'Church not found')),
      create: (data: CreateEntity<Church>) =>
        api
          .post<ApiResponse<Church>>('/churches', data)
          .then(res => extractEntityData<Church>(res.data, 'Failed to create church')),
      update: (id: string, data: Partial<Church>) =>
        api
          .patch<ApiResponse<Church>>(`/churches/${id}`, data)
          .then(res => extractEntityData<Church>(res.data, 'Church not found')),
      delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/churches/${id}`).then(() => {
          // Delete doesn't return data
        }),
    },

    ministriesService: {
      getAll: (churchId?: string) =>
        api
          .get<ApiResponse<Ministry[]>>('/ministries', {
            params: churchId ? { churchId } : undefined,
          })
          .then(res => extractArrayData<Ministry>(res.data)),
      getById: (id: string) =>
        api
          .get<ApiResponse<Ministry>>(`/ministries/${id}`)
          .then(res => extractEntityData<Ministry>(res.data, 'Ministry not found')),
      create: (data: CreateEntity<Ministry>) =>
        api
          .post<ApiResponse<Ministry>>('/ministries', data)
          .then(res => extractEntityData<Ministry>(res.data, 'Failed to create ministry')),
      update: (id: string, data: Partial<Ministry>) =>
        api
          .patch<ApiResponse<Ministry>>(`/ministries/${id}`, data)
          .then(res => extractEntityData<Ministry>(res.data, 'Ministry not found')),
      delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/ministries/${id}`).then(() => {
          // Delete doesn't return data
        }),
    },

    usersService: {
      getAll: () =>
        api.get<ApiResponse<User[]>>('/users').then(res => extractArrayData<User>(res.data)),
      getById: (id: string) =>
        api
          .get<ApiResponse<User>>(`/users/${id}`)
          .then(res => extractEntityData<User>(res.data, 'User not found')),
      create: (
        data: Omit<CreateEntity<User>, 'canCheckIn'> & { password: string; canCheckIn?: boolean }
      ) =>
        api
          .post<ApiResponse<User>>('/users', data)
          .then(res => extractEntityData<User>(res.data, 'Failed to create user')),
      update: (id: string, data: Partial<User>) =>
        api
          .patch<ApiResponse<User>>(`/users/${id}`, data)
          .then(res => extractEntityData<User>(res.data, 'Failed to update user')),
      delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/users/${id}`).then(() => {
          // Delete doesn't return data
        }),
    },

    schedulePlanningService: {
      getConfig: (churchId: string) =>
        api
          .get<ApiResponse<SchedulePlanningConfig | null>>(`/schedule-planning/config/${churchId}`)
          .then(res => {
            if (res.data && typeof res.data === 'object' && 'success' in res.data) {
              const apiResponse = res.data as ApiResponse<SchedulePlanningConfig | null>
              return apiResponse.data ?? null
            }
            return (res.data as SchedulePlanningConfig | null) ?? null
          }),
      createOrUpdateConfig: (
        churchId: string,
        data: Partial<CreateEntity<SchedulePlanningConfig>>
      ) =>
        api
          .post<ApiResponse<SchedulePlanningConfig>>(`/schedule-planning/config/${churchId}`, data)
          .then(res =>
            extractEntityData<SchedulePlanningConfig>(res.data, 'Failed to save config')
          ),
      getTeamConfig: (teamId: string) =>
        api
          .get<ApiResponse<TeamPlanningConfig | null>>(`/schedule-planning/team/${teamId}/config`)
          .then(res => {
            if (res.data && typeof res.data === 'object' && 'success' in res.data) {
              const apiResponse = res.data as ApiResponse<TeamPlanningConfig | null>
              return apiResponse.data ?? null
            }
            return (res.data as TeamPlanningConfig | null) ?? null
          }),
      createOrUpdateTeamConfig: (teamId: string, data: Partial<CreateEntity<TeamPlanningConfig>>) =>
        api
          .post<ApiResponse<TeamPlanningConfig>>(`/schedule-planning/team/${teamId}/config`, data)
          .then(res =>
            extractEntityData<TeamPlanningConfig>(res.data, 'Failed to save team config')
          ),
      getTemplates: (churchId?: string) =>
        api
          .get<ApiResponse<SchedulePlanningTemplate[]>>('/schedule-planning/templates', {
            params: churchId ? { churchId } : undefined,
          })
          .then(res => extractArrayData<SchedulePlanningTemplate>(res.data)),
      createTemplate: (data: CreateEntity<SchedulePlanningTemplate> & { churchId: string }) =>
        api
          .post<ApiResponse<SchedulePlanningTemplate>>('/schedule-planning/templates', data)
          .then(res =>
            extractEntityData<SchedulePlanningTemplate>(res.data, 'Failed to create template')
          ),
      applyTemplate: (templateId: string, churchId: string) =>
        api
          .post<ApiResponse<SchedulePlanningConfig>>(
            `/schedule-planning/templates/${templateId}/apply`,
            {
              churchId,
            }
          )
          .then(res =>
            extractEntityData<SchedulePlanningConfig>(res.data, 'Failed to apply template')
          ),
      deleteTemplate: (templateId: string, churchId: string) =>
        api
          .delete<ApiResponse<void>>(`/schedule-planning/templates/${templateId}`, {
            data: { churchId },
          })
          .then(() => {
            // Delete doesn't return data
          }),
    },

    checkinService: {
      generateQrCode: (date?: string) =>
        api
          .post<
            ApiResponse<{ qrCode: string; schedule: Schedule; expiresAt: string }>
          >('/checkin/generate-qr', date ? { date } : {})
          .then(res =>
            extractEntityData<{ qrCode: string; schedule: Schedule; expiresAt: string }>(
              res.data,
              'Failed to generate QR code'
            )
          ),
      validateQrCode: (qrCodeData: string) =>
        api
          .post<ApiResponse<Attendance>>('/checkin/validate-qr', {
            qrCodeData,
          })
          .then(res => extractEntityData<Attendance>(res.data, 'Failed to validate QR code')),
      getHistory: (limit = 50) =>
        api
          .get<ApiResponse<Attendance[]>>('/checkin/history', {
            params: { limit },
          })
          .then(res => extractArrayData<Attendance>(res.data)),
    },
  }
}
