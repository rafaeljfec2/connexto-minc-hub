import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface UserMenuProps {
  readonly visible: boolean
  readonly onClose: () => void
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

export function UserMenu({ visible, onClose }: UserMenuProps) {
  const { user, logout } = useAuth()

  function handleLogout() {
    onClose()
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

  const initials = getUserInitials(user?.name)

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menu}>
          <View style={styles.menuHeader}>
            <View style={styles.menuAvatar}>
              <Text style={styles.menuAvatarText}>{initials}</Text>
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
  )
}

const styles = StyleSheet.create({
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
