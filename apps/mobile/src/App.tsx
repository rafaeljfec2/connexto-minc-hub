import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { RootNavigator } from '@/navigator/navigator'
import { linking } from '@/navigator/linking'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  )
}
