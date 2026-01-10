import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/contexts/ThemeContext'
import { MOCK_USERS } from '@/constants/mockChatData'

export default function GroupDetailsScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { colors } = useTheme()
  // Generic params or fallbacks
  const params =
    (route.params as {
      conversationId?: string
      groupName?: string
      participants?: string[]
    }) || {}

  const groupName = params.groupName || 'Grupo'
  const participants = params.participants || []

  // Mock current user ID for checking admin status
  const currentUserId = 'me'

  // Mock admin status
  const isAdmin = true

  const handlePromoteToAdmin = (_participantId: string) => {
    Alert.alert('Promover a Admin', 'Deseja promover este participante a administrador do grupo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Promover',
        onPress: () => {
          Alert.alert('Sucesso', 'Participante promovido a admin!')
        },
      },
    ])
  }

  const handleLeaveGroup = () => {
    Alert.alert('Sair do Grupo', 'Tem certeza que deseja sair do grupo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          navigation.navigate('ChatList' as never)
        },
      },
    ])
  }

  const handleAddParticipant = () => {
    Alert.alert('Funcionalidade', 'Adicionar participante (Apenas Admin)')
  }

  const renderParticipant = ({ item }: { item: string }) => {
    // In real app 'item' would be a user object with role
    // We'll mock finding the user from MOCK_USERS if possible, or just string
    const user = Object.values(MOCK_USERS).find(u => u.id === item || u.name === item)
    const name = user ? user.name : item
    const avatar = user ? user.avatar : null
    const role = user?.role // Mock role

    return (
      <View style={styles.participantItem}>
        <Image
          source={{ uri: avatar || `https://ui-avatars.com/api/?name=${name}&background=random` }}
          style={styles.participantAvatar}
        />
        <View style={styles.participantInfo}>
          <Text style={[styles.participantName, { color: colors.text.default }]}>
            {name} {item === currentUserId && '(Você)'}
          </Text>
          <Text style={[styles.participantRole, { color: colors.text.light }]}>
            {role === 'admin' ? 'Admin' : 'Membro'}
          </Text>
        </View>
        {isAdmin && role !== 'admin' && item !== currentUserId && (
          <TouchableOpacity onPress={() => handlePromoteToAdmin(item)}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.default} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text.default }]}>Detalhes do Grupo</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.groupInfo}>
          <View style={[styles.groupAvatarContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="people" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.groupName, { color: colors.text.default }]}>{groupName}</Text>
          <Text style={[styles.participantCount, { color: colors.text.light }]}>
            {participants.length} participantes
          </Text>
        </View>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.card.border }]}
            onPress={handleAddParticipant}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Adicionar Participante
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text.default }]}>Participantes</Text>

        <FlatList
          data={participants}
          keyExtractor={item => item}
          renderItem={renderParticipant}
          style={styles.list}
        />

        <TouchableOpacity
          style={[styles.leaveButton, { backgroundColor: '#fee2e2' }]} // Red-100
          onPress={handleLeaveGroup}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.leaveButtonText, { color: '#ef4444' }]}>Sair do Grupo</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  groupInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  groupAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  participantCount: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  list: {
    flex: 1,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  participantRole: {
    fontSize: 12,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    gap: 8,
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
})
