import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { CameraView } from 'expo-camera'
import { Header } from '@/components'
import { useCameraPermission } from './useCameraPermission'
import { QRCodeScannerOverlay } from './QRCodeScannerOverlay'
import { MyQRCode } from './MyQRCode'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

const SCAN_RESET_DELAY_MS = 2000

export default function CheckinScreen() {
  const [mode, setMode] = useState<'scan' | 'generate'>('generate')
  const [scanned, setScanned] = useState(false)
  const { permission } = useCameraPermission()
  const { colors, theme } = useTheme()

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
          <Text style={[styles.loadingText, { color: colors.text.dark }]}>Carregando...</Text>
        </View>
      )
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={[styles.permissionText, { color: colors.text.default }]}>
            Permissão de câmera necessária
          </Text>
          <Text style={[styles.permissionSubtext, { color: colors.text.dark }]}>
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

  // Helper to get dynamic toggle styles
  const getSegmentStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? colors.card.background : 'transparent',
  })
  return (
    <View style={styles.container}>
      <Header title="Check-in" subtitle="Escaneie o QR code para registrar presença" />
      <View
        style={[
          styles.toggleContainer,
          { backgroundColor: theme === 'dark' ? 'rgba(9, 9, 11, 0.95)' : '#ffffff' },
        ]}
      >
        <View
          style={[
            styles.segments,
            { backgroundColor: colors.card.background, borderColor: colors.card.border },
          ]}
        >
          <TouchableOpacity
            style={[styles.segment, getSegmentStyle(mode === 'generate')]}
            onPress={() => setMode('generate')}
          >
            <Text
              style={[
                styles.segmentText,
                { color: mode === 'generate' ? colors.text.default : colors.text.dark },
                mode === 'generate' && styles.segmentTextActive,
              ]}
            >
              Meu Código
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, getSegmentStyle(mode === 'scan')]}
            onPress={() => setMode('scan')}
          >
            <Text
              style={[
                styles.segmentText,
                { color: mode === 'scan' ? colors.text.default : colors.text.dark },
                mode === 'scan' && styles.segmentTextActive,
              ]}
            >
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
  },
  toggleContainer: {
    paddingHorizontal: themeSpacing.lg,
    paddingBottom: themeSpacing.md,
    paddingTop: themeSpacing.md, // Added spacing from header
    zIndex: 10,
  },
  segments: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    paddingVertical: themeSpacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentText: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.medium,
  },
  segmentTextActive: {
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
    marginBottom: themeSpacing.sm,
    textAlign: 'center',
  },
  permissionSubtext: {
    fontSize: themeTypography.sizes.md,
    textAlign: 'center',
  },
})
