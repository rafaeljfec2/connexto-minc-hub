import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { MonthNavigator } from "@/components/ui/MonthNavigator";
import { Service, Schedule, Team, Ministry, ServiceType } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { getDayLabel } from "@/lib/constants";

const MOCK_SERVICES: Service[] = [
  {
    id: "1",
    churchId: "1",
    type: ServiceType.SUNDAY_MORNING,
    dayOfWeek: 0,
    time: "09:00",
    name: "Culto Dominical Manhã",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    churchId: "1",
    type: ServiceType.SUNDAY_EVENING,
    dayOfWeek: 0,
    time: "19:00",
    name: "Culto Dominical Noite",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    churchId: "1",
    type: ServiceType.WEDNESDAY,
    dayOfWeek: 3,
    time: "19:30",
    name: "Culto de Oração",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_MINISTRIES: Ministry[] = [
  {
    id: "1",
    name: "Time Boas-Vindas",
    churchId: "1",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_TEAMS: Team[] = [
  {
    id: "1",
    name: "Equipe Manhã",
    description: "Equipe responsável pelo culto da manhã",
    ministryId: "1",
    memberIds: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Equipe Noite",
    description: "Equipe responsável pelo culto da noite",
    ministryId: "1",
    memberIds: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Equipe Oração",
    description: "Equipe responsável pelo culto de oração",
    ministryId: "1",
    memberIds: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_SCHEDULES: Schedule[] = [
  {
    id: "1",
    serviceId: "1",
    date: new Date(2024, 0, 7).toISOString(),
    teamIds: ["1"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    serviceId: "1",
    date: new Date(2024, 0, 14).toISOString(),
    teamIds: ["2"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    serviceId: "2",
    date: new Date(2024, 0, 7).toISOString(),
    teamIds: ["2"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function MonthlySchedulePage() {
  const [services] = useState<Service[]>(MOCK_SERVICES);
  const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES);
  const [teams] = useState<Team[]>(MOCK_TEAMS);
  const [ministries] = useState<Ministry[]>(MOCK_MINISTRIES);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [selectedServiceForDraw, setSelectedServiceForDraw] =
    useState<string>("");

  const currentDate = new Date(selectedYear, selectedMonth - 1, 1);
  const monthName = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const monthSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date);
      return (
        scheduleDate.getMonth() + 1 === selectedMonth &&
        scheduleDate.getFullYear() === selectedYear
      );
    });
  }, [schedules, selectedMonth, selectedYear]);

  function getServiceName(serviceId: string) {
    return (
      services.find((s) => s.id === serviceId)?.name ?? "Culto não encontrado"
    );
  }

  function getMinistryName(teamId: string) {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return "-";
    return ministries.find((m) => m.id === team.ministryId)?.name ?? "-";
  }

  function renderScheduleTeams(schedule: Schedule | undefined) {
    if (!schedule) {
      return (
        <div className="text-xs text-dark-500 flex items-center gap-1">
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>Sem escala</span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {schedule.teamIds.map((teamId) => {
          const team = teams.find((t) => t.id === teamId);
          const ministryName = getMinistryName(teamId);
          return (
            <div
              key={teamId}
              className="flex items-center gap-2 p-2 bg-primary-500/10 rounded border border-primary-500/20"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-primary-400 truncate">
                  {ministryName}
                </div>
                <div className="text-xs text-dark-300 truncate">
                  {team?.name ?? "Equipe não encontrada"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function getSchedulesByService(serviceId: string) {
    return monthSchedules.filter((s) => s.serviceId === serviceId);
  }

  function getDatesForService(serviceId: string) {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return [];

    const dates: Date[] = [];
    const year = selectedYear;
    const month = selectedMonth - 1;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === service.dayOfWeek) {
        dates.push(date);
      }
    }

    return dates;
  }

  function handleDrawMonthly(serviceId: string) {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    const dates = getDatesForService(serviceId);
    const activeTeams = teams.filter((t) => t.isActive);

    if (activeTeams.length === 0) {
      alert("Não há equipes ativas disponíveis para este culto");
      return;
    }

    const shuffledTeams = [...activeTeams].sort(() => Math.random() - 0.5);

    const newSchedules: Schedule[] = dates.map((date, index) => {
      const teamIndex = index % shuffledTeams.length;
      const selectedTeam = shuffledTeams[teamIndex] ?? shuffledTeams[0];

      return {
        id: `schedule-${serviceId}-${date.getTime()}`,
        serviceId,
        date: date.toISOString(),
        teamIds: [selectedTeam.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    const existingScheduleIds = new Set(
      schedules
        .filter(
          (s) =>
            s.serviceId === serviceId &&
            new Date(s.date).getMonth() + 1 === selectedMonth &&
            new Date(s.date).getFullYear() === selectedYear
        )
        .map((s) => s.id)
    );

    const updatedSchedules = schedules.filter(
      (s) => !existingScheduleIds.has(s.id)
    );

    setSchedules([...updatedSchedules, ...newSchedules]);
    setDrawModalOpen(false);
    setSelectedServiceForDraw("");
  }

  function handleOpenDrawModal(serviceId: string) {
    setSelectedServiceForDraw(serviceId);
    setDrawModalOpen(true);
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <PageHeader
          title="Sorteio de Escalas Mensais"
          description="Visualize e gerencie as escalas mensais dos cultos"
        />

      <Card>
        <CardContent className="pt-6">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-md">
              <MonthNavigator
                month={selectedMonth.toString().padStart(2, "0")}
                year={selectedYear.toString()}
                onChange={(month, year) => {
                  setSelectedMonth(Number(month));
                  setSelectedYear(Number(year));
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {services
          .filter((s) => s.isActive)
          .map((service) => {
            const serviceSchedules = getSchedulesByService(service.id);
            const dates = getDatesForService(service.id);
            const hasSchedules = serviceSchedules.length > 0;

            return (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-sm text-dark-400">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>{getDayLabel(service.dayOfWeek)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-dark-400">
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{service.time}</span>
                        </div>
                        {hasSchedules && (
                          <div className="flex items-center gap-1 text-sm text-primary-400">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>{serviceSchedules.length} escala(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenDrawModal(service.id)}
                      className="whitespace-nowrap"
                    >
                      Sortear Mês
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {hasSchedules ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {dates.map((date) => {
                        const schedule = serviceSchedules.find(
                          (s) =>
                            new Date(s.date).toDateString() ===
                            date.toDateString()
                        );
                        const isPast = date < new Date();
                        const isToday =
                          date.toDateString() === new Date().toDateString();

                        return (
                          <div
                            key={date.toISOString()}
                            className={cn(
                              "p-4 rounded-lg border transition-colors",
                              schedule
                                ? "bg-dark-900 border-dark-800 hover:border-primary-500/50"
                                : "bg-dark-900/50 border-dark-800/50",
                              isToday && "ring-2 ring-primary-500/50",
                              isPast && !schedule && "opacity-60"
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-semibold text-dark-50">
                                {formatDate(date.toISOString())}
                              </div>
                              {isToday && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                                  Hoje
                                </span>
                              )}
                            </div>
                            {renderScheduleTeams(schedule)}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <svg
                          className="h-12 w-12 mx-auto text-dark-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-dark-400 mb-2">
                        Nenhuma escala cadastrada para este mês
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDrawModal(service.id)}
                      >
                        Criar Escalas do Mês
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>

      <Modal
        isOpen={drawModalOpen}
        onClose={() => {
          setDrawModalOpen(false);
          setSelectedServiceForDraw("");
        }}
        title="Sortear Escalas Mensais"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-dark-300">
            Você está prestes a sortear as escalas para{" "}
            <span className="font-medium">
              {selectedServiceForDraw
                ? getServiceName(selectedServiceForDraw)
                : ""}
            </span>{" "}
            no mês de <span className="font-medium">{monthName}</span>.
          </p>
          <p className="text-sm text-dark-400">
            As escalas existentes para este mês serão substituídas pelas novas
            escalas sorteadas.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDrawModalOpen(false);
                setSelectedServiceForDraw("");
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                if (selectedServiceForDraw) {
                  handleDrawMonthly(selectedServiceForDraw);
                }
              }}
            >
              Confirmar Sorteio
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </main>
  );
}
