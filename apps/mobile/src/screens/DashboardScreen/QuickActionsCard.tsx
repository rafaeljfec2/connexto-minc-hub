import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigator/navigator.types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface QuickActionsCardProps {
  navigation: NavigationProp
}

const QUICK_ACTIONS = [
  { label: 'Ver Pessoas', screen: 'People' as const },
  { label: 'Ver Equipes', screen: 'Teams' as const },
  { label: 'Ver Escalas', screen: 'Schedules' as const },
] as const

export function QuickActionsCard({ navigation }: QuickActionsCardProps) {
  function handleNavigation(screen: 'People' | 'Teams' | 'Schedules') {
    if (screen === 'Schedules') {
      navigation.navigate('Main', { screen: 'Schedules' })
    } else {
      navigation.navigate(screen as never)
    }
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Ações Rápidas</Text>
      {QUICK_ACTIONS.map(action => (
        <Button
          key={action.screen}
          title={action.label}
          onPress={() => handleNavigation(action.screen)}
          variant="outline"
          style={styles.button}
        />
      ))}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: themeSpacing.md,
  },
  cardTitle: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.text.default,
    marginBottom: themeSpacing.sm,
  },
  button: {
    marginTop: themeSpacing.sm,
  },
})
