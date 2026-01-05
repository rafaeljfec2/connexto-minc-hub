import React from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Button, Input, Card } from '@/components'
import { useLoginForm } from './useLoginForm'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

const BRAND_NAME = 'MINC Teams'
const BRAND_SUBTITLE = 'Sistema de Gestão de Times'

export default function LoginScreen() {
  const { email, password, error, setEmail, setPassword, handleLogin } = useLoginForm()

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <BrandHeader />
          <LoginForm
            email={email}
            password={password}
            error={error}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onLogin={handleLogin}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function BrandHeader() {
  return (
    <>
      <Text style={styles.title}>{BRAND_NAME}</Text>
      <Text style={styles.subtitle}>{BRAND_SUBTITLE}</Text>
    </>
  )
}

interface LoginFormProps {
  readonly email: string
  readonly password: string
  readonly error: string
  readonly onEmailChange: (email: string) => void
  readonly onPasswordChange: (password: string) => void
  readonly onLogin: () => Promise<void>
}

function LoginForm({
  email,
  password,
  error,
  onEmailChange,
  onPasswordChange,
  onLogin,
}: LoginFormProps) {
  return (
    <Card style={styles.card}>
      <Input
        label="Email"
        placeholder="seu@email.com"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <Input
        label="Senha"
        placeholder="••••••••"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button
        title="Entrar"
        onPress={onLogin}
        variant="primary"
        size="lg"
        style={styles.loginButton}
      />
    </Card>
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
