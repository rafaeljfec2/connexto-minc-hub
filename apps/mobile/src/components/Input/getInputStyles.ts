import type { TextStyle, StyleProp } from 'react-native'
import { inputStyles } from './styles'

interface GetInputStylesParams {
  error?: string
  style?: StyleProp<TextStyle>
}

export function getInputStyles({
  error,
  style,
}: GetInputStylesParams): StyleProp<TextStyle> {
  return [inputStyles.input, error && inputStyles.inputError, style]
}
