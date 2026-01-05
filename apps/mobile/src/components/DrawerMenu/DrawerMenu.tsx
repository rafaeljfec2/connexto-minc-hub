import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigator/navigator.types'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface DrawerMenuProps {
  visible: boolean
  onClose: () => void
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface MenuItem {
  id: string
  label: string
  iconName: keyof typeof Ionicons.glyphMap
  screen?: 'Dashboard' | 'Schedules' | 'Checkin' | 'Chat' | 'Profile'
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    iconName: 'home',
    screen: 'Dashboard',
  },
  {
    id: 'churches',
    label: 'Igrejas',
    iconName: 'business',
  },
  {
    id: 'ministries',
    label: 'Times',
    iconName: 'people',
  },
  {
    id: 'teams',
    label: 'Equipes',
    iconName: 'people-circle',
  },
  {
    id: 'people',
    label: 'Servos',
    iconName: 'person',
  },
  {
    id: 'users',
    label: 'Usuários',
    iconName: 'person-circle',
  },
  {
    id: 'services',
    label: 'Cultos',
    iconName: 'calendar',
  },
  {
    id: 'schedules',
    label: 'Escalas',
    iconName: 'calendar-outline',
    screen: 'Schedules',
  },
  {
    id: 'monthly-schedules',
    label: 'Sorteio Mensal',
    iconName: 'dice',
  },
  {
    id: 'communication',
    label: 'Comunicação',
    iconName: 'chatbubbles',
  },
  {
    id: 'profile',
    label: 'Perfil',
    iconName: 'settings',
    screen: 'Profile',
  },
]

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const navigation = useNavigation<NavigationProp>()

  function handleItemPress(item: MenuItem) {
    onClose()
    
    if (item.screen) {
      navigation.navigate('Main', { screen: item.screen })
    } else {
      const screenMap: Record<string, 'Churches' | 'Ministries' | 'Teams' | 'People' | 'Users' | 'Services' | 'MonthlySchedule' | 'Communication'> = {
        churches: 'Churches',
        ministries: 'Ministries',
        teams: 'Teams',
        people: 'People',
        users: 'Users',
        services: 'Services',
        'monthly-schedules': 'MonthlySchedule',
        communication: 'Communication',
      }
      const screenName = screenMap[item.id]
      if (screenName) {
        navigation.navigate(screenName as never)
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Menu</Text>
            <View style={styles.closeButtonPlaceholder} />
          </View>

          <View style={styles.contentContainer}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {MENU_ITEMS.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={item.iconName} size={24} color={themeColors.text.default} style={styles.menuIcon} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color={themeColors.dark[400]} />
                </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: themeSpacing.md,
    paddingHorizontal: themeSpacing.md,
    paddingBottom: themeSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.dark[800],
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: themeTypography.sizes.xl,
    color: themeColors.text.default,
    fontWeight: themeTypography.weights.bold,
  },
  title: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
    color: themeColors.text.default,
  },
  closeButtonPlaceholder: {
    width: 32,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: themeSpacing.md,
    paddingVertical: themeSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.dark[800],
  },
  menuIcon: {
    marginRight: themeSpacing.md,
    width: 24,
  },
  menuLabel: {
    flex: 1,
    fontSize: themeTypography.sizes.md,
    fontWeight: themeTypography.weights.medium,
    color: themeColors.text.default,
  },
  footer: {
    padding: themeSpacing.md,
    borderTopWidth: 1,
    borderTopColor: themeColors.dark[800],
  },
  footerText: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.bold,
    color: themeColors.text.default,
    textAlign: 'center',
  },
})
