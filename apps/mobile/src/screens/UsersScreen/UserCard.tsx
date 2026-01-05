import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { User } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface UserCardProps {
  readonly user: User
  readonly onEdit: (user: User) => void
  readonly onDelete: (id: string) => void
}

function getRoleLabel(role: string): string {
  const roleMap: Record<string, string> = {
    ADMIN: 'Admin',
    COORDINATOR: 'Coordenador',
    LEADER: 'Líder',
    MEMBER: 'Membro',
  }
  return roleMap[role] ?? role
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getRoleLabel(user.role)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
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
    color: themeColors.text.default,
    marginBottom: themeSpacing.xs,
  },
  email: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
    marginBottom: themeSpacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: themeSpacing.sm,
    paddingVertical: themeSpacing.xs / 2,
    borderRadius: 12,
    backgroundColor: themeColors.primary[500],
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
