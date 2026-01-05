import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Input, Header } from '@/components'
import { Schedule, Service, Team } from '@minc-hub/shared/types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { MOCK_SCHEDULES, MOCK_SERVICES, MOCK_TEAMS } from '@/constants/mockData'
import { ScheduleCard } from './ScheduleCard'
import { formatDate } from '@minc-hub/shared/utils'

export default function SchedulesScreen() {
  const [schedules] = useState<Schedule[]>(MOCK_SCHEDULES)
  const [services] = useState<Service[]>(MOCK_SERVICES)
  const [teams] = useState<Team[]>(MOCK_TEAMS)
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      const service = services.find(s => s.id === schedule.serviceId)
      const matchesSearch =
        searchTerm === '' ||
        service?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(schedule.date).toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [schedules, searchTerm, services])

  function getServiceName(serviceId: string): string | undefined {
    return services.find(s => s.id === serviceId)?.name
  }

  function getTeamNames(teamIds: string[]): string {
    return teamIds
      .map(id => teams.find(t => t.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  function handleEdit(schedule: Schedule) {
    console.log('Edit schedule:', schedule)
  }

  function handleDelete(id: string) {
    console.log('Delete schedule:', id)
  }

  function renderItem({ item }: { item: Schedule }) {
    const serviceName = getServiceName(item.serviceId)
    const teamNames = getTeamNames(item.teamIds)

    return (
      <ScheduleCard
        schedule={item}
        serviceName={serviceName}
        teamNames={teamNames}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    )
  }

  function renderEmpty() {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {searchTerm ? 'Nenhuma escala encontrada' : 'Nenhuma escala agendada'}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Escalas" subtitle="Gerencie escalas de cultos" />

      <View style={styles.filters}>
        <Input
          placeholder="Buscar por culto ou data..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          containerStyle={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredSchedules}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  filters: {
    paddingHorizontal: themeSpacing.md,
    paddingBottom: themeSpacing.sm,
  },
  searchInput: {
    marginBottom: 0,
  },
  list: {
    padding: themeSpacing.md,
    paddingTop: 0,
  },
  empty: {
    padding: themeSpacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[400],
    textAlign: 'center',
  },
})
