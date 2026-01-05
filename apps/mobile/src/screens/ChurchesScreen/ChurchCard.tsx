import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { Church } from '@minc-hub/shared/types'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface ChurchCardProps {
  readonly church: Church
  readonly onEdit: (church: Church) => void
  readonly onDelete: (id: string) => void
}

export function ChurchCard({ church, onEdit, onDelete }: ChurchCardProps) {
  const { colors } = useTheme()

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text.default }]}>{church.name}</Text>
          {church.address && (
            <Text style={[styles.address, { color: colors.text.dark }]}>{church.address}</Text>
          )}
          {church.email && (
            <Text style={[styles.contactText, { color: colors.text.dark }]}>{church.email}</Text>
          )}
          {church.phone && (
            <Text style={[styles.contactText, { color: colors.text.dark }]}>{church.phone}</Text>
          )}
        </View>
      </View>

      <View style={[styles.actions, { borderTopColor: colors.card.border }]}>
        <Button
          title="Editar"
          onPress={() => onEdit(church)}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Excluir"
          onPress={() => onDelete(church.id)}
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
  address: {
    fontSize: themeTypography.sizes.sm,
    marginBottom: themeSpacing.xs,
  },
  contactText: {
    fontSize: themeTypography.sizes.sm,
    marginBottom: themeSpacing.xs / 2,
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
