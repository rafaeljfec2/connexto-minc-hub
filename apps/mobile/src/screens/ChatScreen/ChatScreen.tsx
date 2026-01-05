import React, { useState } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Header } from '@/components'
import { themeColors } from '@/theme'
import { MOCK_CONVERSATIONS } from '@/constants/mockChatData'
import { ConversationItem } from './components/ConversationItem'

export default function ChatScreen() {
  const navigation = useNavigation()
  const [conversations] = useState(MOCK_CONVERSATIONS)

  function handleConversationPress(conversationId: string, participants: any[]) {
    const otherUserId = participants.find(p => p.id !== 'me')?.id
    // TypeScript will complain because we haven't updated params yet, we'll fix that next
    navigation.navigate('ChatDetail', {
      conversationId,
      otherUserId,
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
