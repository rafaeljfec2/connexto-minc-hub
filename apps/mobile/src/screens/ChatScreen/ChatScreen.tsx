import React, { useState } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Header } from '@/components'
import { MOCK_CONVERSATIONS } from '@/constants/mockChatData'
import { ConversationItem } from './components/ConversationItem'

interface Participant {
  id: string
  name: string
  avatar: string | null
}

export default function ChatScreen() {
  const navigation = useNavigation()
  const [conversations] = useState(MOCK_CONVERSATIONS)

  function handleConversationPress(conversationId: string, participants: Participant[]) {
    const otherParticipant = participants.find(p => p.id !== 'me')
    const otherUserId = otherParticipant?.id ?? ''

    // Simple logic for mock: if conversation is conv3, treat as group
    const isGroup = conversationId === 'conv3'
    const groupName = isGroup ? participants[0].name : undefined // Mock: user3 is group
    const participantIds = isGroup
      ? ['me', 'user1', 'user2'] // Mock participants for group
      : undefined

    navigation.navigate('ChatDetail', {
      conversationId,
      otherUserId,
      otherUserName: otherParticipant?.name,
      otherUserAvatar: otherParticipant?.avatar || undefined,
      isGroup,
      groupName,
      participants: participantIds,
    })
  }

  return (
    <View style={styles.container}>
      <Header title="Chat" subtitle="Comunicação com sua equipe" />
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={() => handleConversationPress(item.id, item.participants)}
          />
        )}
        style={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  list: {
    flex: 1,
  },
})
