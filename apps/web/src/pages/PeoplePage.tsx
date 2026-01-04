import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function PeoplePage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-50 mb-2">
            Pessoas
          </h1>
          <p className="text-dark-400">
            Gerencie membros do Time Boas-Vindas
          </p>
        </div>
        <Button variant="primary" size="md">
          Adicionar Pessoa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pessoas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-dark-400">
            Nenhuma pessoa cadastrada
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
