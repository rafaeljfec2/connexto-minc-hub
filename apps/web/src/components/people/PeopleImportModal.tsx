import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Info } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ComboBox, type ComboBoxOption } from '@/components/ui/ComboBox'
import { parseSpreadsheet, type ParsedRow } from '@/utils/spreadsheet-parser'
import { usePeople } from '@/hooks/usePeople'
import { useTeams } from '@/hooks/useTeams'
import { useMinistries } from '@/hooks/useMinistries'
import { useToast } from '@/contexts/ToastContext'
import { useChurch } from '@/contexts/ChurchContext'
import type { Person } from '@minc-hub/shared/types'
import { MemberType } from '@minc-hub/shared/types'
import { mapTeamNumberToTeamId } from '@/utils/team-mapper'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'

interface PeopleImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete?: () => void
}

interface ImportResult {
  rowNumber: number
  success: boolean
  person?: Person
  error?: string
}

export function PeopleImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: Readonly<PeopleImportModalProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { createPerson, refresh: refreshPeople } = usePeople()
  const { teams } = useTeams()
  const { ministries, fetchMinistries, isLoading: isLoadingMinistries } = useMinistries()
  const { selectedChurch } = useChurch()
  const { showSuccess, showError } = useToast()

  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [teamMapping, setTeamMapping] = useState<Map<number, string | null>>(new Map()) // rowNumber -> teamId
  const [selectedMinistryId, setSelectedMinistryId] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<ImportResult[]>([])
  const [currentImportProgress, setCurrentImportProgress] = useState(0)
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'importing' | 'results'>(
    'upload'
  )

  // Carregar ministérios apenas quando o modal abrir
  useEffect(() => {
    if (isOpen && selectedChurch) {
      fetchMinistries().catch(error => {
        logger.error('Erro ao carregar ministérios', 'PeopleImportModal', error)
      })
    }
  }, [isOpen, selectedChurch, fetchMinistries])

  const hasErrorsInPreview = useMemo(
    () => parsedData.some(row => row.errors.length > 0),
    [parsedData]
  )
  const totalValidRows = useMemo(
    () => parsedData.filter(row => row.errors.length === 0).length,
    [parsedData]
  )
  const totalInvalidRows = useMemo(
    () => parsedData.filter(row => row.errors.length > 0).length,
    [parsedData]
  )
  const totalRows = useMemo(() => parsedData.length, [parsedData])

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0]
      if (!selectedFile) {
        setParsedData([])
        setImportStep('upload')
        return
      }
      setIsParsing(true)
      setParsedData([])
      setTeamMapping(new Map())
      setImportResults([])
      setCurrentImportProgress(0)

      try {
        const data = await parseSpreadsheet(selectedFile)
        setParsedData(data)

        // Attempt to auto-map teams
        const newTeamMapping = new Map<number, string | null>()
        data.forEach(row => {
          if (row.equipe) {
            const teamId = mapTeamNumberToTeamId(row.equipe, teams)
            newTeamMapping.set(row.rowNumber, teamId)
          }
        })
        setTeamMapping(newTeamMapping)

        setImportStep('preview')
        showSuccess(`Arquivo "${selectedFile.name}" carregado com sucesso!`)
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

  const handleCloseModal = useCallback(() => {
    setParsedData([])
    setTeamMapping(new Map())
    setSelectedMinistryId(null)
    setImportResults([])
    setCurrentImportProgress(0)
    setImportStep('upload')
    onClose()
  }, [onClose])

  const handleRetry = useCallback(() => {
    setParsedData([])
    setTeamMapping(new Map())
    setSelectedMinistryId(null)
    setImportResults([])
    setCurrentImportProgress(0)
    setImportStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Clear the file input
    }
  }, [])

  const handleTeamChange = useCallback((rowNumber: number, newTeamId: string) => {
    setTeamMapping(prev => {
      const newMap = new Map(prev)
      newMap.set(rowNumber, newTeamId)
      return newMap
    })
  }, [])

  const ministryOptions = useMemo<ComboBoxOption<string>[]>(() => {
    return ministries
      .filter(m => m.isActive && m.churchId === selectedChurch?.id)
      .map(ministry => ({
        value: ministry.id,
        label: ministry.name,
      }))
  }, [ministries, selectedChurch?.id])

  const getTeamOptions = useMemo(() => {
    return teams.map(team => ({ value: team.id, label: team.name }))
  }, [teams])

  const successfulImports = useMemo(
    () => importResults.filter(r => r.success).length,
    [importResults]
  )
  const failedImports = useMemo(() => importResults.filter(r => !r.success).length, [importResults])

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Importar Voluntários" size="xl">
      <div className="flex flex-col h-full max-h-[calc(90vh-8rem)]">
        {importStep === 'upload' && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-dark-300 dark:border-dark-700 rounded-lg text-center">
            <Upload className="h-12 w-12 text-dark-400 dark:text-dark-600 mb-4" />
            <p className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2">
              Arraste e solte sua planilha aqui
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">
              ou clique para selecionar um arquivo (.csv, .xlsx, .xls)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={isParsing}
            />
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
              isLoading={isParsing}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isParsing ? 'Processando...' : 'Selecionar Arquivo'}
            </Button>
            <div className="mt-4 text-xs text-dark-500 dark:text-dark-400">
              Colunas esperadas: "Nome", "Telefone - whatsApp" (ou "Telefone"), "Equipe"
            </div>
          </div>
        )}

        {importStep === 'preview' && (
          <div className="flex flex-col h-full min-h-0">
            {/* Seleção de Time */}
            <div className="mb-4 pb-4 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
              {isLoadingMinistries && (
                <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando times...</span>
                </div>
              )}
              {!isLoadingMinistries && ministryOptions.length === 0 && (
                <div className="text-sm text-dark-600 dark:text-dark-400">
                  Nenhum time disponível. Verifique se há times cadastrados para esta igreja.
                </div>
              )}
              {!isLoadingMinistries && ministryOptions.length > 0 && (
                <ComboBox
                  options={ministryOptions}
                  value={selectedMinistryId}
                  onValueChange={setSelectedMinistryId}
                  label="Selecione o Time"
                  placeholder="Selecione um time para associar os voluntários"
                  searchable
                  searchPlaceholder="Buscar time..."
                  error={
                    parsedData.length > 0 && !selectedMinistryId
                      ? 'Selecione um time antes de importar'
                      : undefined
                  }
                  disabled={isLoadingMinistries}
                />
              )}
            </div>
            {/* Header com estatísticas */}
            <div className="mb-4 pb-4 border-b border-dark-200 dark:border-dark-800 flex-shrink-0">
              <h3 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-3">
                Pré-visualização dos Dados
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-dark-600 dark:text-dark-400">Total:</span>
                  <span className="font-semibold text-dark-900 dark:text-dark-50">{totalRows}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-dark-600 dark:text-dark-400">Válidos:</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {totalValidRows}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-dark-600 dark:text-dark-400">Inválidos:</span>
                  <span className="font-semibold text-red-700 dark:text-red-400">
                    {totalInvalidRows}
                  </span>
                </div>
              </div>
            </div>
            <div className="mb-4 flex-shrink-0">
              {hasErrorsInPreview && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-3 rounded-lg flex items-center gap-2">
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">
                    Foram encontrados erros em algumas linhas. Apenas as linhas válidas serão
                    importadas.
                  </p>
                </div>
              )}
              {!hasErrorsInPreview && parsedData.length === 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-3 rounded-lg flex items-center gap-2">
                  <Info className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">Nenhum dado válido encontrado na planilha.</p>
                </div>
              )}
            </div>

            {parsedData.length > 0 && (
              <div className="flex-1 min-h-0 overflow-auto mb-4">
                <div className="overflow-x-auto rounded-lg border border-dark-200 dark:border-dark-700">
                  <table className="w-full divide-y divide-dark-200 dark:divide-dark-700 table-fixed">
                    <thead className="bg-dark-50 dark:bg-dark-800">
                      <tr>
                        <th className="w-12 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                          Linha
                        </th>
                        <th className="w-1/4 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="w-24 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                          Telefone
                        </th>
                        <th className="w-20 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                          Equipe (Planilha)
                        </th>
                        <th className="w-1/3 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                          Equipe (Sistema)
                        </th>
                        <th className="w-20 px-2 py-1.5 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-900 divide-y divide-dark-200 dark:divide-dark-700">
                      {parsedData.map(row => {
                        const isValid = row.errors.length === 0
                        return (
                          <tr
                            key={row.rowNumber}
                            className={cn(
                              isValid ? 'bg-white dark:bg-dark-900' : 'bg-red-50 dark:bg-red-900/10'
                            )}
                          >
                            <td className="px-2 py-1.5 text-xs font-medium text-dark-900 dark:text-dark-50">
                              {row.rowNumber}
                            </td>
                            <td
                              className="px-2 py-1.5 text-xs text-dark-700 dark:text-dark-300 truncate"
                              title={row.nome}
                            >
                              {row.nome}
                            </td>
                            <td className="px-2 py-1.5 text-xs text-dark-700 dark:text-dark-300">
                              {row.telefone}
                            </td>
                            <td className="px-2 py-1.5 text-xs text-dark-700 dark:text-dark-300 text-center">
                              {row.equipe || '-'}
                            </td>
                            <td className="px-2 py-1.5 text-xs text-dark-700 dark:text-dark-300">
                              <div className="flex items-center gap-1.5">
                                {(() => {
                                  const mappedTeamId = teamMapping.get(row.rowNumber)
                                  const mappedTeam = mappedTeamId
                                    ? teams.find(t => t.id === mappedTeamId)
                                    : null
                                  return (
                                    <>
                                      {mappedTeam && (
                                        <span className="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded text-xs font-medium truncate max-w-[100px]">
                                          {mappedTeam.name}
                                        </span>
                                      )}
                                      <select
                                        value={mappedTeamId || ''}
                                        onChange={e =>
                                          handleTeamChange(row.rowNumber, e.target.value)
                                        }
                                        className={cn(
                                          'block flex-1 pl-2 pr-8 py-1 text-xs border-dark-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md',
                                          'bg-white dark:bg-dark-800 text-dark-900 dark:text-dark-50 border dark:border-dark-700',
                                          !isValid && 'opacity-50 cursor-not-allowed'
                                        )}
                                        disabled={!isValid}
                                      >
                                        <option value="">Nenhuma equipe</option>
                                        {getTeamOptions.map(option => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </>
                                  )
                                })()}
                              </div>
                            </td>
                            <td className="px-2 py-1.5 text-xs">
                              {isValid === false ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                  <XCircle className="h-3 w-3" />
                                  <span
                                    className="truncate max-w-[60px]"
                                    title={row.errors.join(', ')}
                                  >
                                    Erro
                                  </span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Válido
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer fixo */}
            <div className="mt-auto pt-4 border-t border-dark-200 dark:border-dark-800 flex justify-end gap-3 flex-shrink-0">
              <Button variant="secondary" onClick={handleRetry} disabled={isImporting}>
                Voltar
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                isLoading={isImporting}
                disabled={
                  isImporting ||
                  parsedData.length === 0 ||
                  totalValidRows === 0 ||
                  !selectedMinistryId
                }
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting
                  ? `Importando (${currentImportProgress}%)`
                  : `Importar ${totalValidRows} Voluntários`}
              </Button>
            </div>
          </div>
        )}

        {importStep === 'importing' && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="h-16 w-16 text-primary-500 animate-spin mb-4" />
            <p className="text-xl font-semibold text-dark-900 dark:text-dark-50 mb-2">
              Importando Voluntários...
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400 mb-4">
              Isso pode levar alguns minutos, por favor, não feche esta janela.
            </p>
            <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2.5 mb-4">
              <div
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${currentImportProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-dark-700 dark:text-dark-300">
              {currentImportProgress}% Completo
            </p>
          </div>
        )}

        {importStep === 'results' && (
          <div>
            <h3 className="text-xl font-bold text-dark-900 dark:text-dark-50 mb-4">
              Resultados da Importação
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {successfulImports}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">Importados com Sucesso</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-800 dark:text-red-200">{failedImports}</p>
                <p className="text-sm text-red-700 dark:text-red-300">Falhas na Importação</p>
              </div>
            </div>

            {failedImports > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-2">
                  Detalhes dos Erros
                </h4>
                <div className="overflow-x-auto rounded-lg border border-dark-200 dark:border-dark-700">
                  <table className="min-w-full divide-y divide-dark-200 dark:divide-dark-700">
                    <thead className="bg-dark-50 dark:bg-dark-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                          Linha
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                          Erro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-900 divide-y divide-dark-200 dark:divide-dark-700">
                      {importResults
                        .filter(r => !r.success)
                        .map(result => {
                          const originalRow = parsedData.find(
                            row => row.rowNumber === result.rowNumber
                          )
                          return (
                            <tr
                              key={result.rowNumber}
                              className="hover:bg-dark-50 dark:hover:bg-dark-800"
                            >
                              <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-dark-900 dark:text-dark-50">
                                {result.rowNumber}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-dark-700 dark:text-dark-300">
                                {originalRow?.nome || '-'}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                                {result.error}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={handleCloseModal}>
                Fechar
              </Button>
              <Button variant="primary" onClick={handleRetry}>
                Importar Outra Planilha
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
