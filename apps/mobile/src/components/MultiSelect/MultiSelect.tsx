import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeSpacing, themeTypography } from '@/theme'
import { Option } from '../Select/Select'
import { useTheme } from '@/contexts/ThemeContext'

interface MultiSelectProps {
  label?: string
  values: string[]
  options: Option[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
  error?: string
}

export function MultiSelect({
  label,
  values,
  options,
  onChange,
  placeholder = 'Selecione...',
  disabled = false,
  error,
}: Readonly<MultiSelectProps>) {
  const [modalVisible, setModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')
  const { colors, theme } = useTheme()

  const selectedOptions = options.filter(opt => values.includes(opt.value))

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchText.toLowerCase())
  )

  function handleToggle(value: string) {
    const newValues = values.includes(value) ? values.filter(v => v !== value) : [...values, value]
    onChange(newValues)
  }

  function getDisplayText() {
    if (selectedOptions.length === 0) return placeholder
    if (selectedOptions.length === 1) return selectedOptions[0].label
    return `${selectedOptions.length} selecionados`
  }

  // Dynamic styles
  const buttonStyle = {
    backgroundColor: colors.card.background,
    borderColor: error ? '#ef4444' : colors.card.border,
    opacity: disabled ? 0.7 : 1,
  }

  const textColor = {
    color: selectedOptions.length === 0 ? colors.text.dark : colors.text.default,
  }

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text.dark }]}>{label}</Text>}
      <TouchableOpacity
        style={[styles.button, buttonStyle]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.valueText, textColor, disabled && { color: colors.text.dark }]}>
          {getDisplayText()}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? colors.text.dark : colors.text.light}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.default }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.default }]}>
                {label || 'Selecione'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.default} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: colors.card.background }]}>
              <Ionicons name="search" size={20} color={colors.text.dark} />
              <TextInput
                style={[styles.searchInput, { color: colors.text.default }]}
                placeholder="Buscar..."
                placeholderTextColor={colors.text.dark}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={item => item.value}
              renderItem={({ item }) => {
                const isSelected = values.includes(item.value)
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      { borderBottomColor: colors.card.border },
                      isSelected && {
                        backgroundColor:
                          theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      },
                    ]}
                    onPress={() => handleToggle(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: isSelected ? colors.primary : colors.text.default },
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                    {!isSelected && (
                      <Ionicons name="ellipse-outline" size={20} color={colors.text.dark} />
                    )}
                  </TouchableOpacity>
                )
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.text.dark }]}>
                    Nenhuma opção encontrada
                  </Text>
                </View>
              }
            />

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: themeSpacing.md,
  },
  label: {
    fontSize: themeTypography.sizes.sm,
    fontWeight: themeTypography.weights.medium,
    marginBottom: themeSpacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: themeSpacing.md,
    height: 48,
  },
  valueText: {
    fontSize: themeTypography.sizes.md,
  },
  errorText: {
    fontSize: themeTypography.sizes.xs,
    color: '#ef4444',
    marginTop: themeSpacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: themeSpacing.lg,
    paddingBottom: themeSpacing.xl, // Extra padding for SafeArea
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: themeSpacing.md,
  },
  modalTitle: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: themeSpacing.md,
    height: 44,
    marginBottom: themeSpacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: themeSpacing.sm,
    fontSize: themeTypography.sizes.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: themeSpacing.md,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: themeTypography.sizes.md,
  },
  optionTextSelected: {
    fontWeight: themeTypography.weights.semibold,
  },
  emptyContainer: {
    padding: themeSpacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: themeTypography.sizes.md,
  },
  footer: {
    marginTop: themeSpacing.md,
  },
  confirmButton: {
    paddingVertical: themeSpacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: themeTypography.weights.semibold,
    fontSize: themeTypography.sizes.md,
  },
})
