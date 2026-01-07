import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface DrawerHeaderProps {
  readonly onClose: () => void
}

import { UserAvatar } from '@/components/Header/UserAvatar'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'

import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigator/navigator.types'

export function DrawerHeader({ onClose }: DrawerHeaderProps) {
  const { colors } = useTheme()
  const { user } = useAuth()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const handleProfilePress = () => {
    onClose()
    // navigate to profile if possible, or just do nothing
    // navigation.navigate('Main', { screen: 'Profile' }) - need correct typing
  }

  return (
    <View style={[styles.header, { borderBottomColor: colors.card.border }]}>
      <View style={styles.userInfo}>
        <UserAvatar userName={user?.name || 'User'} size={40} onPress={handleProfilePress} />
        <View>
          <Text style={[styles.userName, { color: colors.text.default }]}>
            {user?.name || 'Usuário'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.text.dark }]}>{user?.email || ''}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <ThemeToggle />
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={[styles.closeIcon, { color: colors.text.default }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: themeSpacing.lg,
    paddingHorizontal: themeSpacing.md,
    paddingBottom: themeSpacing.md,
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeSpacing.sm,
    flex: 1,
  },
  userName: {
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.semibold,
  },
  userEmail: {
    fontSize: themeTypography.sizes.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeSpacing.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
  },
  closeIcon: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.bold,
  },
})
