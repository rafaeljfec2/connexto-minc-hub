import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { BackgroundGradient } from '@/components/BackgroundGradient'
import { RootNavigator } from '@/navigator/navigator'
import { linking } from '@/navigator/linking'
import { themeColors } from '@/theme'

function AppContent() {
  const { theme, colors } = useTheme()

  return (
    <BackgroundGradient>
      <NavigationContainer
        linking={linking}
        theme={{
          dark: theme === 'dark',
          colors: {
            primary: themeColors.primary[500],
            background: 'transparent',
            card: colors.card.background,
            text: colors.text.default,
            border: colors.card.border,
            notification: themeColors.primary[500],
          },
        }}
      >
        <RootNavigator />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </NavigationContainer>
    </BackgroundGradient>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
