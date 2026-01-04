import { api } from "@/lib/api";
import type {
  Person,
  Team,
  Service,
  Schedule,
  Attendance,
  Church,
  Ministry,
} from "@/types";

export const peopleService = {
  getAll: () => api.get<Person[]>("/people"),
  getById: (id: string) => api.get<Person>(`/people/${id}`),
  create: (data: Omit<Person, "id" | "createdAt" | "updatedAt">) =>
    api.post<Person>("/people", data),
  update: (id: string, data: Partial<Person>) =>
    api.put<Person>(`/people/${id}`, data),
  delete: (id: string) => api.delete(`/people/${id}`),
};

export const teamsService = {
  getAll: () => api.get<Team[]>("/teams"),
  getById: (id: string) => api.get<Team>(`/teams/${id}`),
  create: (data: Omit<Team, "id" | "createdAt" | "updatedAt">) =>
    api.post<Team>("/teams", data),
  update: (id: string, data: Partial<Team>) =>
    api.put<Team>(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),
};

export const servicesService = {
  getAll: () => api.get<Service[]>("/services"),
  getById: (id: string) => api.get<Service>(`/services/${id}`),
  create: (data: Omit<Service, "id" | "createdAt" | "updatedAt">) =>
    api.post<Service>("/services", data),
  update: (id: string, data: Partial<Service>) =>
    api.put<Service>(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};

export const schedulesService = {
  getAll: () => api.get<Schedule[]>("/schedules"),
  getById: (id: string) => api.get<Schedule>(`/schedules/${id}`),
  create: (data: Omit<Schedule, "id" | "createdAt" | "updatedAt">) =>
    api.post<Schedule>("/schedules", data),
  update: (id: string, data: Partial<Schedule>) =>
    api.put<Schedule>(`/schedules/${id}`, data),
  delete: (id: string) => api.delete(`/schedules/${id}`),
  autoAssign: (serviceId: string, date: string) =>
    api.post<Schedule>("/schedules/auto-assign", { serviceId, date }),
};

export const attendanceService = {
  getBySchedule: (scheduleId: string) =>
    api.get<Attendance[]>(`/attendance/schedule/${scheduleId}`),
  mark: (data: Omit<Attendance, "id" | "createdAt" | "updatedAt">) =>
    api.post<Attendance>("/attendance", data),
  update: (id: string, data: Partial<Attendance>) =>
    api.put<Attendance>(`/attendance/${id}`, data),
};

export const communicationService = {
  send: (data: {
    title: string;
    content: string;
    recipients: { type: "all" | "team" | "person"; ids: string[] };
  }) => api.post("/communication/send", data),
  getHistory: () => api.get("/communication/history"),
};

export const churchesService = {
  getAll: () => api.get<Church[]>("/churches"),
  getById: (id: string) => api.get<Church>(`/churches/${id}`),
  create: (data: Omit<Church, "id" | "createdAt" | "updatedAt">) =>
    api.post<Church>("/churches", data),
  update: (id: string, data: Partial<Church>) =>
    api.put<Church>(`/churches/${id}`, data),
};

export const ministriesService = {
  getAll: () => api.get<Ministry[]>("/ministries"),
  getById: (id: string) => api.get<Ministry>(`/ministries/${id}`),
  create: (data: Omit<Ministry, "id" | "createdAt" | "updatedAt">) =>
    api.post<Ministry>("/ministries", data),
  update: (id: string, data: Partial<Ministry>) =>
    api.put<Ministry>(`/ministries/${id}`, data),
};
