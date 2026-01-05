import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

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
  const { colors } = useTheme()
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
      {label && <Text style={[styles.label, { color: colors.text.default }]}>{label}</Text>}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.card.background,
            borderColor: error ? '#ef4444' : colors.card.border,
          },
          disabled && { backgroundColor: colors.background.dark, opacity: 0.7 },
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.valueText,
            { color: colors.text.default },
            !selectedOption && { color: colors.text.dark },
            disabled && { color: colors.text.dark },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? colors.text.dark : colors.text.default}
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
          <View style={[styles.modalContent, { backgroundColor: colors.card.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.default }]}>
                {label || 'Selecione'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text.default} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: colors.background.default }]}>
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    { borderBottomColor: colors.card.border },
                    item.value === value && { backgroundColor: colors.primary + '15' },
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.text.default },
                      item.value === value && { color: colors.primary, fontWeight: 'bold' },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.text.dark }]}>
                    Nenhuma opção encontrada
                  </Text>
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
  emptyContainer: {
    padding: themeSpacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: themeTypography.sizes.md,
  },
})
