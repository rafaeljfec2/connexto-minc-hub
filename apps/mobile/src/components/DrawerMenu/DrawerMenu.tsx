import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { CompositeNavigationProp } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList, MainTabParamList } from '@/navigator/navigator.types'
import { themeSpacing, themeTypography } from '@/theme'
import { MENU_ITEMS, type MenuItem } from './menuItems'
import { getScreenNameForMenuItem } from './navigationHelpers'
import { DrawerHeader } from './DrawerHeader'
import { MenuItem as MenuItemComponent } from './MenuItem'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

interface DrawerMenuProps {
  visible: boolean
  onClose: () => void
}

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>

export function DrawerMenu({ visible, onClose }: Readonly<DrawerMenuProps>) {
  const navigation = useNavigation<NavigationProp>()
  const { colors } = useTheme()
  const { logout } = useAuth()

  function handleLogout() {
    onClose()
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          logout().catch(() => {})
        },
      },
    ])
  }

  function handleItemPress(item: MenuItem) {
    onClose()

    if (item.screen) {
      // Navigate to a tab screen
      navigation.navigate(item.screen)
    } else {
      // Navigate to a hidden tab screen
      const screenName = getScreenNameForMenuItem(item)
      if (screenName) {
        navigation.navigate(screenName)
      }
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
        <View style={[styles.drawer, { backgroundColor: colors.background.default }]}>
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.card.border }]} />
          </View>
          <DrawerHeader onClose={onClose} />

          <View style={styles.contentContainer}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {MENU_ITEMS.map(item => (
                <MenuItemComponent
                  key={item.id}
                  item={item}
                  onPress={() => handleItemPress(item)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={[styles.footer, { borderTopColor: colors.card.border }]}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={[styles.logoutText, { color: '#ef4444' }]}>Sair</Text>
            </TouchableOpacity>
            <Text style={[styles.footerText, { color: colors.text.default }]}>MINC TEAMS</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  drawer: {
    width: '100%',
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: themeSpacing.sm,
    paddingBottom: themeSpacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  footer: {
    padding: themeSpacing.md,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    padding: themeSpacing.sm,
    marginBottom: themeSpacing.sm,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.semibold,
  },
})
