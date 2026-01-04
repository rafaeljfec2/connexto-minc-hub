import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
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
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  readonly children: ReactNode;
  readonly allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();
  const MOCK_MODE =
    import.meta.env.VITE_MOCK_MODE === "true" || !import.meta.env.VITE_API_URL;

  if (isLoading && !MOCK_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grain">
        <div className="text-dark-400">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated && !MOCK_MODE) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasAnyRole(allowedRoles) && !MOCK_MODE) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

interface AppLayoutProps {
  readonly children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-grain relative">
      <div className="absolute inset-0 bg-dark-950/60" />
      <div className="relative z-10">
        <Sidebar />
        <div className="lg:ml-64">
          <Header />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </div>
      </div>
    </div>
  );
}

const MOCK_MODE =
  import.meta.env.VITE_MOCK_MODE === "true" || !import.meta.env.VITE_API_URL;

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            MOCK_MODE ? (
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            ) : (
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/people"
          element={
            MOCK_MODE ? (
              <AppLayout>
                <PeoplePage />
              </AppLayout>
            ) : (
              <ProtectedRoute
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.COORDINATOR,
                  UserRole.LEADER,
                ]}
              >
                <AppLayout>
                  <PeoplePage />
                </AppLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/teams"
          element={
            MOCK_MODE ? (
              <AppLayout>
                <TeamsPage />
              </AppLayout>
            ) : (
              <ProtectedRoute
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.COORDINATOR,
                  UserRole.LEADER,
                ]}
              >
                <AppLayout>
                  <TeamsPage />
                </AppLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/services"
          element={
            MOCK_MODE ? (
              <AppLayout>
                <ServicesPage />
              </AppLayout>
            ) : (
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.COORDINATOR]}
              >
                <AppLayout>
                  <ServicesPage />
                </AppLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/schedules"
          element={
            MOCK_MODE ? (
              <AppLayout>
                <SchedulesPage />
              </AppLayout>
            ) : (
              <ProtectedRoute
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.COORDINATOR,
                  UserRole.LEADER,
                ]}
              >
                <AppLayout>
                  <SchedulesPage />
                </AppLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/communication"
          element={
            MOCK_MODE ? (
              <AppLayout>
                <CommunicationPage />
              </AppLayout>
            ) : (
              <ProtectedRoute
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.COORDINATOR,
                  UserRole.LEADER,
                ]}
              >
                <AppLayout>
                  <CommunicationPage />
                </AppLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/churches"
          element={
            MOCK_MODE ? (
              <AppLayout>
                <ChurchesPage />
              </AppLayout>
            ) : (
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AppLayout>
                  <ChurchesPage />
                </AppLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/ministries"
          element={
            MOCK_MODE ? (
              <AppLayout>
                <MinistriesPage />
              </AppLayout>
            ) : (
              <ProtectedRoute
                allowedRoles={[UserRole.ADMIN, UserRole.COORDINATOR]}
              >
                <AppLayout>
                  <MinistriesPage />
                </AppLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/profile"
          element={
            MOCK_MODE ? (
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            ) : (
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/settings"
          element={
            MOCK_MODE ? (
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            ) : (
              <ProtectedRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route
          path="/monthly-schedules"
          element={
            MOCK_MODE ? (
              <AppLayout>
                <MonthlySchedulePage />
              </AppLayout>
            ) : (
              <ProtectedRoute
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.COORDINATOR,
                  UserRole.LEADER,
                ]}
              >
                <AppLayout>
                  <MonthlySchedulePage />
                </AppLayout>
              </ProtectedRoute>
            )
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
