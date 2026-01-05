import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { Option } from '../Select/Select'

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
}: MultiSelectProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

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

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.button, error && styles.buttonError, disabled && styles.buttonDisabled]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.valueText,
            selectedOptions.length === 0 && styles.placeholderText,
            disabled && styles.textDisabled,
          ]}
        >
          {getDisplayText()}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? themeColors.dark[500] : themeColors.dark[400]}
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Selecione'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={themeColors.dark[900]} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={themeColors.dark[400]} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar..."
                placeholderTextColor={themeColors.dark[400]}
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
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => handleToggle(item.value)}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={themeColors.primary[600]}
                      />
                    )}
                    {!isSelected && (
                      <Ionicons name="ellipse-outline" size={20} color={themeColors.dark[400]} />
                    )}
                  </TouchableOpacity>
                )
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhuma opção encontrada</Text>
                </View>
              }
            />

            <View style={styles.footer}>
              <TouchableOpacity style={styles.confirmButton} onPress={() => setModalVisible(false)}>
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
    color: themeColors.dark[300],
    marginBottom: themeSpacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeColors.dark[900],
    borderWidth: 1,
    borderColor: themeColors.dark[700],
    borderRadius: 8,
    paddingHorizontal: themeSpacing.md,
    height: 48,
  },
  buttonError: {
    borderColor: '#ef4444',
  },
  buttonDisabled: {
    backgroundColor: themeColors.dark[950],
    opacity: 0.7,
  },
  valueText: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[100],
  },
  placeholderText: {
    color: themeColors.dark[500],
  },
  textDisabled: {
    color: themeColors.dark[600],
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
    backgroundColor: themeColors.dark[900],
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
    color: themeColors.dark[100],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.dark[800],
    borderRadius: 8,
    paddingHorizontal: themeSpacing.md,
    height: 44,
    marginBottom: themeSpacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: themeSpacing.sm,
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[100],
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: themeSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.dark[800],
  },
  optionItemSelected: {
    backgroundColor: themeColors.dark[850],
    marginHorizontal: -themeSpacing.md,
    paddingHorizontal: themeSpacing.md,
  },
  optionText: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[300],
  },
  optionTextSelected: {
    color: themeColors.primary[500],
    fontWeight: themeTypography.weights.semibold,
  },
  emptyContainer: {
    padding: themeSpacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: themeColors.dark[500],
    fontSize: themeTypography.sizes.md,
  },
  footer: {
    marginTop: themeSpacing.md,
  },
  confirmButton: {
    backgroundColor: themeColors.primary[600],
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
