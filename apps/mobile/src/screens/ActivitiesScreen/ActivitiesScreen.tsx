import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Header } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

export default function ActivitiesScreen() {
  return (
    <View style={styles.container}>
      <Header title="Atividades" subtitle="Visualize suas atividades recentes" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.emptyText}>Nenhuma atividade recente</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: themeSpacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[400],
    textAlign: 'center',
  },
})
