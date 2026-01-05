import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { CameraView } from 'expo-camera'
import { Button } from '@/components'
import { useCameraPermission } from './useCameraPermission'
import { QRCodeScannerOverlay } from './QRCodeScannerOverlay'

interface QRCodeScannerScreenProps {
  onScan: (data: string) => void
  onClose?: () => void
}

const SCAN_RESET_DELAY_MS = 2000

export function QRCodeScannerScreen({ onScan, onClose }: QRCodeScannerScreenProps) {
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

  if (!permission) {
    return <LoadingState />
  }

  if (!permission.granted) {
    return (
      <PermissionRequestState
        onRequestPermission={requestPermission}
        onClose={onClose}
      />
    )
  }

  return (
    <View style={styles.container}>
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

function LoadingState() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Carregando permissões...</Text>
    </View>
  )
}

interface PermissionRequestStateProps {
  onRequestPermission: () => void
  onClose?: () => void
}

function PermissionRequestState({
  onRequestPermission,
  onClose,
}: PermissionRequestStateProps) {
  return (
    <View style={styles.container}>
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
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
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
