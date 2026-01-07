import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { useNavigation, type NavigationProp } from '@react-navigation/native'
import { DashboardHeader } from './DashboardHeader'
import { StatsCard } from './StatsCard'
import { QuickActions } from './QuickActions'
import { ActivityFeed } from './ActivityFeed'
import { UpcomingServices } from './UpcomingServices'
import type { ActivityItem } from './ActivityFeed'
import { DrawerMenu } from '@/components/DrawerMenu'
import { FadeInView } from '@/components/Animations'
import { UserMenu } from '@/components/Header/UserMenu'
import { themeSpacing } from '@/theme'
import { API_CONFIG } from '@/constants/config'
import { MOCK_PEOPLE, MOCK_TEAMS, MOCK_SCHEDULES } from '@/constants/mockData'
import { churchesService } from '@/contexts/AuthContext'
import type { Option } from '@/components/Select/Select'
import type { MainTabParamList, RootStackParamList } from '@/navigator/navigator.types'

type DashboardNavigationProp = NavigationProp<MainTabParamList & RootStackParamList>

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [churches, setChurches] = useState<Option[]>([])
  const [selectedChurchId, setSelectedChurchId] = useState('')
  const isMockMode = API_CONFIG.MOCK_MODE

  useEffect(() => {
    async function loadChurches() {
      try {
        if (isMockMode) {
          const mockChurches = [
            { label: 'MINC - BH', value: '1' },
            { label: 'MINC - Santa Luzia', value: '2' },
          ]
          setChurches(mockChurches)
          setSelectedChurchId(mockChurches[0].value)
        } else {
          // Fallback if service not ready or returns empty
          try {
            const data = await churchesService.getAll()
            const options = data.map(c => ({ label: c.name, value: c.id }))
            setChurches(options)
            if (options.length > 0) {
              setSelectedChurchId(options[0].value)
            }
          } catch (e) {
            console.log('Error fetching churches, using mock', e)
            // simplified fallback
          }
        }
      } catch (error) {
        console.error('Failed to load churches:', error)
      }
    }
    loadChurches()
  }, [isMockMode])

  const handleActionPress = (actionId: string) => {
    switch (actionId) {
      case 'check-in':
        navigation.navigate('Checkin')
        break
      case 'schedules':
        Alert.alert('Em breve', 'Funcionalidade de escalas')
        break
      case 'teams':
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
  // ... rest of logic

  // Transform Mocks for UI components
  const recentActivities: ActivityItem[] = isMockMode
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
        selectedChurchId={selectedChurchId}
        onChurchChange={setSelectedChurchId}
        churches={churches}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView>
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

          <ActivityFeed activities={recentActivities} />
        </FadeInView>
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
