import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

const OVERLAY_CORNER_SIZE = 30
const OVERLAY_CORNER_BORDER_WIDTH = 3
const SCAN_AREA_SIZE = 250

export function QRCodeScannerOverlay() {
  return (
    <View style={styles.overlay}>
      <View style={styles.scanArea}>
        <Corner position="topLeft" />
        <Corner position="topRight" />
        <Corner position="bottomLeft" />
        <Corner position="bottomRight" />
      </View>
      <Text style={styles.instruction}>Posicione o QR code dentro da área</Text>
    </View>
  )
}

interface CornerProps {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
}

function Corner({ position }: CornerProps) {
  const cornerStyles = getCornerStyles(position)
  return <View style={[styles.corner, cornerStyles]} />
}

function getCornerStyles(position: CornerProps['position']) {
  const baseCornerStyle = {
    width: OVERLAY_CORNER_SIZE,
    height: OVERLAY_CORNER_SIZE,
    borderWidth: OVERLAY_CORNER_BORDER_WIDTH,
    borderColor: themeColors.primary[500],
  }

  switch (position) {
    case 'topLeft':
      return {
        ...baseCornerStyle,
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
      }
    case 'topRight':
      return {
        ...baseCornerStyle,
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderRightWidth: OVERLAY_CORNER_BORDER_WIDTH,
      }
    case 'bottomLeft':
      return {
        ...baseCornerStyle,
        bottom: 0,
        left: 0,
        borderTopWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: OVERLAY_CORNER_BORDER_WIDTH,
      }
    case 'bottomRight':
      return {
        ...baseCornerStyle,
        bottom: 0,
        right: 0,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderBottomWidth: OVERLAY_CORNER_BORDER_WIDTH,
        borderRightWidth: OVERLAY_CORNER_BORDER_WIDTH,
      }
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
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
})
