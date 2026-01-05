import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { Ministry } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface MinistryCardProps {
  readonly ministry: Ministry
  readonly churchName?: string
  readonly onEdit: (ministry: Ministry) => void
  readonly onDelete: (id: string) => void
}

export function MinistryCard({ ministry, churchName, onEdit, onDelete }: MinistryCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{ministry.name}</Text>
          {ministry.description && (
            <Text style={styles.description} numberOfLines={2}>
              {ministry.description}
            </Text>
          )}
          {churchName && (
            <Text style={styles.churchName}>{churchName}</Text>
          )}
        </View>
      </View>

      <View style={styles.badges}>
        <View style={[styles.badge, ministry.isActive ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{ministry.isActive ? 'Ativo' : 'Inativo'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Editar"
          onPress={() => onEdit(ministry)}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Excluir"
          onPress={() => onDelete(ministry.id)}
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
  description: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
    marginBottom: themeSpacing.xs,
  },
  churchName: {
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
