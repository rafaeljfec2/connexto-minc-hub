import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { themeColors, themeSpacing } from '@/theme'
import { Select } from '@/components/Select/Select'
import { useChurch } from '@/contexts/ChurchContext'

interface DashboardHeaderProps {
  onMenuPress?: () => void
  onNotificationPress?: () => void
}

export function DashboardHeader({
  onMenuPress,
  onNotificationPress,
}: Readonly<DashboardHeaderProps>) {
  const { user } = useAuth()
  const { colors } = useTheme()
  const { churches, selectedChurchId, setSelectedChurchId } = useChurch()

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
          <Ionicons name="menu" size={28} color={colors.text.default} />
        </TouchableOpacity>

        <View style={styles.centerContainer}>
          <Select
            value={selectedChurchId}
            options={churches}
            onChange={setSelectedChurchId}
            variant="ghost"
            placeholder="Selecione a igreja..."
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.card.background, borderColor: colors.card.border },
            ]}
            onPress={onNotificationPress}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.default} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: themeSpacing.md,
    paddingVertical: themeSpacing.sm,
    gap: themeSpacing.sm,
  },
  menuButton: {
    padding: themeSpacing.xs,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: themeSpacing.sm,
  },
  notificationButton: {
    padding: themeSpacing.sm,
    borderRadius: 12,
    borderWidth: 1,
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
