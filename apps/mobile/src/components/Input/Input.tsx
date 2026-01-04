import React from 'react'
import { TextInput, View, Text } from 'react-native'
import type { TextInputProps, ViewStyle } from 'react-native'
import { getInputStyles } from './getInputStyles'
import { inputStyles } from './styles'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  containerStyle?: ViewStyle
}

export function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  const inputStyle = getInputStyles({ error, style })

  return (
    <View style={[inputStyles.container, containerStyle]}>
      {label && <Text style={inputStyles.label}>{label}</Text>}
      <TextInput style={inputStyle} placeholderTextColor="#a1a1aa" {...props} />
      {error && <Text style={inputStyles.error}>{error}</Text>}
    </View>
  )
}
