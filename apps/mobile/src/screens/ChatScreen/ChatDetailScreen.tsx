import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { themeSpacing, themeTypography } from '@/theme'
import { MOCK_MESSAGES, MOCK_USERS, Message } from '@/constants/mockChatData'
import { ChatBubble } from './components/ChatBubble'
import { ChatInput } from './components/ChatInput'
import { useTheme } from '@/contexts/ThemeContext'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ChatDetailScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { conversationId, otherUserId } = route.params as {
    conversationId: string
    otherUserId: string
  }
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  const otherUser = MOCK_USERS[otherUserId]
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[conversationId] || [])
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    // Scroll to bottom on mount
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100)
  }, [])

  function handleSend(text: string) {
    const newMessage: Message = {
      id: Math.random().toString(),
      text,
      senderId: 'me',
      timestamp: new Date().toISOString(),
      read: false,
    }
    setMessages(prev => [...prev, newMessage])
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
  }

  const containerStyle = {
    backgroundColor: colors.background.default,
  }

  const headerStyle = {
    backgroundColor: colors.card.background,
    borderBottomColor: colors.card.border,
    paddingTop: Math.max(insets.top, 20),
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, containerStyle]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, headerStyle]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.default} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Image
            source={{ uri: otherUser?.avatar }}
            style={[styles.avatar, { backgroundColor: colors.card.border }]}
          />
          <View>
            <Text style={[styles.name, { color: colors.text.default }]}>{otherUser?.name}</Text>
            {otherUser?.isOnline && <Text style={styles.status}>Online</Text>}
          </View>
        </View>

        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text.default} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item.text}
            isMe={item.senderId === 'me'}
            timestamp={item.timestamp}
          />
        )}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <ChatInput onSend={handleSend} />
    </KeyboardAvoidingView>
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
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: themeSpacing.sm,
  },
  name: {
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.semibold,
  },
  status: {
    fontSize: themeTypography.sizes.xs,
    color: '#22c55e',
  },
  menuButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: themeSpacing.md,
    paddingBottom: themeSpacing.md,
  },
})
