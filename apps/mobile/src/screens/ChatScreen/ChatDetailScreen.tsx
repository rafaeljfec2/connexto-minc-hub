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
  const {
    conversationId,
    otherUserId,
    otherUserName,
    otherUserAvatar,
    isGroup,
    groupName,
    participants,
  } = route.params as {
    conversationId: string
    otherUserId?: string
    otherUserName?: string
    otherUserAvatar?: string
    isGroup?: boolean
    groupName?: string
    participants?: string[]
  }
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  // Try to get user from params first, fallback to mock
  const mockUser = otherUserId ? MOCK_USERS[otherUserId] : undefined
  const otherUser = {
    id: otherUserId ?? '',
    name: otherUserName ?? mockUser?.name ?? 'Usuário',
    avatar: otherUserAvatar ?? mockUser?.avatar,
    isOnline: mockUser?.isOnline ?? false,
  }
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES[conversationId] || [])
  const flatListRef = useRef<FlatList>(null)

  // Header Data Logic
  const headerTitle = isGroup ? (groupName ?? 'Grupo') : otherUser.name
  const headerSubtitle = isGroup
    ? `${participants?.length ?? 0} participantes`
    : otherUser.isOnline
      ? 'Online'
      : ''
  const headerAvatar = isGroup ? undefined : otherUser.avatar

  const handleInfoPress = () => {
    if (isGroup && participants && groupName) {
      navigation.navigate('GroupDetails', {
        conversationId,
        groupName,
        participants,
      })
    } else if (otherUserId) {
      // For 1:1 conversations, navigate with user info
      navigation.navigate('GroupDetails', {
        conversationId,
        groupName: otherUser.name,
        participants: ['me', otherUserId],
      })
    }
  }

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

        <TouchableOpacity
          style={styles.headerContent}
          onPress={handleInfoPress}
          activeOpacity={0.7}
        >
          {isGroup ? (
            <View
              style={[
                styles.avatar,
                styles.groupAvatar,
                { backgroundColor: `${colors.primary}20` },
              ]}
            >
              <Ionicons name="people" size={20} color={colors.primary} />
            </View>
          ) : (
            <Image
              source={{ uri: headerAvatar || undefined }}
              style={[styles.avatar, { backgroundColor: colors.card.border }]}
            />
          )}

          <View>
            <Text style={[styles.name, { color: colors.text.default }]}>{headerTitle}</Text>
            {headerSubtitle && (
              <Text style={[styles.status, isGroup && { color: colors.text.light }]}>
                {headerSubtitle}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={24} color={colors.text.default} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleInfoPress}>
            <Ionicons name="information-circle-outline" size={24} color={colors.text.default} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isMe = item.senderId === 'me'
          const sender = !isMe && isGroup && item.senderId ? MOCK_USERS[item.senderId] : undefined

          return (
            <ChatBubble
              message={item.text}
              isMe={isMe}
              timestamp={item.timestamp}
              senderName={sender?.name}
            />
          )
        }}
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
  groupAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.semibold,
  },
  status: {
    fontSize: themeTypography.sizes.xs,
    color: '#22c55e',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
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
