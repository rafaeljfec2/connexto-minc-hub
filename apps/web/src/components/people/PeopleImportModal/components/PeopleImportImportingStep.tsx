import { Loader2 } from 'lucide-react'

interface PeopleImportImportingStepProps {
  progress: number
}

export function PeopleImportImportingStep({ progress }: Readonly<PeopleImportImportingStepProps>) {
  return (
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
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-dark-700 dark:text-dark-300">{progress}% Completo</p>
    </div>
  )
}
