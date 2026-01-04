import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { PageHeader } from '@/components/layout/PageHeader'

export default function SettingsPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da aplicação"
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox
              label="Receber notificações por email"
              defaultChecked
            />
            <Checkbox
              label="Receber notificações de novas escalas"
              defaultChecked
            />
            <Checkbox
              label="Receber notificações de mensagens"
              defaultChecked
            />
            <div className="flex justify-end pt-4">
              <Button variant="primary">Salvar Preferências</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferências de Exibição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox label="Modo escuro (sempre ativo)" disabled />
            <Checkbox
              label="Mostrar notificações no navegador"
              defaultChecked
            />
            <div className="flex justify-end pt-4">
              <Button variant="primary">Salvar Preferências</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados e Privacidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-300">
                  Exportar meus dados
                </p>
                <p className="text-xs text-dark-400 mt-1">
                  Baixe uma cópia dos seus dados em formato JSON
                </p>
              </div>
              <Button variant="secondary" size="sm">
                Exportar
              </Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-dark-800">
              <div>
                <p className="text-sm font-medium text-red-400">
                  Excluir minha conta
                </p>
                <p className="text-xs text-dark-400 mt-1">
                  Esta ação não pode ser desfeita
                </p>
              </div>
              <Button variant="danger" size="sm">
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
