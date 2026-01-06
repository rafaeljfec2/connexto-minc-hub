import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { TableRow, TableCell } from '@/components/ui/Table'
import { useModal } from '@/hooks/useModal'
import { PageHeader } from '@/components/layout/PageHeader'
import { Team } from '@minc-hub/shared/types'
import { EditIcon, TrashIcon, PlusIcon } from '@/components/icons'
import { useSchedulePlanningConfig } from '@/hooks/useSchedulePlanningConfig'
import { useTeams } from '@/hooks/useTeams'
import { useChurch } from '@/contexts/ChurchContext'
import { cn } from '@/lib/utils'

type TabType = 'global' | 'teams' | 'templates'

function getTeamConfigDisplay(): string {
  // This would ideally fetch and show if team has custom config
  // For now, we'll show "Padrão" (Default)
  return 'Padrão'
}

export default function SchedulePlanningConfigPage() {
  const { selectedChurch } = useChurch()
  const {
    config,
    createOrUpdateConfig,
    getTeamConfig,
    createOrUpdateTeamConfig,
    templates,
    createTemplate,
    applyTemplate,
    deleteTemplate,
  } = useSchedulePlanningConfig()
  const { teams } = useTeams()
  const [activeTab, setActiveTab] = useState<TabType>('global')
  const globalModal = useModal()
  const teamModal = useModal()
  const templateModal = useModal()
  const deleteTemplateModal = useModal()
  const applyTemplateModal = useModal()
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null)
  const [applyingTemplateId, setApplyingTemplateId] = useState<string | null>(null)
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    description: '',
  })

  const [globalFormData, setGlobalFormData] = useState({
    maxTeamMembers: 10,
    servicesPerSunday: 4,
    teamsServeOncePerMonth: true,
    enableLotteryForExtraServices: true,
    enableTimeRotation: true,
  })

  const [teamFormData, setTeamFormData] = useState({
    maxTeamMembers: null as number | null,
    teamsServeOncePerMonth: null as boolean | null,
    enableLotteryForExtraServices: null as boolean | null,
    enableTimeRotation: null as boolean | null,
  })

  const filteredTeams = useMemo(() => {
    return teams.filter(team => team.isActive)
  }, [teams])

  // Load global config when it changes
  useEffect(() => {
    if (config) {
      setGlobalFormData({
        maxTeamMembers: config.maxTeamMembers,
        servicesPerSunday: config.servicesPerSunday,
        teamsServeOncePerMonth: config.teamsServeOncePerMonth,
        enableLotteryForExtraServices: config.enableLotteryForExtraServices,
        enableTimeRotation: config.enableTimeRotation,
      })
    }
  }, [config])

  async function handleOpenTeamModal(team: Team) {
    setEditingTeamId(team.id)
    try {
      const existingConfig = await getTeamConfig(team.id)
      if (existingConfig) {
        setTeamFormData({
          maxTeamMembers: existingConfig.maxTeamMembers,
          teamsServeOncePerMonth: existingConfig.teamsServeOncePerMonth,
          enableLotteryForExtraServices: existingConfig.enableLotteryForExtraServices,
          enableTimeRotation: existingConfig.enableTimeRotation,
        })
      } else {
        setTeamFormData({
          maxTeamMembers: null,
          teamsServeOncePerMonth: null,
          enableLotteryForExtraServices: null,
          enableTimeRotation: null,
        })
      }
    } catch (error) {
      console.error('Error loading team config:', error)
      setTeamFormData({
        maxTeamMembers: null,
        teamsServeOncePerMonth: null,
        enableLotteryForExtraServices: null,
        enableTimeRotation: null,
      })
    }
    teamModal.open()
  }

  function handleCloseTeamModal() {
    teamModal.close()
    setEditingTeamId(null)
    setTeamFormData({
      maxTeamMembers: null,
      teamsServeOncePerMonth: null,
      enableLotteryForExtraServices: null,
      enableTimeRotation: null,
    })
  }

  async function handleGlobalSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedChurch) return

    try {
      await createOrUpdateConfig(globalFormData)
      globalModal.close()
    } catch (error) {
      console.error('Error saving global config:', error)
    }
  }

  async function handleTeamSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingTeamId) return

    try {
      await createOrUpdateTeamConfig(editingTeamId, teamFormData)
      handleCloseTeamModal()
    } catch (error) {
      console.error('Error saving team config:', error)
    }
  }

  async function handleCreateTemplate(e: React.FormEvent) {
    e.preventDefault()
    if (!config) {
      alert('Configure primeiro a configuração global antes de criar um template')
      return
    }

    if (!selectedChurch) {
      return
    }

    try {
      await createTemplate({
        name: templateFormData.name,
        description: templateFormData.description || null,
        maxTeamMembers: config.maxTeamMembers,
        servicesPerSunday: config.servicesPerSunday,
        teamsServeOncePerMonth: config.teamsServeOncePerMonth,
        enableLotteryForExtraServices: config.enableLotteryForExtraServices,
        enableTimeRotation: config.enableTimeRotation,
        churchId: selectedChurch.id,
      })
      setTemplateFormData({ name: '', description: '' })
      templateModal.close()
    } catch (error) {
      console.error('Error creating template:', error)
    }
  }

  async function handleApplyTemplate() {
    if (!applyingTemplateId) return

    try {
      await applyTemplate(applyingTemplateId)
      setApplyingTemplateId(null)
      applyTemplateModal.close()
    } catch (error) {
      console.error('Error applying template:', error)
    }
  }

  async function handleDeleteTemplate() {
    if (!deletingTemplateId) return

    try {
      await deleteTemplate(deletingTemplateId)
      setDeletingTemplateId(null)
      deleteTemplateModal.close()
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const tabs = [
    { id: 'global' as TabType, label: 'Configuração Global' },
    { id: 'teams' as TabType, label: 'Configurações por Time' },
    { id: 'templates' as TabType, label: 'Templates' },
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <PageHeader
        title="Configuração do Planejamento Mensal"
        description="Configure as regras do planejamento mensal de escalas"
      />
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-dark-200 dark:border-dark-800">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300 dark:text-dark-400 dark:hover:text-dark-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Global Config Tab */}
        {activeTab === 'global' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button variant="primary" onClick={globalModal.open}>
                <PlusIcon className="h-4 w-4 mr-2" />
                {config ? 'Editar Configuração' : 'Criar Configuração'}
              </Button>
            </div>

            {config ? (
              <div className="bg-white dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-800 p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Máximo de pessoas por equipe
                    </div>
                    <p className="text-dark-900 dark:text-dark-50">{config.maxTeamMembers}</p>
                  </div>
                  <div>
                    <div className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Cultos por domingo
                    </div>
                    <p className="text-dark-900 dark:text-dark-50">{config.servicesPerSunday}</p>
                  </div>
                  <div>
                    <div className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Cada equipe serve uma vez ao mês
                    </div>
                    <p className="text-dark-900 dark:text-dark-50">
                      {config.teamsServeOncePerMonth ? 'Sim' : 'Não'}
                    </p>
                  </div>
                  <div>
                    <div className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Sortear equipes para servir mais de uma vez
                    </div>
                    <p className="text-dark-900 dark:text-dark-50">
                      {config.enableLotteryForExtraServices ? 'Sim' : 'Não'}
                    </p>
                  </div>
                  <div>
                    <div className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                      Rotação de horários mensalmente
                    </div>
                    <p className="text-dark-900 dark:text-dark-50">
                      {config.enableTimeRotation ? 'Sim' : 'Não'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-800">
                <p className="text-dark-600 dark:text-dark-400">
                  Nenhuma configuração criada. Clique em "Criar Configuração" para começar.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Teams Config Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-dark-50 dark:bg-dark-800">
                  <TableRow>
                    <TableCell className="font-medium">Time</TableCell>
                    <TableCell className="font-medium">Configuração</TableCell>
                    <TableCell className="font-medium text-right">Ações</TableCell>
                  </TableRow>
                </thead>
                <tbody>
                  {filteredTeams.map(team => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{getTeamConfigDisplay()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenTeamModal(team)}>
                          <EditIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button variant="primary" onClick={templateModal.open}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Criar Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-800 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-dark-900 dark:text-dark-50">
                        {template.name}
                      </h3>
                      {template.isSystemTemplate && (
                        <span className="text-xs text-primary-600 dark:text-primary-400">
                          Sistema
                        </span>
                      )}
                    </div>
                  </div>
                  {template.description && (
                    <p className="text-sm text-dark-600 dark:text-dark-400">
                      {template.description}
                    </p>
                  )}
                  <div className="text-xs text-dark-500 dark:text-dark-500 space-y-1">
                    <p>Máx. pessoas: {template.maxTeamMembers}</p>
                    <p>Cultos/domingo: {template.servicesPerSunday}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setApplyingTemplateId(template.id)
                        applyTemplateModal.open()
                      }}
                    >
                      Aplicar
                    </Button>
                    {!template.isSystemTemplate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingTemplateId(template.id)
                          deleteTemplateModal.open()
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {templates.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-dark-900 rounded-lg border border-dark-200 dark:border-dark-800">
                <p className="text-dark-600 dark:text-dark-400">
                  Nenhum template disponível. Crie um template para começar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Config Modal */}
      <Modal
        isOpen={globalModal.isOpen}
        onClose={globalModal.close}
        title={config ? 'Editar Configuração Global' : 'Criar Configuração Global'}
        size="md"
      >
        <form onSubmit={handleGlobalSubmit} className="space-y-4">
          <Input
            label="Máximo de pessoas por equipe"
            type="number"
            min="1"
            value={globalFormData.maxTeamMembers.toString()}
            onChange={e =>
              setGlobalFormData(prev => ({
                ...prev,
                maxTeamMembers: Number.parseInt(e.target.value, 10) || 1,
              }))
            }
            required
          />
          <Input
            label="Cultos por domingo"
            type="number"
            min="1"
            value={globalFormData.servicesPerSunday.toString()}
            onChange={e =>
              setGlobalFormData(prev => ({
                ...prev,
                servicesPerSunday: Number.parseInt(e.target.value, 10) || 1,
              }))
            }
            required
          />
          <Checkbox
            label="Cada equipe serve uma vez ao mês"
            checked={globalFormData.teamsServeOncePerMonth}
            onChange={e =>
              setGlobalFormData(prev => ({ ...prev, teamsServeOncePerMonth: e.target.checked }))
            }
          />
          <Checkbox
            label="Sortear equipes para servir mais de uma vez quando necessário"
            checked={globalFormData.enableLotteryForExtraServices}
            onChange={e =>
              setGlobalFormData(prev => ({
                ...prev,
                enableLotteryForExtraServices: e.target.checked,
              }))
            }
          />
          <Checkbox
            label="Fazer rotação de horários mensalmente"
            checked={globalFormData.enableTimeRotation}
            onChange={e =>
              setGlobalFormData(prev => ({ ...prev, enableTimeRotation: e.target.checked }))
            }
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={globalModal.close}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Team Config Modal */}
      <Modal
        isOpen={teamModal.isOpen}
        onClose={handleCloseTeamModal}
        title="Configuração do Time"
        size="md"
      >
        <form onSubmit={handleTeamSubmit} className="space-y-4">
          <p className="text-sm text-dark-600 dark:text-dark-400">
            Deixe em branco para usar a configuração global
          </p>
          <Input
            label="Máximo de pessoas por equipe"
            type="number"
            min="1"
            value={teamFormData.maxTeamMembers?.toString() ?? ''}
            onChange={e =>
              setTeamFormData(prev => ({
                ...prev,
                maxTeamMembers: e.target.value ? Number.parseInt(e.target.value, 10) : null,
              }))
            }
          />
          <div className="space-y-2">
            <Checkbox
              label="Cada equipe serve uma vez ao mês"
              checked={teamFormData.teamsServeOncePerMonth ?? false}
              onChange={e =>
                setTeamFormData(prev => ({
                  ...prev,
                  teamsServeOncePerMonth: e.target.checked ? e.target.checked : null,
                }))
              }
            />
            {teamFormData.teamsServeOncePerMonth !== null && (
              <button
                type="button"
                onClick={() => setTeamFormData(prev => ({ ...prev, teamsServeOncePerMonth: null }))}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                Usar configuração global
              </button>
            )}
          </div>
          <div className="space-y-2">
            <Checkbox
              label="Sortear equipes para servir mais de uma vez quando necessário"
              checked={teamFormData.enableLotteryForExtraServices ?? false}
              onChange={e =>
                setTeamFormData(prev => ({
                  ...prev,
                  enableLotteryForExtraServices: e.target.checked ? e.target.checked : null,
                }))
              }
            />
            {teamFormData.enableLotteryForExtraServices !== null && (
              <button
                type="button"
                onClick={() =>
                  setTeamFormData(prev => ({ ...prev, enableLotteryForExtraServices: null }))
                }
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                Usar configuração global
              </button>
            )}
          </div>
          <div className="space-y-2">
            <Checkbox
              label="Fazer rotação de horários mensalmente"
              checked={teamFormData.enableTimeRotation ?? false}
              onChange={e =>
                setTeamFormData(prev => ({
                  ...prev,
                  enableTimeRotation: e.target.checked ? e.target.checked : null,
                }))
              }
            />
            {teamFormData.enableTimeRotation !== null && (
              <button
                type="button"
                onClick={() => setTeamFormData(prev => ({ ...prev, enableTimeRotation: null }))}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                Usar configuração global
              </button>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseTeamModal}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Template Modal */}
      <Modal
        isOpen={templateModal.isOpen}
        onClose={() => {
          templateModal.close()
          setTemplateFormData({ name: '', description: '' })
        }}
        title="Criar Template"
        size="md"
      >
        <form onSubmit={handleCreateTemplate} className="space-y-4">
          <Input
            label="Nome do template"
            value={templateFormData.name}
            onChange={e => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Descrição"
            value={templateFormData.description}
            onChange={e => setTemplateFormData(prev => ({ ...prev, description: e.target.value }))}
          />
          <p className="text-sm text-dark-600 dark:text-dark-400">
            O template será criado com base na configuração global atual.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                templateModal.close()
                setTemplateFormData({ name: '', description: '' })
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Criar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Apply Template Modal */}
      <ConfirmDialog
        isOpen={applyTemplateModal.isOpen}
        onClose={() => {
          applyTemplateModal.close()
          setApplyingTemplateId(null)
        }}
        onConfirm={handleApplyTemplate}
        title="Aplicar Template"
        message="Tem certeza que deseja aplicar este template? A configuração global atual será substituída."
        confirmText="Aplicar"
        cancelText="Cancelar"
      />

      {/* Delete Template Modal */}
      <ConfirmDialog
        isOpen={deleteTemplateModal.isOpen}
        onClose={() => {
          deleteTemplateModal.close()
          setDeletingTemplateId(null)
        }}
        onConfirm={handleDeleteTemplate}
        title="Excluir Template"
        message="Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}
