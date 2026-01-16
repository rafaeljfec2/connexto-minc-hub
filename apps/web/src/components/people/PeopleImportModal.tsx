import { useMemo, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { usePeopleImport } from './PeopleImportModal/hooks/usePeopleImport'
import { PeopleImportUploadStep } from './PeopleImportModal/components/PeopleImportUploadStep'
import { PeopleImportPreviewStep } from './PeopleImportModal/components/PeopleImportPreviewStep'
import { PeopleImportImportingStep } from './PeopleImportModal/components/PeopleImportImportingStep'
import { PeopleImportResultsStep } from './PeopleImportModal/components/PeopleImportResultsStep'
import type { ComboBoxOption } from '@/components/ui/ComboBox'

interface PeopleImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete?: () => void
}

export function PeopleImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: Readonly<PeopleImportModalProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
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
  } = usePeopleImport({ isOpen, onImportComplete })

  const ministryOptions = useMemo<ComboBoxOption<string>[]>(() => {
    return ministries
      .filter(m => m.isActive && m.churchId === selectedChurch?.id)
      .map(ministry => ({
        value: ministry.id,
        label: ministry.name,
      }))
  }, [ministries, selectedChurch?.id])

  const handleCloseModal = () => {
    reset()
    onClose()
  }

  const handleRetry = () => {
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelectWithRef = (file: File) => {
    handleFileSelect(file)
  }

  const renderStep = () => {
    switch (importStep) {
      case 'upload':
        return (
          <PeopleImportUploadStep onFileSelect={handleFileSelectWithRef} isParsing={isParsing} />
        )

      case 'preview':
        return (
          <PeopleImportPreviewStep
            parsedData={parsedData}
            teamMapping={teamMapping}
            teams={teams}
            selectedMinistryId={selectedMinistryId}
            onMinistryChange={setSelectedMinistryId}
            onTeamChange={handleTeamChange}
            onImport={handleImport}
            onRetry={handleRetry}
            isLoadingMinistries={isLoadingMinistries}
            ministryOptions={ministryOptions}
            isImporting={isImporting}
            currentImportProgress={currentImportProgress}
            statistics={statistics}
          />
        )

      case 'importing':
        return <PeopleImportImportingStep progress={currentImportProgress} />

      case 'results':
        return (
          <PeopleImportResultsStep
            results={importResults}
            parsedData={parsedData}
            onClose={handleCloseModal}
            onRetry={handleRetry}
          />
        )

      default:
        return null
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Importar Voluntários" size="xl">
      <div className="flex flex-col h-full max-h-[calc(90vh-8rem)]">{renderStep()}</div>
    </Modal>
  )
}
