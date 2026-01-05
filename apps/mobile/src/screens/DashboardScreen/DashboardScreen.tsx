import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Header } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { useAuth } from '@/contexts/AuthContext'
import { API_CONFIG } from '@/constants/config'
import { StatsCard } from './StatsCard'
import { InfoCard } from './InfoCard'

export default function DashboardScreen() {
  const { user } = useAuth()
  const isMockMode = API_CONFIG.MOCK_MODE

  const greeting = isMockMode
    ? 'Modo Desenvolvimento - Bem-vindo!'
    : `Bem-vindo, ${user?.name ?? 'Usuário'}`

  return (
    <View style={styles.container}>
      <Header title="Dashboard" subtitle={greeting} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>

        <View style={styles.statsGrid}>
          <StatsCard title="Total de Servos" value="0" />
          <StatsCard title="Equipes Ativas" value="0" />
          <StatsCard title="Próximo Culto" value="-" />
          <StatsCard title="Presença (Mês)" value="0%" />
        </View>

        <View style={styles.infoGrid}>
          <InfoCard title="Atividades Recentes">
            <Text style={styles.emptyText}>Nenhuma atividade recente</Text>
          </InfoCard>
          <InfoCard title="Próximas Escalas">
            <Text style={styles.emptyText}>Nenhuma escala agendada</Text>
          </InfoCard>
        </View>
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
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: themeSpacing.md,
    marginBottom: themeSpacing.lg,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: themeSpacing.md,
  },
  emptyText: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
  },
})
