import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface UserAvatarProps {
  readonly userName?: string
  readonly onPress: () => void
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

export function UserAvatar({ userName, onPress }: UserAvatarProps) {
  const initials = getUserInitials(userName)

  return (
    <TouchableOpacity
      style={styles.userButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: themeColors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.semibold,
    color: '#ffffff',
  },
  chevron: {
    fontSize: themeTypography.sizes.xs,
    color: themeColors.text.default,
  },
})
