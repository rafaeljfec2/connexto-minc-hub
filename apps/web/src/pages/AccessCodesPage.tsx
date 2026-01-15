import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Alert } from '@/components/ui/Alert'
import { useModal } from '@/hooks/useModal'
import { useAccessCodes, CreateAccessCodeDto } from '@/hooks/useAccessCodes'
import { useChurches } from '@/hooks/useChurches'
import { useMinistries } from '@/hooks/useMinistries'
import { useTeams } from '@/hooks/useTeams'
import { useChurch } from '@/contexts/ChurchContext'
import { CreateAccessCodeModal } from './access-codes/components/CreateAccessCodeModal'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

export default function AccessCodesPage() {
  const { codes, isLoading, createCode, deactivateCode } = useAccessCodes()
  const { churches } = useChurches()
  const { ministries } = useMinistries()
  const { teams } = useTeams()
  const { selectedChurch } = useChurch()
  const createModal = useModal()
  const deactivateAlert = useModal()
  const [codeToDeactivate, setCodeToDeactivate] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCodes = useMemo(() => {
    if (!Array.isArray(codes)) {
      return []
    }
    return codes.filter(code => {
      const matchesSearch =
        searchTerm === '' ||
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.scopeName?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [codes, searchTerm])

  const activeCodes = useMemo(() => {
    return filteredCodes.filter(code => code.isActive && !code.isExpired)
  }, [filteredCodes])

  const expiredCodes = useMemo(() => {
    return filteredCodes.filter(code => code.isExpired)
  }, [filteredCodes])

  const handleCreateCode = useCallback(
    async (dto: CreateAccessCodeDto) => {
      const result = await createCode(dto)
      if (result) {
        createModal.close()
      }
    },
    [createCode, createModal]
  )

  const handleDeactivateClick = useCallback(
    (codeId: string) => {
      setCodeToDeactivate(codeId)
      deactivateAlert.open()
    },
    [deactivateAlert]
  )

  const handleDeactivateConfirm = useCallback(async () => {
    if (codeToDeactivate) {
      await deactivateCode(codeToDeactivate)
      setCodeToDeactivate(null)
    }
  }, [codeToDeactivate, deactivateCode])

  const handleDeactivateCancel = useCallback(() => {
    setCodeToDeactivate(null)
    deactivateAlert.close()
  }, [deactivateAlert])

  const getScopeOptions = useCallback(() => {
    if (!selectedChurch) {
      return {
        churches: [],
        ministries: [],
        teams: [],
      }
    }

    const churchMinistries = ministries.filter(m => m.churchId === selectedChurch.id)
    const ministryTeams = teams.filter(t => churchMinistries.some(m => m.id === t.ministryId))

    return {
      churches,
      ministries: churchMinistries,
      teams: ministryTeams,
    }
  }, [selectedChurch, churches, ministries, teams])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-50">Códigos de Acesso</h1>
          <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
            Gerencie códigos para ativação em massa de contas
          </p>
        </div>
        <Button onClick={createModal.open}>Criar Novo Código</Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-dark-600 dark:text-dark-400">Códigos Ativos</div>
          <div className="text-2xl font-bold text-dark-900 dark:text-dark-50">
            {activeCodes.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-dark-600 dark:text-dark-400">Códigos Expirados</div>
          <div className="text-2xl font-bold text-dark-900 dark:text-dark-50">
            {expiredCodes.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-dark-600 dark:text-dark-400">
            Total de Ativações Completadas
          </div>
          <div className="text-2xl font-bold text-dark-900 dark:text-dark-50">
            {filteredCodes.reduce((sum, code) => sum + code.usageCount, 0)}
          </div>
        </Card>
      </div>

      {/* Busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por código ou escopo..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md h-11 px-4 rounded-lg bg-white border border-dark-300 text-dark-900 placeholder:text-dark-500 dark:bg-dark-900 dark:border-dark-700 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Lista de Códigos */}
      {isLoading ? (
        <div className="text-center py-8 text-dark-600 dark:text-dark-400">Carregando...</div>
      ) : filteredCodes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-dark-600 dark:text-dark-400">
            {searchTerm ? 'Nenhum código encontrado' : 'Nenhum código criado ainda'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCodes.map(code => (
            <Card key={code.id} className="p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl font-bold text-dark-900 dark:text-dark-50">
                      {code.code}
                    </span>
                    <StatusBadge
                      status={code.isExpired ? 'inactive' : code.isActive ? 'active' : 'inactive'}
                    >
                      {code.isExpired ? 'Expirado' : code.isActive ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </div>
                  <div className="text-sm text-dark-600 dark:text-dark-400 space-y-1">
                    <div>
                      <strong>Escopo:</strong> {code.scopeType} - {code.scopeName ?? 'N/A'}
                    </div>
                    <div>
                      <strong>Usos:</strong> {code.usageCount}
                      {code.maxUsages ? ` / ${code.maxUsages}` : ' (ilimitado)'}
                    </div>
                    <div>
                      <strong>Expira em:</strong>{' '}
                      {format(new Date(code.expiresAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                    <div>
                      <strong>Criado em:</strong>{' '}
                      {format(new Date(code.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </div>
                </div>
                {code.isActive && !code.isExpired && (
                  <Button variant="danger" size="sm" onClick={() => handleDeactivateClick(code.id)}>
                    Desativar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateAccessCodeModal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        onCreate={handleCreateCode}
        scopeOptions={getScopeOptions()}
      />

      <Alert
        isOpen={deactivateAlert.isOpen}
        onClose={handleDeactivateCancel}
        type="warning"
        title="Desativar Código"
        message="Tem certeza que deseja desativar este código?"
        confirmText="Desativar"
        cancelText="Cancelar"
        onConfirm={handleDeactivateConfirm}
        showCancel={true}
      />
    </div>
  )
}
