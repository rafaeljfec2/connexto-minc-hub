import { colors } from '@minc-hub/shared/design-tokens'

export const themeColors = {
  primary: colors.primary,
  dark: colors.dark,
}

export function getThemeColors(theme: 'light' | 'dark') {
  if (theme === 'light') {
    return {
      background: {
        light: '#ffffff',
        dark: colors.dark[950],
        default: '#ffffff',
      },
      text: {
        light: colors.dark[900],
        dark: colors.dark[50],
        default: colors.dark[900],
        inverted: '#ffffff',
      },
      card: {
        background: '#ffffff',
        border: colors.dark[200],
      },
    }
  }

  return {
    background: {
      light: '#ffffff',
      dark: colors.dark[950],
      default: colors.dark[950],
    },
    text: {
      light: colors.dark[900],
      dark: colors.dark[50],
      default: colors.dark[50],
      inverted: '#ffffff',
    },
    card: {
      background: colors.dark[900],
      border: colors.dark[800],
    },
  }
}
