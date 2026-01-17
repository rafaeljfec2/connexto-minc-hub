import { useState, FormEvent, ChangeEvent, useMemo } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ComboBox, type ComboBoxOption } from '@/components/ui/ComboBox'
import { AccessCodeScopeType, CreateAccessCodeDto } from '@/hooks/useAccessCodes'
import { Church, Ministry, Team } from '@minc-hub/shared/types'

interface CreateAccessCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (dto: CreateAccessCodeDto) => Promise<void>
  scopeOptions: {
    churches: Church[]
    ministries: Ministry[]
    teams: Team[]
  }
}

export function CreateAccessCodeModal({
  isOpen,
  onClose,
  onCreate,
  scopeOptions,
}: Readonly<CreateAccessCodeModalProps>) {
  const [code, setCode] = useState('')
  const [scopeType, setScopeType] = useState<AccessCodeScopeType>(AccessCodeScopeType.TEAM)
  const [scopeId, setScopeId] = useState('')
  const [expiresInDays, setExpiresInDays] = useState(30)
  const [maxUsages, setMaxUsages] = useState<number | null>(null)
  const [codeError, setCodeError] = useState('')
  const [scopeIdError, setScopeIdError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableScopes = useMemo(() => {
    if (scopeType === AccessCodeScopeType.CHURCH) {
      return scopeOptions.churches
    }
    if (scopeType === AccessCodeScopeType.MINISTRY) {
      return scopeOptions.ministries
    }
    return scopeOptions.teams
  }, [scopeType, scopeOptions])

  // Determina se o ComboBox deve estar desabilitado
  const isScopeDisabled = useMemo(() => {
    // Desabilita se está submetendo ou se não há opções disponíveis
    return isSubmitting || availableScopes.length === 0
  }, [isSubmitting, availableScopes.length])

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Remove caracteres não alfanuméricos usando regex global
    // SonarQube sugere replaceAll, mas replaceAll não aceita regex, então usamos replace com flag global
    // NOSONAR: S7781 - replaceAll não aceita regex, replace com flag global é necessário
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    setCode(value)
    setCodeError('')
  }

  const handleScopeTypeChange = (value: AccessCodeScopeType | null) => {
    if (value) {
      setScopeType(value)
      setScopeId('')
      setScopeIdError('')
    }
  }

  const handleScopeIdChange = (value: string | null) => {
    if (value) {
      setScopeId(value)
      setScopeIdError('')
    } else {
      setScopeId('')
      setScopeIdError('')
    }
  }

  const scopeTypeOptions: ComboBoxOption<AccessCodeScopeType>[] = useMemo(
    () => [
      { value: AccessCodeScopeType.CHURCH, label: 'Igreja' },
      { value: AccessCodeScopeType.MINISTRY, label: 'Ministério' },
      { value: AccessCodeScopeType.TEAM, label: 'Time' },
    ],
    []
  )

  const scopeComboBoxOptions: ComboBoxOption<string>[] = useMemo(
    () =>
      availableScopes.map(scope => ({
        value: scope.id,
        label: scope.name,
      })),
    [availableScopes]
  )

  const handleMaxUsagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    if (value === '') {
      setMaxUsages(null)
    } else {
      const num = Number.parseInt(value, 10)
      if (!Number.isNaN(num) && num > 0) {
        setMaxUsages(num)
      }
    }
  }

  const getScopeLabel = (): string => {
    if (scopeType === AccessCodeScopeType.CHURCH) {
      return 'Igreja'
    }
    if (scopeType === AccessCodeScopeType.MINISTRY) {
      return 'Ministério'
    }
    return 'Time'
  }

  const getEmptyMessage = (): string => {
    if (availableScopes.length === 0) {
      if (scopeType === AccessCodeScopeType.CHURCH) {
        return 'Nenhuma igreja disponível. Selecione uma igreja primeiro.'
      }
      if (scopeType === AccessCodeScopeType.MINISTRY) {
        return 'Nenhum ministério disponível. Selecione uma igreja primeiro ou verifique se há ministérios cadastrados.'
      }
      return 'Nenhum time disponível. Selecione uma igreja e um ministério primeiro.'
    }
    return 'Nenhuma opção encontrada'
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCodeError('')
    setScopeIdError('')

    // Validações
    if (!code.trim()) {
      setCodeError('Código é obrigatório')
      return
    }

    if (code.length < 4) {
      setCodeError('Código deve ter no mínimo 4 caracteres')
      return
    }

    if (!scopeId) {
      setScopeIdError('Selecione um escopo')
      return
    }

    if (expiresInDays < 1 || expiresInDays > 365) {
      return
    }

    setIsSubmitting(true)
    try {
      await onCreate({
        code,
        scopeType,
        scopeId,
        expiresInDays,
        maxUsages,
      })
      // Reset form
      setCode('')
      setScopeType(AccessCodeScopeType.TEAM)
      setScopeId('')
      setExpiresInDays(30)
      setMaxUsages(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar Código de Acesso" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="space-y-4 overflow-y-auto overscroll-contain max-h-[calc(65vh-8rem)]">
          <Input
            label="Código"
            placeholder="MINC2024"
            value={code}
            onChange={handleCodeChange}
            error={codeError}
            disabled={isSubmitting}
            required
            maxLength={50}
            autoFocus
          />

          <ComboBox
            label="Tipo de Escopo"
            options={scopeTypeOptions}
            value={scopeType}
            onValueChange={handleScopeTypeChange}
            disabled={isSubmitting}
            placeholder="Selecione o tipo de escopo"
            searchable
          />

          <ComboBox
            label={getScopeLabel()}
            options={scopeComboBoxOptions}
            value={scopeId || null}
            onValueChange={handleScopeIdChange}
            disabled={isScopeDisabled}
            error={
              scopeIdError ||
              (isScopeDisabled && !isSubmitting && availableScopes.length === 0
                ? getEmptyMessage()
                : undefined)
            }
            placeholder="Selecione..."
            searchable
            emptyMessage={getEmptyMessage()}
          />

          <Input
            label="Dias de Validade"
            type="number"
            min={1}
            max={365}
            value={expiresInDays}
            onChange={e => setExpiresInDays(Number.parseInt(e.target.value, 10) || 30)}
            disabled={isSubmitting}
            required
          />

          <Input
            label="Limite de Usos (opcional)"
            type="number"
            min={1}
            placeholder="Deixe vazio para ilimitado"
            value={maxUsages ?? ''}
            onChange={handleMaxUsagesChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-6 border-t border-dark-200 dark:border-dark-800 mt-6 flex-shrink-0 pb-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Criar Código
          </Button>
        </div>
      </form>
    </Modal>
  )
}
