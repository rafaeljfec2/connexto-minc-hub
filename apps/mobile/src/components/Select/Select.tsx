import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

export interface Option {
  label: string
  value: string
}

interface SelectProps {
  label?: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Selecione...',
  disabled = false,
  error,
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

  const selectedOption = options.find(opt => opt.value === value)

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchText.toLowerCase())
  )

  function handleSelect(optionValue: string) {
    onChange(optionValue)
    setModalVisible(false)
    setSearchText('')
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
            !selectedOption && styles.placeholderText,
            disabled && styles.textDisabled,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionItem, item.value === value && styles.optionItemSelected]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[styles.optionText, item.value === value && styles.optionTextSelected]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={20} color={themeColors.primary[600]} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhuma opção encontrada</Text>
                </View>
              }
            />
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
    color: themeColors.dark[300], // Using a lighter color for label in dark mode context usually, but keeping consistent with Input
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
    backgroundColor: themeColors.dark[900], // Dark theme modal
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    padding: themeSpacing.lg,
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
    backgroundColor: themeColors.dark[800],
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
})
