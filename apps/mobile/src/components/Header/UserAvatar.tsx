import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface UserAvatarProps {
  readonly userName?: string
  readonly onPress: () => void
  readonly size?: number
}

function getUserInitials(userName?: string): string {
  if (!userName) return 'U'
  const parts = userName.split(' ')
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? ''
    const last = parts.at(-1)?.[0] ?? ''
    return `${first}${last}`.toUpperCase()
  }
  return userName[0]?.toUpperCase() ?? 'U'
}

export function UserAvatar({ userName, onPress, size = 36 }: UserAvatarProps) {
  const initials = getUserInitials(userName)
  const fontSize = size * 0.4

  return (
    <TouchableOpacity style={styles.userButton} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.avatarText, { fontSize }]}>{initials}</Text>
      </View>
      <Text style={styles.chevron}>▼</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeSpacing.xs,
  },
  avatar: {
    backgroundColor: themeColors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: themeTypography.weights.semibold,
    color: '#ffffff',
  },
  chevron: {
    fontSize: themeTypography.sizes.xs,
    color: themeColors.text.default,
  },
})
