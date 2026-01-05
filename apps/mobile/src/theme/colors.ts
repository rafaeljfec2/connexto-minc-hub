import { colors } from '@minc-hub/shared/design-tokens'

export const themeColors = {
  primary: colors.primary,
  dark: colors.dark,
  text: {
    default: colors.dark[50],
  },
  card: {
    background: colors.dark[900],
    border: colors.dark[800],
  },
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
        light: colors.dark[900], // Black text
        dark: colors.dark[500], // Dark grey for secondary text
        default: colors.dark[900], // Black text default
        inverted: '#ffffff',
      },
      card: {
        background: '#ffffff',
        border: colors.dark[200],
      },
      dark: colors.dark,
      primary: colors.primary[500],
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
      dark: colors.dark[50], // Light grey for secondary text
      default: colors.dark[50],
      inverted: '#ffffff',
    },
    card: {
      background: colors.dark[900],
      border: colors.dark[800],
    },
    dark: colors.dark,
    primary: colors.primary[500],
  }
}
