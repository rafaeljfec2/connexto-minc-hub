import { api } from "@/lib/api";
import { createApiServices } from "@minc-hub/shared/services";

export const {
  peopleService,
  teamsService,
  servicesService,
  schedulesService,
  attendanceService,
  communicationService,
  churchesService,
  ministriesService,
} = createApiServices(api);
