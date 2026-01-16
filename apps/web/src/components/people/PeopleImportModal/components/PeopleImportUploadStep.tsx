import { useRef } from 'react'
import { Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PeopleImportUploadStepProps {
  onFileSelect: (file: File) => void
  isParsing: boolean
}

export function PeopleImportUploadStep({
  onFileSelect,
  isParsing,
}: Readonly<PeopleImportUploadStepProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
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
        onChange={handleFileChange}
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
  )
}
