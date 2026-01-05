import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/contexts/AuthContext'
import { DrawerMenu } from '@/components/DrawerMenu'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface HeaderProps {
  readonly title: string
  readonly onMenuPress?: () => void
  readonly subtitle?: string
}

export function Header({ title, subtitle, onMenuPress }: HeaderProps) {
  const { user, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

  function handleMenuPress() {
    setShowDrawer(true)
    if (onMenuPress) {
      onMenuPress()
    }
  }

  function handleLogout() {
    setShowMenu(false)
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          logout().catch(() => {
            // Error handled silently
          })
        },
      },
    ])
  }

  function getUserInitials() {
    if (!user?.name) return 'U'
    const parts = user.name.split(' ')
    if (parts.length >= 2) {
      const first = parts[0]?.[0] ?? ''
      const last = parts.at(-1)?.[0] ?? ''
      return `${first}${last}`.toUpperCase()
    }
    return user.name[0]?.toUpperCase() ?? 'U'
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
          <TouchableOpacity
            style={styles.userButton}
            onPress={() => setShowMenu(!showMenu)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            </View>
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menu}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>{getUserInitials()}</Text>
              </View>
              <View style={styles.menuUserInfo}>
                <Text style={styles.menuUserName}>{user?.name ?? 'Usuário'}</Text>
                <Text style={styles.menuUserEmail}>{user?.email ?? ''}</Text>
              </View>
            </View>

            <View style={styles.menuSeparator} />

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
              <Text style={styles.menuItemText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menu: {
    backgroundColor: themeColors.dark[900],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: themeSpacing.xl,
    borderTopWidth: 1,
    borderTopColor: themeColors.dark[800],
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: themeSpacing.md,
    gap: themeSpacing.md,
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: themeColors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatarText: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.semibold,
    color: '#ffffff',
  },
  menuUserInfo: {
    flex: 1,
  },
  menuUserName: {
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.text.default,
    marginBottom: themeSpacing.xs / 2,
  },
  menuUserEmail: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
  },
  menuSeparator: {
    height: 1,
    backgroundColor: themeColors.dark[800],
    marginVertical: themeSpacing.sm,
  },
  menuItem: {
    padding: themeSpacing.md,
  },
  menuItemText: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.text.default,
  },
})
