import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface ChatBubbleProps {
  message: string
  isMe: boolean
  timestamp: string
}

export function ChatBubble({ message, isMe, timestamp }: ChatBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <View style={[styles.container, isMe ? styles.containerMe : styles.containerOther]}>
      <Text style={[styles.message, isMe ? styles.messageMe : styles.messageOther]}>{message}</Text>
      <View style={styles.footer}>
        <Text style={[styles.time, isMe ? styles.timeMe : styles.timeOther]}>{time}</Text>
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
  containerMe: {
    alignSelf: 'flex-end',
    backgroundColor: themeColors.primary[600],
    borderBottomRightRadius: 4,
  },
  containerOther: {
    alignSelf: 'flex-start',
    backgroundColor: themeColors.dark[800],
    borderBottomLeftRadius: 4,
  },
  message: {
    fontSize: themeTypography.sizes.md,
    lineHeight: 22,
  },
  messageMe: {
    color: '#ffffff',
  },
  messageOther: {
    color: themeColors.dark[100],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  time: {
    fontSize: 10,
  },
  timeMe: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeOther: {
    color: themeColors.dark[400],
  },
})
