import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Alert } from '@/components/ui/Alert'
import { TableRow, TableCell } from '@/components/ui/Table'
import { Skeleton } from '@/components/ui/Skeleton'
import { SortableColumn } from '@/components/ui/SortableColumn'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { CrudFilters } from '@/components/crud/CrudFilters'
import { CrudView } from '@/components/crud/CrudView'
import { useModal } from '@/hooks/useModal'
import { useViewMode } from '@/hooks/useViewMode'
import { useSort } from '@/hooks/useSort'
import { useAccessCodes, CreateAccessCodeDto, AccessCode } from '@/hooks/useAccessCodes'
import { useChurches } from '@/hooks/useChurches'
import { useMinistries } from '@/hooks/useMinistries'
import { useTeams } from '@/hooks/useTeams'
import { useChurch } from '@/contexts/ChurchContext'
import { CreateAccessCodeModal } from './access-codes/components/CreateAccessCodeModal'
import { AccessCodeCard } from './access-codes/components/AccessCodeCard'
import { AccessCodesMobileView } from './access-codes/components/AccessCodesMobileView'
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

  // Inicializar hook de ordenação
  const { sortConfig, handleSort, sortData } = useSort<AccessCode>({
    defaultKey: 'code',
    defaultDirection: 'asc',
  })

  // Extractors de ordenação (definido fora do useMemo para evitar dependência circular)
  const sortExtractors = useMemo(
    () => ({
      code: (item: AccessCode) => item.code.toLowerCase(),
      scopeType: (item: AccessCode) => item.scopeType.toLowerCase(),
      scopeName: (item: AccessCode) => item.scopeName?.toLowerCase() ?? '',
      scopeTypeAndName: (item: AccessCode) =>
        `${item.scopeType} - ${item.scopeName ?? 'N/A'}`.toLowerCase(),
      usageCount: (item: AccessCode) => item.usageCount,
      maxUsages: (item: AccessCode) => item.maxUsages ?? Number.MAX_SAFE_INTEGER,
      usageCountAndMax: (item: AccessCode) => {
        // Ordenar por usageCount primeiro, depois por maxUsages
        const max = item.maxUsages ?? Number.MAX_SAFE_INTEGER
        return item.usageCount * 1000000 + max
      },
      expiresAt: (item: AccessCode) => new Date(item.expiresAt).getTime(),
      createdAt: (item: AccessCode) => new Date(item.createdAt).getTime(),
      isActive: (item: AccessCode) => (item.isActive ? 1 : 0),
      isExpired: (item: AccessCode) => (item.isExpired ? 1 : 0),
      status: (item: AccessCode) => {
        // Ordenar: Ativo (1) > Inativo (2) > Expirado (3)
        if (item.isExpired) return 3
        if (item.isActive) return 1
        return 2
      },
    }),
    []
  )

  // Filtrar e ordenar os dados
  const filteredCodes = useMemo(() => {
    if (!Array.isArray(codes)) {
      return []
    }
    // Primeiro filtrar
    const filtered = codes.filter(code => {
      const matchesSearch =
        searchTerm === '' ||
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.scopeName?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
    // Depois ordenar
    return sortData(filtered, sortExtractors)
  }, [codes, searchTerm, sortData, sortExtractors])

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 sm:mb-8">
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

  // Função helper para renderizar cabeçalhos ordenáveis
  // Aceita tanto chaves do AccessCode quanto chaves customizadas dos extractors
  const renderHeader = (key: string, label: string) => (
    <SortableColumn sortKey={key} currentSort={sortConfig} onSort={handleSort}>
      {label}
    </SortableColumn>
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
      {/* Mobile View */}
      <AccessCodesMobileView
        codes={filteredCodes}
        isLoading={isLoading}
        searchTerm={searchTerm}
        hasFilters={searchTerm !== ''}
        viewMode={viewMode}
        onSearchChange={setSearchTerm}
        onViewModeChange={setViewMode}
        onCreateClick={createModal.open}
        onDeactivate={handleDeactivateClick}
        isDeleting={isLoading}
      />

      {/* Desktop View */}
      <div className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-6 sm:pb-8 lg:pt-4 lg:pb-8">
        <PageHeader
          title="Códigos de Acesso"
          description="Gerencie códigos para ativação em massa de contas"
          action={
            <Button onClick={createModal.open} variant="primary" className="w-full sm:w-auto">
              <PlusIcon className="h-5 w-5 mr-2" />
              Criar Novo Código
            </Button>
          }
        />

        {/* Estatísticas */}
        {statsCards}

        <CrudFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por código ou escopo..."
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {!isLoading && filteredCodes.length === 0 ? (
          <EmptyState
            title={searchTerm ? 'Nenhum código encontrado' : 'Nenhum código criado ainda'}
            description={
              searchTerm
                ? 'Tente ajustar os filtros para encontrar códigos'
                : 'Comece criando um novo código de acesso'
            }
            action={
              searchTerm ? undefined : (
                <Button onClick={createModal.open} variant="primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Criar Novo Código
                </Button>
              )
            }
          />
        ) : (
          <CrudView
            viewMode={viewMode}
            isLoading={isLoading}
            skeletonCard={AccessCodeCardSkeleton}
            skeletonRow={AccessCodeRowSkeleton}
            gridView={gridView}
            listView={{
              headers: [
                renderHeader('code', 'Código'),
                renderHeader('status', 'Status'),
                renderHeader('scopeTypeAndName', 'Escopo'),
                renderHeader('usageCountAndMax', 'Usos'),
                renderHeader('expiresAt', 'Expira em'),
                renderHeader('createdAt', 'Criado em'),
                'Ações', // Coluna sem ordenação
              ],
              rows: listViewRows,
            }}
          />
        )}
      </div>

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
