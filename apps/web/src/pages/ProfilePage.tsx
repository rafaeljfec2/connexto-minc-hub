import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: Implementar atualização de perfil
    alert('Funcionalidade de atualização de perfil será implementada em breve')
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nome *"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
                <Input
                  label="Telefone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(11) 99999-9999"
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="submit" variant="primary">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Senha Atual *"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  required
                />
                <Input
                  label="Nova Senha *"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  required
                />
                <Input
                  label="Confirmar Nova Senha *"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="submit" variant="primary">
                    Alterar Senha
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="h-32 w-32 rounded-full bg-primary-600 flex items-center justify-center text-4xl font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <Button variant="secondary" size="sm">
                  Alterar Foto
                </Button>
                <p className="text-xs text-dark-400 text-center">
                  Formatos aceitos: JPG, PNG. Tamanho máximo: 2MB
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
