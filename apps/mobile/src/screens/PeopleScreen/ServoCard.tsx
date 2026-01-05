import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Card, Button } from '@/components'
import { Person, Ministry, Team } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface ServoCardProps {
  person: Person
  ministry?: Ministry
  team?: Team
  onEdit?: (person: Person) => void
  onDelete?: (id: string) => void
}

export function ServoCard({ person, ministry, team, onEdit, onDelete }: ServoCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{person.name}</Text>
          {person.email && (
            <View style={styles.row}>
              <Text style={styles.label}>📧</Text>
              <Text style={styles.text} numberOfLines={1}>
                {person.email}
              </Text>
            </View>
          )}
          {person.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>📱</Text>
              <Text style={styles.text}>{person.phone}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.badges}>
        {ministry && (
          <View style={[styles.badge, styles.badgePrimary]}>
            <Text style={styles.badgeText}>{ministry.name}</Text>
          </View>
        )}
        {team && (
          <View style={[styles.badge, styles.badgeBlue]}>
            <Text style={styles.badgeText}>{team.name}</Text>
          </View>
        )}
        {!ministry && !team && (
          <View style={[styles.badge, styles.badgeGray]}>
            <Text style={styles.badgeText}>Sem time/equipe</Text>
          </View>
        )}
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <Button
              title="Editar"
              onPress={() => onEdit(person)}
              variant="outline"
              size="sm"
              style={styles.actionButton}
            />
          )}
          {onDelete && (
            <Button
              title="🗑️"
              onPress={() => onDelete(person.id)}
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
    marginBottom: themeSpacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: themeSpacing.xs,
  },
  label: {
    fontSize: themeTypography.sizes.sm,
    marginRight: themeSpacing.xs,
  },
  text: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
    flex: 1,
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
    borderWidth: 1,
  },
  badgePrimary: {
    backgroundColor: themeColors.primary[50] ?? '#fef3c7',
    borderColor: themeColors.primary[200] ?? '#fde68a',
  },
  badgeBlue: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  badgeGray: {
    backgroundColor: themeColors.dark[800],
    borderColor: themeColors.dark[700],
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
