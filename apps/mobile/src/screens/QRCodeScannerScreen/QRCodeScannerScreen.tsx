import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { CameraView } from 'expo-camera'
import { Button } from '@/components'
import { useCameraPermission } from './useCameraPermission'
import { QRCodeScannerOverlay } from './QRCodeScannerOverlay'
import { MyQRCode } from './MyQRCode'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface QRCodeScannerScreenProps {
  onScan: (data: string) => void
  onClose?: () => void
}

const SCAN_RESET_DELAY_MS = 2000

export function QRCodeScannerScreen({ onScan, onClose }: QRCodeScannerScreenProps) {
  const [mode, setMode] = useState<'scan' | 'generate'>('scan')
  const [scanned, setScanned] = useState(false)
  const { permission, requestPermission } = useCameraPermission(onClose)

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return

    setScanned(true)
    onScan(data)
    resetScannedStateAfterDelay()
  }

  const resetScannedStateAfterDelay = () => {
    setTimeout(() => setScanned(false), SCAN_RESET_DELAY_MS)
  }

  function renderScanner() {
    if (!permission) {
      return <LoadingState />
    }

    if (!permission.granted) {
      return <PermissionRequestState onRequestPermission={requestPermission} onClose={onClose} />
    }

    return (
      <View style={styles.cameraContainer}>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.segments}>
          <TouchableOpacity
            style={[styles.segment, mode === 'scan' && styles.segmentActive]}
            onPress={() => setMode('scan')}
          >
            <Text style={[styles.segmentText, mode === 'scan' && styles.segmentTextActive]}>
              Ler Código
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, mode === 'generate' && styles.segmentActive]}
            onPress={() => setMode('generate')}
          >
            <Text style={[styles.segmentText, mode === 'generate' && styles.segmentTextActive]}>
              Meu Código
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>{mode === 'scan' ? renderScanner() : <MyQRCode />}</View>
    </View>
  )
}

function LoadingState() {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.text}>Carregando permissões...</Text>
    </View>
  )
}

interface PermissionRequestStateProps {
  onRequestPermission: () => void
  onClose?: () => void
}

function PermissionRequestState({ onRequestPermission, onClose }: PermissionRequestStateProps) {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.text}>Permissão de câmera necessária</Text>
      <Button
        title="Conceder permissão"
        onPress={onRequestPermission}
        variant="primary"
        style={styles.button}
      />
      {onClose && (
        <Button title="Cancelar" onPress={onClose} variant="outline" style={styles.button} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.dark[950],
  },
  header: {
    paddingTop: 60, // Safe area top approx
    paddingBottom: themeSpacing.md,
    paddingHorizontal: themeSpacing.lg,
    backgroundColor: themeColors.dark[950],
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
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.dark[950], // Consistent background
  },
  text: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    minWidth: 200,
  },
})
