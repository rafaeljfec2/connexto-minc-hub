import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Header, SearchBar, ListContainer, EmptyState } from '@/components'
import { Schedule, Service, Team } from '@minc-hub/shared/types'
import { MOCK_SCHEDULES, MOCK_SERVICES, MOCK_TEAMS } from '@/constants/mockData'
import { ScheduleCard } from './ScheduleCard'
import { useListScreen } from '@/hooks/useListScreen'
import { getServiceName, getTeamNames } from '@/utils/entityHelpers'
import { formatDate } from '@minc-hub/shared/utils'

export default function SchedulesScreen() {
  const [schedules] = useState<Schedule[]>(MOCK_SCHEDULES)
  const [services] = useState<Service[]>(MOCK_SERVICES)
  const [teams] = useState<Team[]>(MOCK_TEAMS)
  const [searchTerm, setSearchTerm] = useState('')

  const { filteredData, refreshing, handleRefresh } = useListScreen({
    data: schedules,
    searchTerm,
    customFilter: (schedule, term) => {
      const service = services.find(s => s.id === schedule.serviceId)
      const searchLower = term.toLowerCase()
      return (
        (service?.name.toLowerCase().includes(searchLower) ?? false) ||
        formatDate(schedule.date).toLowerCase().includes(searchLower)
      )
    },
  })

  function handleEdit(_schedule: Schedule) {
    // TODO: Implementar edição
  }

  function handleDelete(_id: string) {
    // TODO: Implementar deleção
  }

  const renderItem = React.useCallback(
    (props: { item: Schedule }) => {
      const { item } = props
      const serviceName = getServiceName(item.serviceId, services)
      const teamNames = getTeamNames(item.teamIds, teams)

      return (
        <ScheduleCard
          schedule={item}
          serviceName={serviceName}
          teamNames={teamNames}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )
    },
    [services, teams]
  )

  const emptyComponent = (
    <EmptyState
      message="Nenhuma escala encontrada"
      emptyMessage="Nenhuma escala agendada"
      searchTerm={searchTerm}
    />
  )
  return (
    <View style={styles.container}>
      <Header title="Escalas" subtitle="Gerencie escalas de cultos" />
      <SearchBar
        placeholder="Buscar por culto ou data..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <ListContainer
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        emptyComponent={emptyComponent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
})
