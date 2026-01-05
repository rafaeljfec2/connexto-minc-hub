import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { DrawerMenu } from '@/components/DrawerMenu'
import { UserMenu } from './UserMenu'
import { UserAvatar } from './UserAvatar'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface HeaderProps {
  readonly title: string
  readonly onMenuPress?: () => void
  readonly subtitle?: string
}

export function Header({ title, subtitle, onMenuPress }: HeaderProps) {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

  function handleMenuPress() {
    setShowDrawer(true)
    if (onMenuPress) {
      onMenuPress()
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress} activeOpacity={0.7}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.rightContainer}>
          <UserAvatar userName={user?.name} onPress={() => setShowMenu(true)} />
        </View>
      </View>

      <UserMenu visible={showMenu} onClose={() => setShowMenu(false)} />

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'rgba(9, 9, 11, 0.95)', // dark-950/95 com backdrop blur effect
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: themeSpacing.md,
    paddingVertical: themeSpacing.sm,
    backgroundColor: 'rgba(9, 9, 11, 0.95)', // dark-950/95
    borderBottomWidth: 1,
    borderBottomColor: themeColors.dark[800], // dark-800
    minHeight: 56,
  },
  menuButton: {
    padding: themeSpacing.xs,
    marginRight: themeSpacing.sm,
  },
  menuIcon: {
    fontSize: themeTypography.sizes.xl,
    color: themeColors.text.default,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
    color: themeColors.text.default,
  },
  subtitle: {
    fontSize: themeTypography.sizes.xs,
    color: themeColors.dark[400],
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: themeSpacing.sm,
  },
})
