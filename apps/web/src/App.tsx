import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRouteWrapper } from "@/components/routing/ProtectedRouteWrapper";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PeoplePage from "@/pages/PeoplePage";
import TeamsPage from "@/pages/TeamsPage";
import ServicesPage from "@/pages/ServicesPage";
import SchedulesPage from "@/pages/SchedulesPage";
import MonthlySchedulePage from "@/pages/MonthlySchedulePage";
import CommunicationPage from "@/pages/CommunicationPage";
import ChurchesPage from "@/pages/ChurchesPage";
import MinistriesPage from "@/pages/MinistriesPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import { UserRole } from "@/types";

const routes = [
  {
    path: "/dashboard",
    component: DashboardPage,
  },
  {
    path: "/people",
    component: PeoplePage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    path: "/teams",
    component: TeamsPage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    path: "/services",
    component: ServicesPage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  {
    path: "/schedules",
    component: SchedulesPage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    path: "/communication",
    component: CommunicationPage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
  {
    path: "/churches",
    component: ChurchesPage,
    allowedRoles: [UserRole.ADMIN],
  },
  {
    path: "/ministries",
    component: MinistriesPage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR],
  },
  {
    path: "/profile",
    component: ProfilePage,
  },
  {
    path: "/settings",
    component: SettingsPage,
  },
  {
    path: "/monthly-schedules",
    component: MonthlySchedulePage,
    allowedRoles: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.LEADER],
  },
];

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRouteWrapper allowedRoles={route.allowedRoles}>
                  <route.component />
                </ProtectedRouteWrapper>
              }
            />
          ))}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
