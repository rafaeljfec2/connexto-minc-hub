import type { AxiosInstance } from 'axios'
import type {
  Person,
  Team,
  Service,
  Schedule,
  Attendance,
  Church,
  Ministry,
  ApiResponse,
} from '../types'

type CreateEntity<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

export function createApiServices(api: AxiosInstance) {
  return {
    peopleService: {
      getAll: () => api.get<Person[]>('/people'),
      getById: (id: string) => api.get<Person>(`/people/${id}`),
      create: (data: CreateEntity<Person>) => api.post<Person>('/people', data),
      update: (id: string, data: Partial<Person>) => api.put<Person>(`/people/${id}`, data),
      delete: (id: string) => api.delete(`/people/${id}`),
    },

    teamsService: {
      getAll: () => api.get<Team[]>('/teams'),
      getById: (id: string) => api.get<Team>(`/teams/${id}`),
      create: (data: CreateEntity<Team>) => api.post<Team>('/teams', data),
      update: (id: string, data: Partial<Team>) => api.put<Team>(`/teams/${id}`, data),
      delete: (id: string) => api.delete(`/teams/${id}`),
    },

    servicesService: {
      getAll: (churchId?: string) =>
        api.get<Service[]>('/services', {
          params: churchId ? { churchId } : undefined,
        }),
      getById: (id: string) => api.get<Service>(`/services/${id}`),
      create: (data: CreateEntity<Service>) => api.post<Service>('/services', data),
      update: (id: string, data: Partial<Service>) => api.put<Service>(`/services/${id}`, data),
      delete: (id: string) => api.delete(`/services/${id}`),
    },

    schedulesService: {
      getAll: () => api.get<Schedule[]>('/schedules'),
      getById: (id: string) => api.get<Schedule>(`/schedules/${id}`),
      create: (data: CreateEntity<Schedule>) => api.post<Schedule>('/schedules', data),
      update: (id: string, data: Partial<Schedule>) => api.put<Schedule>(`/schedules/${id}`, data),
      delete: (id: string) => api.delete(`/schedules/${id}`),
      autoAssign: (serviceId: string, date: string) =>
        api.post<Schedule>('/schedules/auto-assign', { serviceId, date }),
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
        api.get<ApiResponse<Church[]>>('/churches').then(res => {
          if (res.data && typeof res.data === 'object' && 'success' in res.data) {
            const apiResponse = res.data as ApiResponse<Church[]>
            return apiResponse.data ?? []
          }
          return (res.data as unknown as Church[]) ?? []
        }),
      getById: (id: string) =>
        api.get<ApiResponse<Church>>(`/churches/${id}`).then(res => {
          if (res.data && typeof res.data === 'object' && 'success' in res.data) {
            const apiResponse = res.data as ApiResponse<Church>
            if (!apiResponse.data) {
              throw new Error('Church not found')
            }
            return apiResponse.data
          }
          const church = res.data as unknown as Church
          if (!church) {
            throw new Error('Church not found')
          }
          return church
        }),
      create: (data: CreateEntity<Church>) =>
        api.post<ApiResponse<Church>>('/churches', data).then(res => {
          if (res.data && typeof res.data === 'object' && 'success' in res.data) {
            const apiResponse = res.data as ApiResponse<Church>
            if (!apiResponse.data) {
              throw new Error('Failed to create church')
            }
            return apiResponse.data
          }
          const church = res.data as unknown as Church
          if (!church) {
            throw new Error('Failed to create church')
          }
          return church
        }),
      update: (id: string, data: Partial<Church>) =>
        api.patch<ApiResponse<Church>>(`/churches/${id}`, data).then(res => {
          if (res.data && typeof res.data === 'object' && 'success' in res.data) {
            const apiResponse = res.data as ApiResponse<Church>
            if (!apiResponse.data) {
              throw new Error('Church not found')
            }
            return apiResponse.data
          }
          const church = res.data as unknown as Church
          if (!church) {
            throw new Error('Church not found')
          }
          return church
        }),
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
          .then(res => {
            if (res.data && typeof res.data === 'object' && 'success' in res.data) {
              const apiResponse = res.data as ApiResponse<Ministry[]>
              return apiResponse.data ?? []
            }
            return (res.data as unknown as Ministry[]) ?? []
          }),
      getById: (id: string) =>
        api.get<ApiResponse<Ministry>>(`/ministries/${id}`).then(res => {
          if (res.data && typeof res.data === 'object' && 'success' in res.data) {
            const apiResponse = res.data as ApiResponse<Ministry>
            if (!apiResponse.data) {
              throw new Error('Ministry not found')
            }
            return apiResponse.data
          }
          const ministry = res.data as unknown as Ministry
          if (!ministry) {
            throw new Error('Ministry not found')
          }
          return ministry
        }),
      create: (data: CreateEntity<Ministry>) =>
        api.post<ApiResponse<Ministry>>('/ministries', data).then(res => {
          if (res.data && typeof res.data === 'object' && 'success' in res.data) {
            const apiResponse = res.data as ApiResponse<Ministry>
            if (!apiResponse.data) {
              throw new Error('Failed to create ministry')
            }
            return apiResponse.data
          }
          const ministry = res.data as unknown as Ministry
          if (!ministry) {
            throw new Error('Failed to create ministry')
          }
          return ministry
        }),
      update: (id: string, data: Partial<Ministry>) =>
        api.patch<ApiResponse<Ministry>>(`/ministries/${id}`, data).then(res => {
          if (res.data && typeof res.data === 'object' && 'success' in res.data) {
            const apiResponse = res.data as ApiResponse<Ministry>
            if (!apiResponse.data) {
              throw new Error('Ministry not found')
            }
            return apiResponse.data
          }
          const ministry = res.data as unknown as Ministry
          if (!ministry) {
            throw new Error('Ministry not found')
          }
          return ministry
        }),
      delete: (id: string) =>
        api.delete<ApiResponse<void>>(`/ministries/${id}`).then(() => {
          // Delete doesn't return data
        }),
    },
  }
}
