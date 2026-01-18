import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface EmptyStateCardProps {
  readonly title: string
  readonly message: string
}

export function EmptyStateCard({ title, message }: EmptyStateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-dark-600 dark:text-dark-400">{message}</div>
      </CardContent>
    </Card>
  )
}
