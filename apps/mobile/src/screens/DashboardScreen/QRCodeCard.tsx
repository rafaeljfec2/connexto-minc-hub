import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { Card, Button } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

export function QRCodeCard() {
  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Escaneamento QR Code</Text>
      <Text style={styles.cardDescription}>
        Escaneie QR codes para registrar presença ou acessar informações
      </Text>
      <Button
        title="Escanear QR Code"
        onPress={() => {
          // Navigation will be handled by adding QRCodeScanner to stack
        }}
        variant="primary"
        style={styles.button}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: themeSpacing.md,
  },
  cardTitle: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.text.light,
    marginBottom: themeSpacing.xs,
  },
  cardDescription: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[600],
    marginBottom: themeSpacing.md,
  },
  button: {
    marginTop: themeSpacing.sm,
  },
})
