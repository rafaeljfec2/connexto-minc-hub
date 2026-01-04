import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function TeamsPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-50 mb-2">
            Equipes
          </h1>
          <p className="text-dark-400">
            Gerencie equipes do Time Boas-Vindas
          </p>
        </div>
        <Button variant="primary" size="md">
          Nova Equipe
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Equipes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-dark-400">
            Nenhuma equipe cadastrada
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
