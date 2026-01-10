import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'
import { MOCK_USERS } from '@/constants/mockChatData'

export default function GroupDetailsScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { colors } = useTheme()
  const { groupName, participants } = route.params as {
    conversationId: string
    groupName: string
    participants: string[] // User IDs
  }

  const handleLeaveGroup = () => {
    Alert.alert('Sair do Grupo', 'Tem certeza que deseja sair do grupo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          // Mock leave action
          navigation.navigate('ChatList' as never)
        },
      },
    ])
  }

  const handleAddParticipant = () => {
    // Placeholder for adding participant feature
    Alert.alert('Info', 'Funcionalidade de adicionar participants em breve')
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.card.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.default} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.default }]}>Dados do Grupo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Group Info */}
        <View style={[styles.groupInfoCard, { backgroundColor: colors.card.background }]}>
          <View style={[styles.groupAvatarContainer, { backgroundColor: `${colors.primary}20` }]}>
            <Ionicons name="people" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.groupName, { color: colors.text.default }]}>{groupName}</Text>
          <Text style={[styles.participantCount, { color: colors.text.light }]}>
            {participants.length} participantes
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.card.border }]}
          onPress={handleAddParticipant}
        >
          <Ionicons name="person-add-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>
            Adicionar Participante
          </Text>
        </TouchableOpacity>

        {/* Participants List */}
        <Text style={[styles.sectionTitle, { color: colors.text.light }]}>PARTICIPANTES</Text>
        <View style={[styles.listContainer, { backgroundColor: colors.card.background }]}>
          {participants.map((userId, index) => {
            const user = MOCK_USERS[userId]
            if (!user) return null
            return (
              <View
                key={userId}
                style={[
                  styles.participantItem,
                  index < participants.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.card.border,
                  },
                ]}
              >
                <Image source={{ uri: user.avatar }} style={styles.participantAvatar} />
                <View style={styles.participantInfo}>
                  <Text style={[styles.participantName, { color: colors.text.default }]}>
                    {user.name}
                  </Text>
                  <Text style={[styles.participantStatus, { color: colors.text.light }]}>
                    {user.isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Leave Group */}
        <TouchableOpacity
          style={[styles.leaveButton, { backgroundColor: '#fee2e2' }]} // Red-100
          onPress={handleLeaveGroup}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={[styles.leaveButtonText, { color: '#ef4444' }]}>Sair do Grupo</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: themeSpacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.bold,
  },
  content: {
    padding: themeSpacing.md,
  },
  groupInfoCard: {
    alignItems: 'center',
    padding: themeSpacing.xl,
    borderRadius: 12,
    marginBottom: themeSpacing.md,
  },
  groupAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: themeSpacing.md,
  },
  groupName: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
    marginBottom: 4,
  },
  participantCount: {
    fontSize: themeTypography.sizes.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: themeSpacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: themeSpacing.lg,
    gap: 8,
  },
  actionButtonText: {
    fontWeight: themeTypography.weights.medium,
  },
  sectionTitle: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.semibold,
    marginBottom: themeSpacing.sm,
    paddingLeft: themeSpacing.xs,
  },
  listContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: themeSpacing.lg,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: themeSpacing.md,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: themeSpacing.md,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.medium,
  },
  participantStatus: {
    fontSize: themeTypography.sizes.xs,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: themeSpacing.md,
    borderRadius: 12,
    gap: 8,
  },
  leaveButtonText: {
    fontWeight: themeTypography.weights.bold,
  },
})
