import React, { useState } from 'react'
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

interface ChatInputProps {
  onSend: (text: string) => void
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('')

  function handleSend() {
    if (text.trim()) {
      onSend(text)
      setText('')
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.attachButton}>
        <Ionicons name="add" size={24} color={themeColors.dark[400]} />
      </TouchableOpacity>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={themeColors.dark[400]}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
      </View>

      <TouchableOpacity 
        style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]} 
        onPress={handleSend}
        disabled={!text.trim()}
      >
        <Ionicons 
          name="send" 
          size={20} 
          color={text.trim() ? '#ffffff' : themeColors.dark[400]} 
        />
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
    backgroundColor: themeColors.dark[900],
    borderTopWidth: 1,
    borderTopColor: themeColors.dark[800],
  },
  attachButton: {
    padding: 10,
    marginRight: 4,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: themeColors.dark[800],
    borderRadius: 20,
    paddingHorizontal: themeSpacing.md,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 40,
    justifyContent: 'center',
  },
  input: {
    color: themeColors.dark[50],
    fontSize: themeTypography.sizes.md,
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: themeColors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: themeSpacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: themeColors.dark[800],
  },
})
