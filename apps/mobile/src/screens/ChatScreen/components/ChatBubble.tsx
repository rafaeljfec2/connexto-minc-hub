import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface ChatBubbleProps {
  message: string
  isMe: boolean
  timestamp: string
  senderName?: string
}

export function ChatBubble({ message, isMe, timestamp, senderName }: Readonly<ChatBubbleProps>) {
  const { colors } = useTheme()
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Dynamic styles
  const bubbleStyle = isMe
    ? {
        alignSelf: 'flex-end' as const,
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
      }
    : {
        alignSelf: 'flex-start' as const,
        backgroundColor: colors.card.border,
        borderBottomLeftRadius: 4,
      }

  const messageColor = isMe ? { color: '#ffffff' } : { color: colors.text.default }

  const timeColor = isMe ? { color: 'rgba(255, 255, 255, 0.7)' } : { color: colors.text.dark }

  return (
    <View style={[styles.container, bubbleStyle]}>
      {!isMe && senderName && (
        <Text style={[styles.senderName, { color: colors.primary }]}>{senderName}</Text>
      )}
      <Text style={[styles.message, messageColor]}>{message}</Text>
      <View style={styles.footer}>
        <Text style={[styles.time, timeColor]}>{time}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    padding: themeSpacing.sm,
    paddingHorizontal: themeSpacing.md,
    borderRadius: 16,
    marginBottom: themeSpacing.sm,
  },
  message: {
    fontSize: themeTypography.sizes.md,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  time: {
    fontSize: 10,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
})
