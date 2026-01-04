import type { ViewStyle, TextStyle, StyleProp } from 'react-native'
import { buttonStyles } from './styles'

type ButtonVariant = 'primary' | 'secondary' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface GetButtonStylesParams {
  variant: ButtonVariant
  size: ButtonSize
  isDisabled: boolean
  style?: ViewStyle
}

export function getButtonStyles({
  variant,
  size,
  isDisabled,
  style,
}: GetButtonStylesParams): StyleProp<ViewStyle> {
  const sizeStyles = {
    sm: buttonStyles.sizeSm,
    md: buttonStyles.sizeMd,
    lg: buttonStyles.sizeLg,
  }[size]

  const variantStyles = {
    primary: buttonStyles.variantPrimary,
    secondary: buttonStyles.variantSecondary,
    outline: buttonStyles.variantOutline,
  }[variant]

  return [
    buttonStyles.base,
    sizeStyles,
    variantStyles,
    isDisabled && buttonStyles.disabled,
    style,
  ]
}

export function getButtonTextStyles(
  variant: ButtonVariant,
  size: ButtonSize,
  isDisabled: boolean
): StyleProp<TextStyle> {
  const sizeTextStyles = {
    sm: buttonStyles.textSizeSm,
    md: buttonStyles.textSizeMd,
    lg: buttonStyles.textSizeLg,
  }[size]

  const variantTextStyles = {
    primary: buttonStyles.textPrimary,
    secondary: buttonStyles.textSecondary,
    outline: buttonStyles.textOutline,
  }[variant]

  return [
    buttonStyles.text,
    sizeTextStyles,
    variantTextStyles,
    isDisabled && buttonStyles.textDisabled,
  ]
}
