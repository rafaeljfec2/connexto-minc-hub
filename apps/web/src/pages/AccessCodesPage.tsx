import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Alert } from '@/components/ui/Alert'
import { TableRow, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { CrudPageLayout } from '@/components/crud/CrudPageLayout'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { useModal } from '@/hooks/useModal'
import { useViewMode } from '@/hooks/useViewMode'
import { useAccessCodes, CreateAccessCodeDto } from '@/hooks/useAccessCodes'
import { useChurches } from '@/hooks/useChurches'
import { useMinistries } from '@/hooks/useMinistries'
import { useTeams } from '@/hooks/useTeams'
import { useChurch } from '@/contexts/ChurchContext'
import { CreateAccessCodeModal } from './access-codes/components/CreateAccessCodeModal'
import { AccessCodeCard } from './access-codes/components/AccessCodeCard'
import { PlusIcon } from '@/components/icons'
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

  const { viewMode, setViewMode } = useViewMode({
    storageKey: 'access-codes-view-mode',
    defaultMode: 'grid',
  })

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

  // Estatísticas
  const statsCards = (
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
  )

  // Skeleton para cards
  const AccessCodeCardSkeleton = (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </Card>
  )

  // Skeleton para linhas da tabela
  const AccessCodeRowSkeleton = (
    <>
      <TableCell>
        <Skeleton className="h-5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <div className="flex justify-end">
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </TableCell>
    </>
  )

  // Grid view
  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredCodes.map(code => (
        <AccessCodeCard
          key={code.id}
          code={code}
          onDeactivate={handleDeactivateClick}
          isDeleting={isLoading}
        />
      ))}
    </div>
  )

  // List view
  const listViewRows = filteredCodes.map(code => (
    <TableRow key={code.id}>
      <TableCell>
        <span className="font-medium">{code.code}</span>
      </TableCell>
      <TableCell>
        <StatusBadge status={code.isExpired ? 'inactive' : code.isActive ? 'active' : 'inactive'}>
          {code.isExpired ? 'Expirado' : code.isActive ? 'Ativo' : 'Inativo'}
        </StatusBadge>
      </TableCell>
      <TableCell>
        {code.scopeType} - {code.scopeName ?? 'N/A'}
      </TableCell>
      <TableCell>
        {code.usageCount}
        {code.maxUsages ? ` / ${code.maxUsages}` : ' (ilimitado)'}
      </TableCell>
      <TableCell>
        {format(new Date(code.expiresAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </TableCell>
      <TableCell>
        {format(new Date(code.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
      </TableCell>
      <TableCell className="text-right">
        {code.isActive && !code.isExpired && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeactivateClick(code.id)}
            disabled={isLoading}
          >
            Desativar
          </Button>
        )}
      </TableCell>
    </TableRow>
  ))

  return (
    <>
      {statsCards}
      <CrudPageLayout
        title="Códigos de Acesso"
        description="Gerencie códigos para ativação em massa de contas"
        createButtonLabel="Criar Novo Código"
        createButtonIcon={<PlusIcon className="h-5 w-5 mr-2" />}
        onCreateClick={createModal.open}
        hasFilters={searchTerm !== ''}
        isEmpty={filteredCodes.length === 0}
        emptyTitle={searchTerm ? 'Nenhum código encontrado' : 'Nenhum código criado ainda'}
        emptyDescription={
          searchTerm
            ? 'Tente ajustar os filtros para encontrar códigos'
            : 'Comece criando um novo código de acesso'
        }
        filters={
          <CrudFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por código ou escopo..."
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        }
        content={
          <CrudView
            viewMode={viewMode}
            isLoading={isLoading}
            skeletonCard={AccessCodeCardSkeleton}
            skeletonRow={AccessCodeRowSkeleton}
            gridView={gridView}
            listView={{
              headers: ['Código', 'Status', 'Escopo', 'Usos', 'Expira em', 'Criado em', 'Ações'],
              rows: listViewRows,
            }}
          />
        }
        isLoading={isLoading}
      />

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
    </>
  )
}
