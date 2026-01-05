import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { DashboardHeader } from './DashboardHeader'
import { StatsCard } from './StatsCard'
import { QuickActions } from './QuickActions'
import { ActivityFeed } from './ActivityFeed'
import { UpcomingServices } from './UpcomingServices'
import { DrawerMenu } from '@/components/DrawerMenu'
import { UserMenu } from '@/components/Header/UserMenu'
import { themeSpacing } from '@/theme'
import { API_CONFIG } from '@/constants/config'
import { MOCK_PEOPLE, MOCK_TEAMS, MOCK_SCHEDULES } from '@/constants/mockData'

export default function DashboardScreen() {
  const navigation = useNavigation<any>()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const isMockMode = API_CONFIG.MOCK_MODE

  const handleActionPress = (actionId: string) => {
    switch (actionId) {
      case 'check-in':
        navigation.navigate('Checkin')
        break
      case 'schedules':
        // Navigate to schedules or show modal
        Alert.alert('Em breve', 'Funcionalidade de escalas')
        break
      case 'teams':
        // Navigate to teams
        Alert.alert('Em breve', 'Funcionalidade de equipes')
        break
      case 'chat':
        navigation.navigate('Chat')
        break
      default:
        break
    }
  }

  // Transform Mocks for UI components
  const recentActivities = isMockMode
    ? [
        {
          id: '1',
          title: 'Novo Membro',
          description: 'João Silva foi adicionado',
          time: '2h atrás',
          icon: 'person-add-outline',
          color: '#10b981',
        },
        {
          id: '2',
          title: 'Escala Atualizada',
          description: 'Domingo Manhã - Louvor',
          time: '4h atrás',
          icon: 'calendar-outline',
          color: '#3b82f6',
        },
        {
          id: '3',
          title: 'Estudo Cancelado',
          description: 'Jovens - Sábado',
          time: 'ontem',
          icon: 'close-circle-outline',
          color: '#ef4444',
        },
      ]
    : []

  const upcomingServices = isMockMode
    ? MOCK_SCHEDULES.map(s => {
        const date = new Date(s.date)
        return {
          id: s.id,
          date: s.date,
          day: date.getDate().toString(),
          month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
          time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          name: 'Culto de Celebração',
          team: 'Equipe de Louvor',
        }
      })
    : []

  return (
    <View style={styles.container}>
      <DashboardHeader
        onMenuPress={() => setIsDrawerOpen(true)}
        onProfilePress={() => setIsUserMenuOpen(true)}
        onNotificationPress={() => Alert.alert('Notificações', 'Sem novas notificações')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <QuickActions onActionPress={handleActionPress} />

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatsCard
              title="Total Servos"
              value={isMockMode ? MOCK_PEOPLE.length.toString() : '0'}
              icon="people"
              trend="+2 novos"
            />
            <StatsCard
              title="Equipes"
              value={isMockMode ? MOCK_TEAMS.filter(t => t.isActive).length.toString() : '0'}
              icon="layers"
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard title="Próx. Culto" value="Dom 9h" icon="calendar" />
            <StatsCard title="Presença" value="85%" icon="stats-chart" trend="+5%" />
          </View>
        </View>

        <UpcomingServices services={upcomingServices} />

        <ActivityFeed activities={recentActivities as any} />
      </ScrollView>

      <DrawerMenu visible={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <UserMenu visible={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} />
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
  scrollContent: {
    paddingBottom: themeSpacing.xl,
  },
  statsContainer: {
    paddingHorizontal: themeSpacing.md,
    gap: themeSpacing.md,
    marginBottom: themeSpacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: themeSpacing.md,
  },
})
