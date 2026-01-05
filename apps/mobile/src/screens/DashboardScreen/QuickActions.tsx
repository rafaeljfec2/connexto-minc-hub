import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface ActionItem {
  id: string
  label: string
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
}

interface QuickActionsProps {
  onActionPress: (actionId: string) => void
}

export function QuickActions({ onActionPress }: QuickActionsProps) {
  const actions: ActionItem[] = [
    {
      id: 'check-in',
      label: 'Check-in',
      icon: 'qr-code-outline',
      onPress: () => onActionPress('check-in'),
    },
    {
      id: 'schedules',
      label: 'Escalas',
      icon: 'calendar-outline',
      onPress: () => onActionPress('schedules'),
    },
    {
      id: 'teams',
      label: 'Equipes',
      icon: 'people-outline',
      onPress: () => onActionPress('teams'),
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: 'chatbubbles-outline',
      onPress: () => onActionPress('chat'),
    },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Acesso Rápido</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map(action => (
          <TouchableOpacity key={action.id} style={styles.actionButton} onPress={action.onPress}>
            <View style={styles.iconContainer}>
              <Ionicons name={action.icon} size={24} color={themeColors.primary[500]} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: themeSpacing.lg,
  },
  sectionTitle: {
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.text.default,
    marginBottom: themeSpacing.md,
    paddingHorizontal: themeSpacing.md,
  },
  scrollContent: {
    paddingHorizontal: themeSpacing.md,
    gap: themeSpacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    gap: themeSpacing.xs,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: themeColors.card.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.card.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  actionLabel: {
    fontSize: themeTypography.sizes.xs,
    color: themeColors.text.default,
    fontWeight: themeTypography.weights.medium,
  },
})
