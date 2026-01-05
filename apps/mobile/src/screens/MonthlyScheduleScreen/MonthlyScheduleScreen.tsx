import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Header } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

export default function MonthlyScheduleScreen() {
  return (
    <View style={styles.container}>
      <Header title="Sorteio Mensal" subtitle="Realize sorteios mensais de escalas" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.emptyText}>Funcionalidade em desenvolvimento</Text>
          <Text style={styles.emptyDescription}>
            Em breve você poderá realizar sorteios mensais de escalas aqui
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: themeSpacing.md,
    paddingTop: themeSpacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.text.default,
    textAlign: 'center',
    marginBottom: themeSpacing.sm,
  },
  emptyDescription: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[400],
    textAlign: 'center',
  },
})
