import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { UserAvatar } from '@/components/Header/UserAvatar'

interface DashboardHeaderProps {
  onMenuPress?: () => void
  onProfilePress?: () => void
  onNotificationPress?: () => void
}

export function DashboardHeader({
  onMenuPress,
  onProfilePress,
  onNotificationPress,
}: DashboardHeaderProps) {
  const { user } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <Ionicons name="menu" size={28} color={themeColors.text.default} />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          <UserAvatar
            userName={user?.name || 'User'}
            onPress={onProfilePress || (() => {})}
            size={42}
          />
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name?.split(' ')[0] || 'Usuário'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={24} color={themeColors.text.default} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: themeSpacing.md, // Reduced padding to fit menu
    paddingVertical: themeSpacing.md,
    gap: themeSpacing.sm, // Add gap between elements
  },
  menuButton: {
    padding: themeSpacing.xs,
    marginRight: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: themeSpacing.sm,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.text.default,
    opacity: 0.8,
  },
  userName: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
    color: themeColors.text.default,
  },
  notificationButton: {
    padding: themeSpacing.sm,
    borderRadius: 12,
    backgroundColor: themeColors.card.background,
    borderWidth: 1,
    borderColor: themeColors.card.border,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: themeColors.primary[500],
    borderWidth: 1.5,
    borderColor: themeColors.card.background,
  },
})
