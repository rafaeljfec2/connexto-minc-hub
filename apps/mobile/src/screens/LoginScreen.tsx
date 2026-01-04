import React, { useState } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Button, Input, Card } from '@/components'
import { useAuth } from '@/contexts/AuthContext'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError('Email ou senha incorretos')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>MINC Hub</Text>
          <Text style={styles.subtitle}>Sistema de Gestão de Times</Text>

          <Card style={styles.card}>
            <Input
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Senha"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="Entrar"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              style={styles.loginButton}
            />
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background.light,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: themeSpacing.md,
  },
  title: {
    fontSize: themeTypography.sizes['4xl'],
    fontWeight: themeTypography.weights.bold,
    color: themeColors.primary[600],
    textAlign: 'center',
    marginBottom: themeSpacing.xs,
  },
  subtitle: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[600],
    textAlign: 'center',
    marginBottom: themeSpacing.xl,
  },
  card: {
    marginTop: themeSpacing.lg,
  },
  errorText: {
    color: '#ef4444',
    fontSize: themeTypography.sizes.sm,
    marginBottom: themeSpacing.sm,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: themeSpacing.md,
  },
})
