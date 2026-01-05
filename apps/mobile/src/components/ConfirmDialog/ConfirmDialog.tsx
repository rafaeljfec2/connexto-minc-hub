import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Modal } from '../Modal'
import { Button } from '../Button'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface ConfirmDialogProps {
  readonly visible: boolean
  readonly onClose: () => void
  readonly onConfirm: () => void
  readonly title: string
  readonly message: string
  readonly confirmText?: string
  readonly cancelText?: string
}

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}: ConfirmDialogProps) {
  function handleConfirm() {
    onConfirm()
    onClose()
  }

  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      <View style={styles.container}>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Button
            title={cancelText}
            onPress={onClose}
            variant="secondary"
            style={styles.cancelButton}
          />
          <Button
            title={confirmText}
            onPress={handleConfirm}
            variant="primary"
            style={styles.confirmButton}
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: themeSpacing.md,
  },
  message: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[300],
    marginBottom: themeSpacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: themeSpacing.sm,
    marginTop: themeSpacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
})
