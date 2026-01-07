import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DrawerMenu } from '../DrawerMenu'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface HeaderProps {
  readonly title: string
  readonly onMenuPress?: () => void
  readonly subtitle?: string
}

export function Header({ title, subtitle, onMenuPress }: HeaderProps) {
  const { colors, theme } = useTheme()
  const insets = useSafeAreaInsets()

  const [showDrawer, setShowDrawer] = useState(false)

  function handleMenuPress() {
    setShowDrawer(true)
    if (onMenuPress) {
      onMenuPress()
    }
  }

  // Dynamic background style
  const containerStyle = {
    backgroundColor: theme === 'dark' ? 'rgba(9, 9, 11, 0.95)' : '#ffffff',
    borderBottomColor: colors.card.border,
  }

  return (
    <View style={{ backgroundColor: containerStyle.backgroundColor, paddingTop: insets.top }}>
      <View style={[styles.container, containerStyle]}>
        <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress} activeOpacity={0.7}>
          <Text style={[styles.menuIcon, { color: colors.text.default }]}>☰</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text.default }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.text.dark }]}>{subtitle}</Text>
          )}
        </View>

        <View style={styles.rightContainer} />
      </View>

      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: themeSpacing.md,
    paddingVertical: themeSpacing.sm,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  menuButton: {
    padding: themeSpacing.xs,
    marginRight: themeSpacing.sm,
  },
  menuIcon: {
    fontSize: themeTypography.sizes.xl,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
  },
  subtitle: {
    fontSize: themeTypography.sizes.xs,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: themeSpacing.sm,
  },
})
