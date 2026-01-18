import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ChurchProvider } from '@/contexts/ChurchContext'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { ProtectedRouteWrapper } from '@/components/routing/ProtectedRouteWrapper'
import { ScrollToTop } from '@/components/routing/ScrollToTop'
import { protectedRoutes, publicRoutes } from './navigator/routes'
import { ROUTES } from './navigator/routes.constants'
import type { RouteConfig } from './navigator/routes.types'

const LoginPage = lazy(() => import('@/pages/LoginPage'))

const PageLoader = () => (
  <div className="flex items-center justify-center p-8 w-full h-full min-h-[50vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
  </div>
)

function renderPublicRoute(route: RouteConfig) {
  return (
    <Route
      key={route.path}
      path={route.path}
      element={
        <Suspense fallback={<PageLoader />}>
          <route.component />
        </Suspense>
      }
    />
  )
}

function renderProtectedRoute(route: RouteConfig) {
  return (
    <Route
      key={route.path}
      path={route.path}
      element={
        <ProtectedRouteWrapper allowedRoles={route.allowedRoles}>
          <Suspense fallback={<PageLoader />}>
            <route.component />
          </Suspense>
        </ProtectedRouteWrapper>
      }
    />
  )
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ChurchProvider>
            <ScrollToTop />
            <Routes>
              <Route
                path={ROUTES.LOGIN}
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LoginPage />
                  </Suspense>
                }
              />
              {publicRoutes.map(renderPublicRoute)}
              {protectedRoutes.map(renderProtectedRoute)}
              <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
            </Routes>
            <ToastContainer />
          </ChurchProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
