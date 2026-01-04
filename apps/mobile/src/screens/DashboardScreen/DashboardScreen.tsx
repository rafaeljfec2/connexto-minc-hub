import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Card, Button } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigator/navigator.types'
import { QuickActionsCard } from './QuickActionsCard'
import { QRCodeCard } from './QRCodeCard'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <QRCodeCard />
        <QuickActionsCard navigation={navigation} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background.light,
  },
  content: {
    padding: themeSpacing.md,
  },
  title: {
    fontSize: themeTypography.sizes['3xl'],
    fontWeight: themeTypography.weights.bold,
    color: themeColors.text.light,
    marginBottom: themeSpacing.lg,
  },
})
