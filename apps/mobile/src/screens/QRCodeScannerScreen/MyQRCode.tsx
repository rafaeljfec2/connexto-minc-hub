import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { useAuth } from '@/contexts/AuthContext'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

export function MyQRCode() {
  const { user } = useAuth()
  const { colors } = useTheme()

  // Use user ID or fallback to a default value for development
  const qrValue = user?.id ? JSON.stringify({ userId: user.id, type: 'check-in' }) : 'check-in-mock'

  return (
    <View style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card.background, shadowColor: colors.shadow },
        ]}
      >
        <Text style={[styles.title, { color: colors.text.default }]}>Meu Código de Check-in</Text>
        <Text style={[styles.subtitle, { color: colors.text.dark }]}>
          Apresente este código para leitura
        </Text>

        <View
          style={[
            styles.qrContainer,
            { backgroundColor: '#ffffff', borderColor: colors.card.border },
          ]}
        >
          <QRCode value={qrValue} size={200} color="black" backgroundColor="white" />
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text.default }]}>
            {user?.name || 'Usuário'}
          </Text>
          <Text style={[styles.userRole, { color: colors.primary }]}>Membro</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: themeSpacing.lg,
  },
  card: {
    padding: themeSpacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
    marginBottom: themeSpacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: themeTypography.sizes.sm,
    marginBottom: themeSpacing.xl,
    textAlign: 'center',
  },
  qrContainer: {
    padding: themeSpacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: themeSpacing.xl,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.bold,
  },
  userRole: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.medium,
  },
})
