import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProtectedRouteWrapper } from '@/components/routing/ProtectedRouteWrapper'
import LoginPage from '@/pages/LoginPage'
import { protectedRoutes } from './navigator/routes'
import { ROUTES } from './navigator/routes.constants'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          {protectedRoutes.map(route => (
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
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
