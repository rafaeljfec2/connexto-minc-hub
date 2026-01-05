import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { Church } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface ChurchCardProps {
  readonly church: Church
  readonly onEdit: (church: Church) => void
  readonly onDelete: (id: string) => void
}

export function ChurchCard({ church, onEdit, onDelete }: ChurchCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{church.name}</Text>
          {church.address && (
            <Text style={styles.address}>{church.address}</Text>
          )}
          {church.email && (
            <Text style={styles.contactText}>{church.email}</Text>
          )}
          {church.phone && (
            <Text style={styles.contactText}>{church.phone}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
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
    color: themeColors.text.default,
    marginBottom: themeSpacing.xs,
  },
  address: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
    marginBottom: themeSpacing.xs,
  },
  contactText: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
    marginBottom: themeSpacing.xs / 2,
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
