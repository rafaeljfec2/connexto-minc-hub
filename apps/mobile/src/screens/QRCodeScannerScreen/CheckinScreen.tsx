import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { CameraView } from 'expo-camera'
import { Header } from '@/components'
import { useCameraPermission } from './useCameraPermission'
import { QRCodeScannerOverlay } from './QRCodeScannerOverlay'
import { MyQRCode } from './MyQRCode'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

const SCAN_RESET_DELAY_MS = 2000

export default function CheckinScreen() {
  const [mode, setMode] = useState<'scan' | 'generate'>('generate')
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

  function renderScanner() {
    if (!permission) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Permissão de câmera necessária</Text>
          <Text style={styles.permissionSubtext}>
            Por favor, permita o acesso à câmera nas configurações
          </Text>
        </View>
      )
    }

    return (
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
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Check-in" subtitle="Escaneie o QR code para registrar presença" />

      <View style={styles.toggleContainer}>
        <View style={styles.segments}>
          <TouchableOpacity
            style={[styles.segment, mode === 'generate' && styles.segmentActive]}
            onPress={() => setMode('generate')}
          >
            <Text style={[styles.segmentText, mode === 'generate' && styles.segmentTextActive]}>
              Meu Código
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, mode === 'scan' && styles.segmentActive]}
            onPress={() => setMode('scan')}
          >
            <Text style={[styles.segmentText, mode === 'scan' && styles.segmentTextActive]}>
              Ler Código
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>{mode === 'scan' ? renderScanner() : <MyQRCode />}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.dark[950],
  },
  toggleContainer: {
    paddingHorizontal: themeSpacing.lg,
    paddingBottom: themeSpacing.md,
    paddingTop: themeSpacing.md, // Added spacing from header
    backgroundColor: 'rgba(9, 9, 11, 0.95)', // Match header background
    zIndex: 10,
  },
  segments: {
    flexDirection: 'row',
    backgroundColor: themeColors.dark[900],
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: themeColors.dark[800],
  },
  segment: {
    flex: 1,
    paddingVertical: themeSpacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: themeColors.dark[800],
  },
  segmentText: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.medium,
    color: themeColors.dark[400],
  },
  segmentTextActive: {
    color: '#ffffff',
    fontWeight: themeTypography.weights.bold,
  },
  content: {
    flex: 1,
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
