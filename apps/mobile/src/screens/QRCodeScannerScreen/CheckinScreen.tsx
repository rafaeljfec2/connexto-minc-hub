import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { CameraView } from 'expo-camera'
import { Header } from '@/components'
import { useCameraPermission } from './useCameraPermission'
import { QRCodeScannerOverlay } from './QRCodeScannerOverlay'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

const SCAN_RESET_DELAY_MS = 2000

export default function CheckinScreen() {
  const [scanned, setScanned] = useState(false)
  const { permission } = useCameraPermission()

  function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned) return

    setScanned(true)
    
    Alert.alert('QR Code Escaneado', `Código: ${data}`, [
      {
        text: 'OK',
        onPress: () => {
          setTimeout(() => setScanned(false), SCAN_RESET_DELAY_MS)
        },
      },
    ])
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Header title="Check-in" subtitle="Escaneie o QR code para registrar presença" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Header title="Check-in" subtitle="Escaneie o QR code para registrar presença" />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Permissão de câmera necessária</Text>
          <Text style={styles.permissionSubtext}>Por favor, permita o acesso à câmera nas configurações</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Check-in" subtitle="Escaneie o QR code para registrar presença" />
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <QRCodeScannerOverlay />
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  camera: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[400],
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: themeSpacing.md,
  },
  permissionText: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.text.default,
    marginBottom: themeSpacing.sm,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[400],
    textAlign: 'center',
  },
})
