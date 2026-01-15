import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { AccessCode } from '@/hooks/useAccessCodes'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

interface AccessCodeCardProps {
  readonly code: AccessCode
  readonly onDeactivate?: (codeId: string) => void
  readonly isDeleting?: boolean
}

export function AccessCodeCard({ code, onDeactivate, isDeleting }: AccessCodeCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 truncate">
                {code.code}
              </h3>
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
        </div>

        {code.isActive && !code.isExpired && onDeactivate && (
          <div className="flex gap-2 pt-4 border-t border-dark-200 dark:border-dark-800">
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDeactivate(code.id)}
              disabled={isDeleting}
              className="w-full"
            >
              Desativar
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
