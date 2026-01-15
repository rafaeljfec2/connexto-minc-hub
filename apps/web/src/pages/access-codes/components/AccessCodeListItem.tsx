import type { AccessCode } from '@/hooks/useAccessCodes'
import { CompactListItem } from '@/components/ui/CompactListItem'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

interface AccessCodeListItemProps {
  readonly code: AccessCode
  readonly onDeactivate?: (codeId: string) => void
  readonly isDeleting?: boolean
}

export function AccessCodeListItem({
  code,
  onDeactivate,
  isDeleting: _isDeleting,
}: Readonly<AccessCodeListItemProps>) {
  const scopeLabel = `${code.scopeType} - ${code.scopeName ?? 'N/A'}`
  const usageLabel = code.maxUsages
    ? `${code.usageCount} / ${code.maxUsages}`
    : `${code.usageCount} (ilimitado)`
  const expiresLabel = format(new Date(code.expiresAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const statusText = code.isExpired ? 'Expirado' : code.isActive ? 'Ativo' : 'Inativo'
  const statusVariant = code.isExpired ? 'warning' : code.isActive ? 'success' : 'error'

  return (
    <CompactListItem
      icon={
        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-mono text-xs font-semibold">
          {code.code.substring(0, 4)}
        </div>
      }
      title={code.code}
      subtitle={scopeLabel}
      metadata={`${usageLabel} • Expira em ${expiresLabel}`}
      badge={{ text: statusText, variant: statusVariant }}
      menuItems={
        code.isActive && !code.isExpired && onDeactivate
          ? [
              {
                label: 'Desativar',
                onClick: () => onDeactivate(code.id),
                icon: (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                ),
                className: 'text-red-600 dark:text-red-400',
              },
            ]
          : undefined
      }
    />
  )
}
