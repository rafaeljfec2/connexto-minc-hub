import { useState, useCallback, useMemo, useEffect } from 'react'
import { usePeople } from '@/hooks/usePeople'
import { useTeams } from '@/hooks/useTeams'
import { useMinistries } from '@/hooks/useMinistries'
import { useChurch } from '@/contexts/ChurchContext'
import { useToast } from '@/contexts/ToastContext'
import { parseSpreadsheet, type ParsedRow } from '@/utils/spreadsheet-parser'
import { mapTeamNumberToTeamId } from '@/utils/team-mapper'
import { logger } from '@/lib/logger'
import type { Person } from '@minc-hub/shared/types'
import { MemberType } from '@minc-hub/shared/types'

export type ImportStep = 'upload' | 'preview' | 'importing' | 'results'

export interface ImportResult {
  rowNumber: number
  success: boolean
  person?: Person
  error?: string
}

interface UsePeopleImportProps {
  isOpen: boolean
  onImportComplete?: () => void
}

export function usePeopleImport({ isOpen, onImportComplete }: UsePeopleImportProps) {
  const { createPerson, refresh: refreshPeople } = usePeople()
  const { teams } = useTeams()
  const { ministries, fetchMinistries, isLoading: isLoadingMinistries } = useMinistries()
  const { selectedChurch } = useChurch()
  const { showSuccess, showError } = useToast()

  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [teamMapping, setTeamMapping] = useState<Map<number, string | null>>(new Map())
  const [selectedMinistryId, setSelectedMinistryId] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [currentImportProgress, setCurrentImportProgress] = useState(0)
  const [importStep, setImportStep] = useState<ImportStep>('upload')

  // Carregar ministérios apenas quando o modal abrir
  useEffect(() => {
    if (isOpen && selectedChurch) {
      fetchMinistries().catch(error => {
        logger.error('Erro ao carregar ministérios', 'PeopleImportModal', error)
      })
    }
  }, [isOpen, selectedChurch, fetchMinistries])

  // Estatísticas calculadas
  const statistics = useMemo(() => {
    const totalRows = parsedData.length
    const totalValidRows = parsedData.filter(row => row.errors.length === 0).length
    const totalInvalidRows = parsedData.filter(row => row.errors.length > 0).length
    const hasErrors = parsedData.some(row => row.errors.length > 0)
    const successfulImports = importResults.filter(r => r.success).length
    const failedImports = importResults.filter(r => !r.success).length

    return {
      totalRows,
      totalValidRows,
      totalInvalidRows,
      hasErrors,
      successfulImports,
      failedImports,
    }
  }, [parsedData, importResults])

  // Processar arquivo selecionado
  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsParsing(true)
      setParsedData([])
      setTeamMapping(new Map())
      setImportResults([])
      setCurrentImportProgress(0)

      try {
        const data = await parseSpreadsheet(file)

        // Auto-mapear equipes
        const newTeamMapping = new Map<number, string | null>()
        data.forEach(row => {
          if (row.equipe) {
            const teamId = mapTeamNumberToTeamId(row.equipe, teams)
            newTeamMapping.set(row.rowNumber, teamId)
          }
        })

        setParsedData(data)
        setTeamMapping(newTeamMapping)
        setImportStep('preview')
        showSuccess(`Arquivo "${file.name}" carregado com sucesso!`)
      } catch (error) {
        logger.error('Erro ao carregar planilha', 'PeopleImportModal', error)
        showError(
          error instanceof Error ? error.message : 'Erro desconhecido ao carregar planilha.'
        )
        setImportStep('upload')
      } finally {
        setIsParsing(false)
      }
    },
    [showSuccess, showError, teams]
  )

  // Executar importação
  const handleImport = useCallback(async () => {
    if (!selectedMinistryId) {
      showError('Selecione um time antes de importar os voluntários')
      return
    }

    setIsImporting(true)
    setImportStep('importing')
    setImportResults([])
    setCurrentImportProgress(0)

    const results: ImportResult[] = []
    const validRows = parsedData.filter(row => row.errors.length === 0)

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i]
      try {
        const teamId = teamMapping.get(row.rowNumber) ?? null

        const personData = {
          name: row.nome,
          phone: row.telefone,
          ministryId: selectedMinistryId ?? undefined,
          teamId: teamId ?? undefined,
          teamMembers: teamId
            ? [
                {
                  teamId,
                  memberType: MemberType.FIXED,
                },
              ]
            : undefined,
        } as Omit<Person, 'id' | 'createdAt' | 'updatedAt'>

        const newPerson = await createPerson(personData)
        results.push({ rowNumber: row.rowNumber, success: true, person: newPerson })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao criar pessoa'
        logger.error(
          `Erro ao importar pessoa da linha ${row.rowNumber}`,
          'PeopleImportModal',
          error
        )
        results.push({
          rowNumber: row.rowNumber,
          success: false,
          error: errorMessage,
        })
      }
      setCurrentImportProgress(Math.round(((i + 1) / validRows.length) * 100))
    }

    setImportResults(results)
    setImportStep('results')
    setIsImporting(false)
    await refreshPeople()
    if (onImportComplete) {
      onImportComplete()
    }
  }, [
    parsedData,
    teamMapping,
    selectedMinistryId,
    createPerson,
    refreshPeople,
    onImportComplete,
    showError,
  ])

  // Resetar estado
  const reset = useCallback(() => {
    setParsedData([])
    setTeamMapping(new Map())
    setSelectedMinistryId(null)
    setImportResults([])
    setCurrentImportProgress(0)
    setImportStep('upload')
  }, [])

  // Atualizar mapeamento de equipe
  const handleTeamChange = useCallback((rowNumber: number, newTeamId: string) => {
    setTeamMapping(prev => {
      const newMap = new Map(prev)
      newMap.set(rowNumber, newTeamId)
      return newMap
    })
  }, [])

  return {
    // Estado
    parsedData,
    teamMapping,
    selectedMinistryId,
    setSelectedMinistryId,
    isParsing,
    isImporting,
    importResults,
    currentImportProgress,
    importStep,
    statistics,

    // Dados externos
    teams,
    ministries,
    isLoadingMinistries,
    selectedChurch,

    // Handlers
    handleFileSelect,
    handleImport,
    handleTeamChange,
    reset,
  }
}
