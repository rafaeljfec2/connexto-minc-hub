import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { Schedule } from '@minc-hub/shared/types'
import { themeSpacing, themeTypography } from '@/theme'
import { formatDate } from '@minc-hub/shared/utils'
import { useTheme } from '@/contexts/ThemeContext'

interface ScheduleCardProps {
  schedule: Schedule
  serviceName?: string
  teamNames?: string
  onEdit?: (schedule: Schedule) => void
  onDelete?: (id: string) => void
}

export function ScheduleCard({
  schedule,
  serviceName,
  teamNames,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  const { colors } = useTheme()

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text.default }]}>
            {serviceName ?? 'Culto não encontrado'}
          </Text>
          <View style={styles.detail}>
            <Text style={[styles.detailLabel, { color: colors.text.dark }]}>Data: </Text>
            <Text style={[styles.detailValue, { color: colors.text.dark }]}>
              {formatDate(schedule.date)}
            </Text>
          </View>
          {teamNames && (
            <View style={styles.detail}>
              <Text style={[styles.detailLabel, { color: colors.text.dark }]}>Equipes: </Text>
              <Text style={[styles.detailValue, { color: colors.text.dark }]}>{teamNames}</Text>
            </View>
          )}
        </View>
      </View>

      {(onEdit || onDelete) && (
        <View style={[styles.actions, { borderTopColor: colors.card.border }]}>
          {onEdit && (
            <Button
              title="Editar"
              onPress={() => onEdit(schedule)}
              variant="outline"
              size="sm"
              style={styles.actionButton}
            />
          )}
          {onDelete && (
            <Button
              title="🗑️"
              onPress={() => onDelete(schedule.id)}
              variant="outline"
              size="sm"
              style={styles.deleteButton}
            />
          )}
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: themeSpacing.md,
  },
  header: {
    marginBottom: themeSpacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.semibold,
    marginBottom: themeSpacing.sm,
  },
  detail: {
    flexDirection: 'row',
    marginBottom: themeSpacing.xs,
  },
  detailLabel: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.semibold,
  },
  detailValue: {
    fontSize: themeTypography.sizes.sm,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: themeSpacing.sm,
    paddingTop: themeSpacing.md,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: themeSpacing.md,
  },
})
