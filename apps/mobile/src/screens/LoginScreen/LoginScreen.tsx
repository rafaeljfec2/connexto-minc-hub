import React from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'
import { BackgroundGradient } from '@/components/BackgroundGradient'
import { useLoginForm } from './useLoginForm'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { API_CONFIG } from '@/constants/config'

const BRAND_NAME = 'MINC Teams'
const BRAND_SUBTITLE = 'Sistema de gestão dos times da MINC'

export default function LoginScreen() {
  const { email, password, error, setEmail, setPassword, handleLogin } = useLoginForm()
  const isMockMode = API_CONFIG.MOCK_MODE

  return (
    <BackgroundGradient>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <BrandHeader />
            <LoginForm
              email={email}
              password={password}
              error={error}
              isMockMode={isMockMode}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onLogin={handleLogin}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundGradient>
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
  readonly isMockMode: boolean
  readonly onEmailChange: (email: string) => void
  readonly onPasswordChange: (password: string) => void
  readonly onLogin: () => Promise<void>
}

function LoginForm({
  email,
  password,
  error,
  isMockMode,
  onEmailChange,
  onPasswordChange,
  onLogin,
}: LoginFormProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.formContent}>
        {isMockMode && (
          <View style={styles.mockModeBanner}>
            <Text style={styles.mockModeText}>
              Modo Desenvolvimento: Use qualquer email/senha para entrar
            </Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

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

        <Button
          title="Entrar"
          onPress={onLogin}
          variant="primary"
          size="lg"
          style={styles.loginButton}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: themeSpacing.md,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: themeTypography.sizes['4xl'],
    fontWeight: themeTypography.weights.bold,
    color: themeColors.primary[500],
    textAlign: 'center',
    marginBottom: themeSpacing.xs,
  },
  subtitle: {
    fontSize: themeTypography.sizes.sm,
    color: themeColors.dark[400],
    textAlign: 'center',
    marginBottom: themeSpacing.xl,
  },
  card: {
    width: '100%',
  },
  formContent: {
    gap: themeSpacing.md,
  },
  mockModeBanner: {
    padding: themeSpacing.sm,
    borderRadius: 8,
    backgroundColor: `${themeColors.primary[500]}20`,
    borderWidth: 1,
    borderColor: `${themeColors.primary[500]}40`,
    marginBottom: themeSpacing.sm,
  },
  mockModeText: {
    fontSize: themeTypography.sizes.xs,
    color: themeColors.primary[400],
    textAlign: 'center',
  },
  errorContainer: {
    padding: themeSpacing.sm,
    borderRadius: 8,
    backgroundColor: '#ef444410',
    borderWidth: 1,
    borderColor: '#ef444440',
  },
  errorText: {
    color: '#ef4444',
    fontSize: themeTypography.sizes.sm,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: themeSpacing.sm,
  },
})
