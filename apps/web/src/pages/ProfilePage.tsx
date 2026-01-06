import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { user, logout } = useAuth()
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
      <PageHeader title="Meu Perfil" description="Gerencie suas informações pessoais" />

      <div className="space-y-6">
        {/* Foto de Perfil - First Section */}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nome *"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Telefone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
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

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Senha Atual *"
                  type="password"
                  value={formData.currentPassword}
                  onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                />
                <Input
                  label="Nova Senha *"
                  type="password"
                  value={formData.newPassword}
                  onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                />
                <Input
                  label="Confirmar Nova Senha *"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e =>
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

        {/* Logout Button */}
        <div className="flex justify-center pt-4 pb-8">
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 w-full sm:w-auto"
            onClick={logout}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sair da Conta
          </Button>
        </div>
      </div>
    </main>
  )
}
