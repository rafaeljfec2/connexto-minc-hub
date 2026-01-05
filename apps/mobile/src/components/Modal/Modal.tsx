import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Modal as RNModal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface ModalProps {
  readonly visible: boolean
  readonly onClose: () => void
  readonly title: string
  readonly children: React.ReactNode
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (visible) {
      // Prevent body scroll on web if needed
    }
  }, [visible])

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={themeColors.text.default} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    backgroundColor: themeColors.dark[900],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: themeSpacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: themeSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.dark[800],
  },
  title: {
    fontSize: themeTypography.sizes.xl,
    fontWeight: themeTypography.weights.bold,
    color: themeColors.text.default,
    flex: 1,
  },
  closeButton: {
    padding: themeSpacing.xs,
  },
  body: {
    padding: themeSpacing.md,
  },
})
