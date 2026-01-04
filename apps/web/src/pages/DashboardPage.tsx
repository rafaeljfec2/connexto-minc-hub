import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { useMockMode } from '@/hooks/useMockMode'

export default function DashboardPage() {
  const { user } = useAuth()
  const isMockMode = useMockMode()

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-50 mb-2">
          Dashboard
        </h1>
        <p className="text-dark-600 dark:text-dark-400">
          {isMockMode ? 'Modo Desenvolvimento - Bem-vindo!' : `Bem-vindo, ${user?.name ?? 'Usuário'}`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-dark-600 dark:text-dark-400">
              Total de Servos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dark-900 dark:text-dark-50">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-dark-600 dark:text-dark-400">
              Equipes Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dark-900 dark:text-dark-50">0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-dark-600 dark:text-dark-400">
              Próximo Culto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dark-900 dark:text-dark-50">-</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-dark-600 dark:text-dark-400">
              Presença (Mês)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dark-900 dark:text-dark-50">0%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-dark-600 dark:text-dark-400">
              Nenhuma atividade recente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Escalas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-dark-600 dark:text-dark-400">
              Nenhuma escala agendada
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
