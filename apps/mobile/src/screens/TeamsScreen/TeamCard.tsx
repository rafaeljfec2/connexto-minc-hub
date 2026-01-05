import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { Team, Ministry } from '@minc-hub/shared/types'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface TeamCardProps {
  team: Team
  ministry?: Ministry
  onEdit?: (team: Team) => void
  onDelete?: (id: string) => void
}

export function TeamCard({ team, ministry, onEdit, onDelete }: TeamCardProps) {
  const { colors } = useTheme()

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text.default }]}>{team.name}</Text>
          {team.description && (
            <Text style={[styles.description, { color: colors.text.dark }]} numberOfLines={2}>
              {team.description}
            </Text>
          )}
          {ministry && (
            <Text style={[styles.ministry, { color: colors.text.dark }]}>{ministry.name}</Text>
          )}
          <Text style={[styles.members, { color: colors.text.dark }]}>
            {team.memberIds.length} membro{team.memberIds.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.badges}>
        <View
          style={[
            styles.badge,
            team.isActive
              ? { backgroundColor: '#d1fae5' }
              : { backgroundColor: colors.card.border },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              team.isActive ? { color: '#065f46' } : { color: colors.text.dark },
            ]}
          >
            {team.isActive ? 'Ativa' : 'Inativa'}
          </Text>
        </View>
      </View>

      {(onEdit || onDelete) && (
        <View style={[styles.actions, { borderTopColor: colors.card.border }]}>
          {onEdit && (
            <Button
              title="Editar"
              onPress={() => onEdit(team)}
              variant="outline"
              size="sm"
              style={styles.actionButton}
            />
          )}
          {onDelete && (
            <Button
              title="🗑️"
              onPress={() => onDelete(team.id)}
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
    marginBottom: themeSpacing.xs,
  },
  description: {
    fontSize: themeTypography.sizes.sm,
    marginBottom: themeSpacing.xs,
  },
  ministry: {
    fontSize: themeTypography.sizes.sm,
    marginBottom: themeSpacing.xs,
  },
  members: {
    fontSize: themeTypography.sizes.sm,
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
  badgeText: {
    fontSize: themeTypography.sizes.xs,
    fontWeight: themeTypography.weights.medium,
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
