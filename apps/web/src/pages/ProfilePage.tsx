import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileHeader } from './profile/components/ProfileHeader'
import { ProfileSection } from './profile/components/ProfileSection'
import { EditableField } from './profile/components/EditableField'
import { Button } from '@/components/ui/Button'
import { uploadAvatar, updateProfile } from '@/services/upload.service'

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  const handleAvatarChange = useCallback(
    async (file: File) => {
      setAvatarError(null)
      setIsUploadingAvatar(true)

      try {
        const result = await uploadAvatar(file)
        updateUser({ avatar: result.avatarUrl })
      } catch {
        setAvatarError('Falha ao enviar imagem. Tente novamente.')
      } finally {
        setIsUploadingAvatar(false)
      }
    },
    [updateUser]
  )

  const handleSave = useCallback(
    async (field: string, value: string) => {
      const updateData: { name?: string; email?: string } = {}

      if (field === 'name') {
        updateData.name = value
      } else if (field === 'email') {
        updateData.email = value
      } else {
        // Fields like phone, bio are not yet supported in backend
        return
      }

      await updateProfile(updateData)
      updateUser(updateData)
    },
    [updateUser]
  )

  if (!user) return null

  return (
    <div className="min-h-full bg-gray-50 dark:bg-dark-950">
      <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-dark-900 dark:text-dark-50">
            Meu Perfil
          </h1>
          <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        {/* Profile Header with Avatar */}
        <ProfileHeader
          user={user}
          onAvatarChange={handleAvatarChange}
          isUploading={isUploadingAvatar}
          error={avatarError}
        />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Main Content - 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <ProfileSection
              title="Informações Pessoais"
              description="Suas informações básicas e de contato"
            >
              <div className="space-y-4">
                <EditableField
                  label="Nome Completo"
                  value={user.name}
                  onSave={value => handleSave('name', value)}
                  type="text"
                  required
                />
                <EditableField
                  label="Email"
                  value={user.email}
                  onSave={value => handleSave('email', value)}
                  type="email"
                  required
                />
                <EditableField
                  label="Telefone"
                  value=""
                  onSave={value => handleSave('phone', value)}
                  type="tel"
                  placeholder="(00) 00000-0000"
                />
                <EditableField
                  label="Sobre mim"
                  value=""
                  onSave={value => handleSave('bio', value)}
                  type="textarea"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
            </ProfileSection>

            {/* Security Settings */}
            <ProfileSection
              title="Segurança"
              description="Gerencie sua senha e configurações de segurança"
            >
              <div className="space-y-4">
                <Button
                  variant="primary"
                  className="w-full lg:w-auto"
                  onClick={() => alert('Funcionalidade em desenvolvimento')}
                >
                  Alterar Senha
                </Button>

                <div className="pt-4 border-t border-dark-200 dark:border-dark-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-dark-900 dark:text-dark-50">
                        Autenticação de Dois Fatores
                      </h4>
                      <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                        Adicione uma camada extra de segurança
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        aria-label="Ativar autenticação de dois fatores"
                      />
                      <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </ProfileSection>
          </div>

          {/* Sidebar - 1 column on desktop */}
          <div className="space-y-6">
            {/* Quick Info */}
            <ProfileSection title="Informações" description="">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-dark-500 dark:text-dark-400 uppercase tracking-wide">
                    Função
                  </p>
                  <p className="text-sm font-medium text-dark-900 dark:text-dark-50 mt-1">
                    {user.role}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-500 dark:text-dark-400 uppercase tracking-wide">
                    Membro desde
                  </p>
                  <p className="text-sm font-medium text-dark-900 dark:text-dark-50 mt-1">
                    Janeiro 2024
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-500 dark:text-dark-400 uppercase tracking-wide">
                    Igreja
                  </p>
                  <p className="text-sm font-medium text-dark-900 dark:text-dark-50 mt-1">
                    MINC BH
                  </p>
                </div>
              </div>
            </ProfileSection>

            {/* Preferences */}
            <ProfileSection title="Preferências" description="">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="theme-select"
                    className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2"
                  >
                    Tema
                  </label>
                  <select
                    id="theme-select"
                    className="w-full px-3 py-2 bg-white dark:bg-dark-900 border border-dark-300 dark:border-dark-700 rounded-lg text-dark-900 dark:text-dark-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option>Claro</option>
                    <option>Escuro</option>
                    <option>Automático</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span
                    className="text-sm text-dark-700 dark:text-dark-300"
                    id="email-notifications-label"
                  >
                    Notificações por Email
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="sr-only peer"
                      aria-labelledby="email-notifications-label"
                    />
                    <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-dark-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-dark-600 peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            </ProfileSection>

            {/* Logout */}
            <Button
              variant="ghost"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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
      </div>
    </div>
  )
}
