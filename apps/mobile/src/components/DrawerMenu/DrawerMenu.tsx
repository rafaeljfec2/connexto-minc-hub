import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigator/navigator.types'
import { themeColors, themeSpacing } from '@/theme'
import { MENU_ITEMS, type MenuItem } from './menuItems'
import { getScreenNameForMenuItem } from './navigationHelpers'
import { DrawerHeader } from './DrawerHeader'
import { MenuItem as MenuItemComponent } from './MenuItem'

interface DrawerMenuProps {
  visible: boolean
  onClose: () => void
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const navigation = useNavigation<NavigationProp>()

  function handleItemPress(item: MenuItem) {
    onClose()

    if (item.screen) {
      navigation.navigate('Main', { screen: item.screen })
    } else {
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
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.drawer}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          <DrawerHeader onClose={onClose} />

          <View style={styles.contentContainer}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {MENU_ITEMS.map(item => (
                <MenuItemComponent key={item.id} item={item} onPress={() => handleItemPress(item)} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>MINC TEAMS</Text>
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
    backgroundColor: themeColors.dark[900],
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
    backgroundColor: themeColors.dark[600],
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
    borderTopColor: themeColors.dark[800],
  },
  footerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: themeColors.text.default,
    textAlign: 'center',
  },
})
