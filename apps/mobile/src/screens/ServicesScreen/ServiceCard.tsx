import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { Service } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface ServiceCardProps {
  readonly service: Service
  readonly onEdit: (service: Service) => void
  readonly onDelete: (id: string) => void
}

function getDayLabel(dayOfWeek: number): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return days[dayOfWeek] ?? 'Dom'
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{service.name}</Text>
          <Text style={styles.time}>
            {getDayLabel(service.dayOfWeek)} às {service.time}
          </Text>
        </View>
      </View>

      <View style={styles.badges}>
        <View style={[styles.badge, service.isActive ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{service.isActive ? 'Ativo' : 'Inativo'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Editar"
          onPress={() => onEdit(service)}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Excluir"
          onPress={() => onDelete(service.id)}
          variant="outline"
          style={styles.deleteButton}
        />
      </View>
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
    marginBottom: themeSpacing.xs,
  },
  time: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: themeSpacing.xs,
    marginBottom: themeSpacing.md,
  },
  badge: {
    paddingHorizontal: themeSpacing.sm,
    paddingVertical: themeSpacing.xs / 2,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#d1fae5',
  },
  badgeInactive: {
    backgroundColor: themeColors.dark[800],
  },
  badgeText: {
    fontSize: themeTypography.sizes.xs,
    fontWeight: themeTypography.weights.medium,
    color: themeColors.text.default,
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
