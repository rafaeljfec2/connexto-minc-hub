import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { Schedule } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { formatDate } from '@minc-hub/shared/utils'

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
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{serviceName ?? 'Culto não encontrado'}</Text>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Data: </Text>
            <Text style={styles.detailValue}>{formatDate(schedule.date)}</Text>
          </View>
          {teamNames && (
            <View style={styles.detail}>
              <Text style={styles.detailLabel}>Equipes: </Text>
              <Text style={styles.detailValue}>{teamNames}</Text>
            </View>
          )}
        </View>
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
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
    color: themeColors.text.default,
    marginBottom: themeSpacing.sm,
  },
  detail: {
    flexDirection: 'row',
    marginBottom: themeSpacing.xs,
  },
  detailLabel: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.dark[300],
  },
  detailValue: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: themeSpacing.sm,
    paddingTop: themeSpacing.md,
    borderTopWidth: 1,
    borderTopColor: themeColors.dark[800],
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: themeSpacing.md,
  },
})
