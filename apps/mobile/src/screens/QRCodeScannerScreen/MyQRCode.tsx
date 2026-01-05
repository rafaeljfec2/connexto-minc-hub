import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { useAuth } from '@/contexts/AuthContext'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

export function MyQRCode() {
  const { user } = useAuth()

  // Use user ID or fallback to a default value for development
  const qrValue = user?.id ? JSON.stringify({ userId: user.id, type: 'check-in' }) : 'check-in-mock'

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Meu Código de Check-in</Text>
        <Text style={styles.subtitle}>Apresente este código para leitura</Text>

        <View style={styles.qrContainer}>
          <QRCode value={qrValue} size={200} color="black" backgroundColor="white" />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.userRole}>Membro</Text>
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
    backgroundColor: themeColors.dark[950],
    padding: themeSpacing.lg,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: themeSpacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
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
    color: themeColors.dark[900],
    marginBottom: themeSpacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[500],
    marginBottom: themeSpacing.xl,
    textAlign: 'center',
  },
  qrContainer: {
    padding: themeSpacing.lg,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themeColors.dark[200],
    marginBottom: themeSpacing.xl,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.bold,
    color: themeColors.dark[900],
  },
  userRole: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.primary[600],
    fontWeight: themeTypography.weights.medium,
  },
})
