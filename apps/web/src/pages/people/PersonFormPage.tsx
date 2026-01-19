import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ComboBox } from '@/components/ui/ComboBox'
import { CheckboxList } from '@/components/ui/CheckboxList'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { TeamMembersSelector } from './components/TeamMembersSelector'
import { PersonFormHeader } from './components/PersonFormHeader'
import { UserIcon } from '@/components/icons'
import { Person, MemberType, UserRole } from '@minc-hub/shared/types'
import { formatPhone } from '@/utils/phone-mask'
import { usePeopleQuery } from '@/hooks/queries/usePeopleQuery'
import { useMinistriesQuery } from '@/hooks/queries/useMinistriesQuery'
import { useTeamsQuery } from '@/hooks/queries/useTeamsQuery'
import { useServicesQuery } from '@/hooks/queries/useServicesQuery'
import { usePersonByIdQuery } from '@/hooks/queries/usePersonByIdQuery'
import { useUsers } from '@/hooks/useUsers'
import { useToast } from '@/contexts/ToastContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { CreateUserForm } from './components/CreateUserForm'
import { useModal } from '@/hooks/useModal'

// Initial form state helper
const getInitialFormData = () => ({
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  address: '',
  notes: '',
  ministryId: '',
  teamId: '',
  teamMembers: [] as Array<{ teamId: string; memberType: MemberType }>,
  preferredServiceIds: [] as string[],
})

export default function PersonFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const { createPerson, updatePerson, isLoading: isLoadingPeople } = usePeopleQuery()
  const { data: existingPerson, isLoading: isLoadingPerson } = usePersonByIdQuery(id)
  const { ministries } = useMinistriesQuery()
  const { teams } = useTeamsQuery()
  const { services } = useServicesQuery()
  const { createUser } = useUsers()
  const { showError } = useToast()

  const [personFormData, setPersonFormData] = useState(getInitialFormData())
  const [emailError, setEmailError] = useState('')

  const createUserModal = useModal()
  const [creatingUserForPerson, setCreatingUserForPerson] = useState<Person | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userRole, setUserRole] = useState<UserRole>(UserRole.SERVO)

  // Load person data if in edit mode
  useEffect(() => {
    if (isEditMode && existingPerson) {
      const loadedPerson = existingPerson
      // Extract preferred service IDs from person (assuming it's stored in notes or a custom field)
      // For now, we'll initialize as empty array
      const preferredServiceIds: string[] = []

      // Convert teamMembers to form format
      const teamMembers =
        loadedPerson.teamMembers?.map((tm: { teamId: string; memberType: MemberType }) => ({
          teamId: tm.teamId,
          memberType: tm.memberType,
        })) ?? []

      // If person has teamId but no teamMembers, add it as fixed for compatibility
      if (loadedPerson.teamId && teamMembers.length === 0) {
        teamMembers.push({
          teamId: loadedPerson.teamId,
          memberType: MemberType.FIXED,
        })
      }

      setPersonFormData({
        name: loadedPerson.name,
        email: loadedPerson.email ?? '',
        phone: loadedPerson.phone ? formatPhone(loadedPerson.phone) : '',
        birthDate: loadedPerson.birthDate ?? '',
        address: loadedPerson.address ?? '',
        notes: loadedPerson.notes ?? '',
        ministryId: loadedPerson.ministryId ?? '',
        teamId: loadedPerson.teamId ?? '',
        teamMembers,
        preferredServiceIds,
      })
    } else if (isEditMode && !existingPerson && !isLoadingPerson) {
      // Person not found
      showError('Servo não encontrado')
      navigate('/people')
    }
  }, [isEditMode, existingPerson, isLoadingPerson, navigate, showError])

  // Filter ministries by isActive
  const filteredMinistries = ministries.filter(m => m.isActive)

  // Filter active services
  const activeServices = services.filter(s => s.isActive)

  function handlePersonMinistryChange(ministryId: string) {
    setPersonFormData({
      ...personFormData,
      ministryId,
      teamId: '',
    })
  }

  function handleTogglePreferredService(serviceId: string) {
    setPersonFormData(prev => {
      const currentIds = prev.preferredServiceIds
      const newIds = currentIds.includes(serviceId)
        ? currentIds.filter(id => id !== serviceId)
        : [...currentIds, serviceId]
      return { ...prev, preferredServiceIds: newIds }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validar campo obrigatório
    if (!personFormData.name.trim()) {
      showError('O campo Nome é obrigatório')
      return
    }

    try {
      // Prepare data for submission
      const submitData: Partial<Person> = {
        name: personFormData.name.trim(),
        email: personFormData.email.trim() || undefined,
        phone: personFormData.phone.trim() || undefined,
        birthDate: personFormData.birthDate || undefined,
        address: personFormData.address.trim() || undefined,
        notes: personFormData.notes.trim() || undefined,
        ministryId: personFormData.ministryId || undefined,
        teamId: personFormData.teamId || undefined,
        teamMembers: personFormData.teamMembers as unknown as Person['teamMembers'],
      }

      if (isEditMode && id) {
        await updatePerson({ id, data: submitData })
      } else {
        await createPerson(submitData as Person)
      }

      navigate('/people')
    } catch (error) {
      console.error('Error saving person:', error)
      // Error is already handled by the hook
    }
  }

  async function handleSaveAndCreateUser() {
    // Validar se tem email antes de criar usuário
    if (!personFormData.email?.trim()) {
      setEmailError('Email é obrigatório para criar um usuário')
      return
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(personFormData.email.trim())) {
      setEmailError('Email inválido')
      return
    }

    setEmailError('')

    try {
      // Prepare data for submission
      const submitData: Partial<Person> = {
        name: personFormData.name.trim(),
        email: personFormData.email.trim() || undefined,
        phone: personFormData.phone.trim() || undefined,
        birthDate: personFormData.birthDate || undefined,
        address: personFormData.address.trim() || undefined,
        notes: personFormData.notes.trim() || undefined,
        ministryId: personFormData.ministryId || undefined,
        teamId: personFormData.teamId || undefined,
        teamMembers: personFormData.teamMembers as unknown as Person['teamMembers'],
      }

      createPerson(submitData as Person, {
        onSuccess: savedPerson => {
          // Open create user modal
          setCreatingUserForPerson(savedPerson)
          setUserEmail(savedPerson?.email ?? '')
          setUserPassword('')
          setUserRole(UserRole.SERVO)
          createUserModal.open()
        },
      })
    } catch (error) {
      console.error('Error saving person:', error)
      // Error is already handled by the hook
    }
  }

  function handleCloseCreateUserModal() {
    createUserModal.close()
    setCreatingUserForPerson(null)
    setUserEmail('')
    setUserPassword('')
    setUserRole(UserRole.SERVO)
  }

  async function handleCreateUserSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!creatingUserForPerson) return

    try {
      await createUser({
        name: creatingUserForPerson.name,
        email: userEmail,
        password: userPassword,
        role: userRole,
        personId: creatingUserForPerson.id,
      })

      handleCloseCreateUserModal()
      navigate('/people')
    } catch (error) {
      console.error('Error creating user for person:', error)
    }
  }

  function handleCancel() {
    navigate('/people')
  }

  const isLoading = isLoadingPeople || isLoadingPerson
  const isFormValid = personFormData.name.trim().length > 0

  // Mobile layout: fullscreen with fixed header and footer
  if (!isDesktop) {
    return (
      <>
        <PersonFormHeader isEditMode={isEditMode} onBack={handleCancel} />
        <div className="flex-1 overflow-y-auto pt-[calc(2.5rem+env(safe-area-inset-top,0px))] pb-[calc(8rem+env(safe-area-inset-bottom,0px))]">
          <div className="px-4 pb-3 -mt-9">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Basic Information Section */}
              <Card className="mb-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <Input
                    label="Nome *"
                    value={personFormData.name}
                    onChange={e => setPersonFormData({ ...personFormData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={personFormData.email}
                    onChange={e => {
                      setPersonFormData({ ...personFormData, email: e.target.value })
                      setEmailError('')
                    }}
                    placeholder="email@exemplo.com"
                    error={emailError}
                  />
                  <Input
                    label="Telefone"
                    value={formatPhone(personFormData.phone)}
                    onChange={e => {
                      // Remove non-numeric characters using regex global
                      // SonarQube sugere replaceAll, mas replaceAll não aceita regex, então usamos replace com flag global
                      // NOSONAR: S7781 - replaceAll não aceita regex, replace com flag global é necessário
                      const unformatted = e.target.value.replace(/\D/g, '')
                      setPersonFormData({
                        ...personFormData,
                        phone: unformatted,
                      })
                    }}
                    placeholder="(11) 99999-9999"
                  />
                  <Input
                    label="Data de Nascimento"
                    type="date"
                    value={personFormData.birthDate}
                    onChange={e =>
                      setPersonFormData({ ...personFormData, birthDate: e.target.value })
                    }
                  />
                  <Input
                    label="Endereço"
                    value={personFormData.address}
                    onChange={e =>
                      setPersonFormData({ ...personFormData, address: e.target.value })
                    }
                  />
                </CardContent>
              </Card>

              {/* Ministry and Teams Section */}
              <Card className="mb-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Time e Equipes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <ComboBox
                    label="Time"
                    value={personFormData.ministryId || null}
                    onValueChange={val => handlePersonMinistryChange(val || '')}
                    options={filteredMinistries.map(m => ({ value: m.id, label: m.name }))}
                    placeholder="Selecione um time"
                    searchable
                    searchPlaceholder="Buscar time..."
                  />
                  <div className="bg-dark-50 dark:bg-dark-900/30 p-4 rounded-lg border border-dark-200 dark:border-dark-700">
                    <div className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
                      Equipes
                    </div>
                    <TeamMembersSelector
                      teams={teams}
                      ministries={ministries}
                      selectedMinistryId={personFormData.ministryId || undefined}
                      value={personFormData.teamMembers}
                      onChange={teamMembers =>
                        setPersonFormData({ ...personFormData, teamMembers })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Service Preferences Section */}
              <Card className="mb-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Preferências de Cultos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <p className="text-sm text-dark-600 dark:text-dark-400">
                    Selecione os cultos em que este servo prefere servir
                  </p>
                  {activeServices.length > 0 ? (
                    <CheckboxList
                      items={activeServices.map(service => ({
                        id: service.id,
                        label: `${service.name} (${service.time})`,
                      }))}
                      selectedIds={personFormData.preferredServiceIds}
                      onToggle={handleTogglePreferredService}
                      maxHeight="max-h-40"
                    />
                  ) : (
                    <p className="text-sm text-dark-500 dark:text-dark-400 py-2 text-center">
                      Nenhum culto ativo disponível
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Additional Notes Section */}
              <Card className="mb-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Observações</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Textarea
                    label="Notas adicionais"
                    value={personFormData.notes}
                    onChange={e => setPersonFormData({ ...personFormData, notes: e.target.value })}
                    placeholder="Observações sobre o servo..."
                    rows={3}
                  />
                </CardContent>
              </Card>
            </form>
          </div>
        </div>

        {/* Fixed Footer Buttons - positioned above mobile footer (approx 4.5rem height) */}
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-dark-950/95 dark:supports-[backdrop-filter]:dark:bg-dark-950/80 border-t border-dark-200 dark:border-dark-700 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] z-20 lg:hidden shadow-lg">
          <div className="flex flex-col gap-2 max-w-2xl mx-auto">
            <Button
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2"
              disabled={isLoading || !isFormValid}
            >
              {isEditMode ? 'Salvar' : 'Adicionar'}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={handleCancel} className="flex-1">
                Cancelar
              </Button>
              {!isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveAndCreateUser}
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  <UserIcon className="h-4 w-4" />
                  Criar Usuário
                </Button>
              )}
            </div>
          </div>
        </div>

        {creatingUserForPerson && (
          <Modal
            isOpen={createUserModal.isOpen}
            onClose={handleCloseCreateUserModal}
            title="Criar Usuário para Servo"
            size="md"
          >
            <CreateUserForm
              person={creatingUserForPerson}
              email={userEmail}
              password={userPassword}
              role={userRole}
              onEmailChange={setUserEmail}
              onPasswordChange={setUserPassword}
              onRoleChange={setUserRole}
              onSubmit={handleCreateUserSubmit}
              onCancel={handleCloseCreateUserModal}
              isLoading={isLoading}
            />
          </Modal>
        )}
      </>
    )
  }

  // Desktop layout: container with max-width
  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <PersonFormHeader isEditMode={isEditMode} onBack={handleCancel} />
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome *"
                value={personFormData.name}
                onChange={e => setPersonFormData({ ...personFormData, name: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={personFormData.email}
                  onChange={e => {
                    setPersonFormData({ ...personFormData, email: e.target.value })
                    setEmailError('')
                  }}
                  placeholder="email@exemplo.com"
                  error={emailError}
                />
                <Input
                  label="Telefone"
                  value={formatPhone(personFormData.phone)}
                  onChange={e => {
                    // Remove non-numeric characters using regex global
                    // SonarQube sugere replaceAll, mas replaceAll não aceita regex, então usamos replace com flag global
                    // NOSONAR: S7781 - replaceAll não aceita regex, replace com flag global é necessário
                    const unformatted = e.target.value.replace(/\D/g, '')
                    setPersonFormData({
                      ...personFormData,
                      phone: unformatted,
                    })
                  }}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Data de Nascimento"
                  type="date"
                  value={personFormData.birthDate}
                  onChange={e =>
                    setPersonFormData({ ...personFormData, birthDate: e.target.value })
                  }
                />
                <Input
                  label="Endereço"
                  value={personFormData.address}
                  onChange={e => setPersonFormData({ ...personFormData, address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ministry and Teams Section */}
          <Card>
            <CardHeader>
              <CardTitle>Time e Equipes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ComboBox
                label="Time"
                value={personFormData.ministryId || null}
                onValueChange={val => handlePersonMinistryChange(val || '')}
                options={filteredMinistries.map(m => ({ value: m.id, label: m.name }))}
                placeholder="Selecione um time"
                searchable
                searchPlaceholder="Buscar time..."
              />
              <div className="bg-dark-50 dark:bg-dark-900/30 p-4 rounded-lg border border-dark-200 dark:border-dark-700">
                <div className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">
                  Equipes
                </div>
                <TeamMembersSelector
                  teams={teams}
                  ministries={ministries}
                  selectedMinistryId={personFormData.ministryId || undefined}
                  value={personFormData.teamMembers}
                  onChange={teamMembers => setPersonFormData({ ...personFormData, teamMembers })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Service Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Cultos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-dark-600 dark:text-dark-400">
                Selecione os cultos em que este servo prefere servir
              </p>
              {activeServices.length > 0 ? (
                <CheckboxList
                  items={activeServices.map(service => ({
                    id: service.id,
                    label: `${service.name} (${service.time})`,
                  }))}
                  selectedIds={personFormData.preferredServiceIds}
                  onToggle={handleTogglePreferredService}
                  maxHeight="max-h-40"
                />
              ) : (
                <p className="text-sm text-dark-500 dark:text-dark-400 py-2 text-center">
                  Nenhum culto ativo disponível
                </p>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                label="Notas adicionais"
                value={personFormData.notes}
                onChange={e => setPersonFormData({ ...personFormData, notes: e.target.value })}
                placeholder="Observações sobre o servo..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="w-full sm:w-auto order-3 sm:order-1"
            >
              Cancelar
            </Button>
            {!isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndCreateUser}
                className="w-full sm:w-auto flex items-center justify-center gap-2 order-2"
                disabled={isLoading}
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Salvar e Criar Usuário</span>
                <span className="sm:hidden">Criar Usuário</span>
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full sm:w-auto order-1 sm:order-3"
              disabled={isLoading || !isFormValid}
            >
              {isEditMode ? 'Salvar Alterações' : 'Adicionar Voluntário'}
            </Button>
          </div>
        </form>
      </div>

      {creatingUserForPerson && (
        <Modal
          isOpen={createUserModal.isOpen}
          onClose={handleCloseCreateUserModal}
          title="Criar Usuário para Servo"
          size="md"
        >
          <CreateUserForm
            person={creatingUserForPerson}
            email={userEmail}
            password={userPassword}
            role={userRole}
            onEmailChange={setUserEmail}
            onPasswordChange={setUserPassword}
            onRoleChange={setUserRole}
            onSubmit={handleCreateUserSubmit}
            onCancel={handleCloseCreateUserModal}
            isLoading={isLoading}
          />
        </Modal>
      )}
    </>
  )
}
