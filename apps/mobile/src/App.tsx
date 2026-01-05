import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { BackgroundGradient } from '@/components'
import { RootNavigator } from '@/navigator/navigator'
import { linking } from '@/navigator/linking'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BackgroundGradient>
          <NavigationContainer
            linking={linking}
            theme={{
              dark: true,
              colors: {
                primary: '#f97316',
                background: 'transparent',
                card: '#18181b',
                text: '#fafafa',
                border: '#27272a',
                notification: '#f97316',
              },
            }}
          >
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </BackgroundGradient>
      </AuthProvider>
    </ThemeProvider>
  )
}
