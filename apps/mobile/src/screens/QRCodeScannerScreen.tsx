import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Alert, Platform } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Button } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface QRCodeScannerScreenProps {
  onScan: (data: string) => void
  onClose?: () => void
}

export function QRCodeScannerScreen({ onScan, onClose }: QRCodeScannerScreenProps) {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert(
        'Permissão necessária',
        'É necessário permitir o acesso à câmera para escanear QR codes.',
        [{ text: 'OK', onPress: onClose }]
      )
    }
  }, [permission, onClose])

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)
    onScan(data)
    setTimeout(() => setScanned(false), 2000)
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Carregando permissões...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Permissão de câmera necessária</Text>
        <Button
          title="Conceder permissão"
          onPress={requestPermission}
          variant="primary"
          style={styles.button}
        />
        {onClose && (
          <Button
            title="Cancelar"
            onPress={onClose}
            variant="outline"
            style={styles.button}
          />
        )}
      </View>
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
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.corner} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          <Text style={styles.instruction}>Posicione o QR code dentro da área</Text>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: themeColors.primary[500],
    borderWidth: 3,
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    top: 'auto',
    borderTopWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  instruction: {
    color: '#ffffff',
    fontSize: themeTypography.sizes.md,
    marginTop: themeSpacing.xl,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: themeSpacing.sm,
    borderRadius: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: themeTypography.sizes.md,
    textAlign: 'center',
  },
  button: {
    marginTop: themeSpacing.md,
    minWidth: 200,
  },
})
