import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { User } from '@minc-hub/shared/types'
import { themeSpacing, themeTypography } from '@/theme'
import { getRoleLabel } from '@/utils/formatters'
import { useTheme } from '@/contexts/ThemeContext'

interface UserCardProps {
  readonly user: User
  readonly onEdit: (user: User) => void
  readonly onDelete: (id: string) => void
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const { colors } = useTheme()

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text.default }]}>{user.name}</Text>
          <Text style={[styles.email, { color: colors.text.dark }]}>{user.email}</Text>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: '#ffffff' }]}>{getRoleLabel(user.role)}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.actions, { borderTopColor: colors.card.border }]}>
        <Button
          title="Editar"
          onPress={() => onEdit(user)}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Excluir"
          onPress={() => onDelete(user.id)}
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
    marginBottom: themeSpacing.xs,
  },
  email: {
    fontSize: themeTypography.sizes.sm,
    marginBottom: themeSpacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
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
