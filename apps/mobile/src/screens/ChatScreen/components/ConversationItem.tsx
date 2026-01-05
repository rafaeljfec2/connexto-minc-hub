import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { Conversation, MOCK_USERS } from '@/constants/mockChatData'

interface ConversationItemProps {
  conversation: Conversation
  onPress: () => void
}

export function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const otherParticipantId = conversation.participants.find(p => p.id !== 'me')?.id
  const otherUser = otherParticipantId ? MOCK_USERS[otherParticipantId] : null
  
  if (!otherUser) return null

  const lastMessageTime = new Date(conversation.lastMessage.timestamp)
  const timeString = isToday(lastMessageTime) 
    ? lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : lastMessageTime.toLocaleDateString()

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
        {otherUser.isOnline && <View style={styles.onlineBadge} />}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{otherUser.name}</Text>
          <Text style={styles.time}>{timeString}</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.message} numberOfLines={1}>
            {conversation.lastMessage.senderId === 'me' && 'Você: '}
            {conversation.lastMessage.text}
          </Text>
          {conversation.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

function isToday(date: Date) {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: themeSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.dark[800],
    alignItems: 'center',
    backgroundColor: themeColors.dark[900],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: themeSpacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: themeColors.dark[700],
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e', // green-500
    borderWidth: 2,
    borderColor: themeColors.dark[900],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.dark[100],
  },
  time: {
    fontSize: themeTypography.sizes.xs,
    color: themeColors.dark[400],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
    flex: 1,
    marginRight: themeSpacing.sm,
  },
  badge: {
    backgroundColor: themeColors.primary[600],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
})
