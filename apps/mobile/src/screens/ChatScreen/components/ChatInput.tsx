import React, { useState } from 'react'
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeSpacing, themeTypography } from '@/theme'
import { useTheme } from '@/contexts/ThemeContext'

interface ChatInputProps {
  onSend: (text: string) => void
}

export function ChatInput({ onSend }: Readonly<ChatInputProps>) {
  const [text, setText] = useState('')
  const { colors } = useTheme()

  function handleSend() {
    if (text.trim()) {
      onSend(text)
      setText('')
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card.background, borderTopColor: colors.card.border },
      ]}
    >
      <TouchableOpacity style={styles.attachButton}>
        <Ionicons name="add" size={24} color={colors.text.dark} />
      </TouchableOpacity>

      <View style={[styles.inputContainer, { backgroundColor: colors.background.default }]}>
        <TextInput
          style={[styles.input, { color: colors.text.default }]}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={colors.text.dark}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: text.trim() ? colors.primary : colors.card.border },
        ]}
        onPress={handleSend}
        disabled={!text.trim()}
      >
        <Ionicons name="send" size={20} color={text.trim() ? '#ffffff' : colors.text.dark} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: themeSpacing.md,
    paddingVertical: themeSpacing.sm,
    borderTopWidth: 1,
  },
  attachButton: {
    padding: 10,
    marginRight: 4,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: themeSpacing.md,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 40,
    justifyContent: 'center',
  },
  input: {
    fontSize: themeTypography.sizes.md,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: themeSpacing.sm,
  },
})
