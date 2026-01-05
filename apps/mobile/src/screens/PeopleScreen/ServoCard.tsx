import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { Person, Ministry, Team } from '@minc-hub/shared/types'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface ServoCardProps {
  person: Person
  ministry?: Ministry
  team?: Team
  onEdit?: (person: Person) => void
  onDelete?: (id: string) => void
}

export function ServoCard({ person, ministry, team, onEdit, onDelete }: Readonly<ServoCardProps>) {
  const { colors } = useTheme()

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text.default }]}>{person.name}</Text>
          {person.email && (
            <View style={styles.row}>
              <Text style={styles.label}>📧</Text>
              <Text style={[styles.text, { color: colors.text.dark }]} numberOfLines={1}>
                {person.email}
              </Text>
            </View>
          )}
          {person.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>📱</Text>
              <Text style={[styles.text, { color: colors.text.dark }]}>{person.phone}</Text>
            </View>
          )}
        </View>
      </View>

      {ministry && (
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' },
          ]}
        >
          <Text style={[styles.badgeText, { color: colors.primary }]}>{ministry.name}</Text>
        </View>
      )}
      {team && (
        <View style={[styles.badge, styles.badgeBlue]}>
          <Text style={[styles.badgeText, styles.badgeTextBlue]}>{team.name}</Text>
        </View>
      )}
      {!ministry && !team && (
        <View style={[styles.badge, { backgroundColor: colors.card.border }]}>
          <Text style={[styles.badgeText, { color: colors.text.dark }]}>Sem time/equipe</Text>
        </View>
      )}

      {(onEdit || onDelete) && (
        <View style={[styles.actions, { borderTopColor: colors.card.border }]}>
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
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: themeSpacing.sm,
    paddingVertical: themeSpacing.xs / 2,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: themeSpacing.xs,
    marginRight: themeSpacing.xs,
  },
  badgeBlue: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  badgeText: {
    fontSize: themeTypography.sizes.xs,
    fontWeight: themeTypography.weights.bold,
  },
  badgeTextBlue: {
    color: '#1e40af', // Blue 800
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
