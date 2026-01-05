import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Header } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

export default function CommunicationScreen() {
  return (
    <View style={styles.container}>
      <Header title="Comunicação" subtitle="Comunicação com sua equipe" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.emptyText}>Nenhuma conversa disponível</Text>
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
