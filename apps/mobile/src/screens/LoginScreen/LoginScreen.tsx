import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'
import { BackgroundGradient } from '@/components/BackgroundGradient'
import { FadeInView } from '@/components/Animations'
import { useLoginForm } from './useLoginForm'
import { themeColors, themeSpacing, themeTypography } from '@/theme'

export default function LoginScreen() {
  const { email, password, error, setEmail, setPassword, handleLogin } = useLoginForm()

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
          <FadeInView style={styles.content}>
            <BrandHeader />
            <LoginForm
              email={email}
              password={password}
              error={error}
              isMockMode={false}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onLogin={handleLogin}
            />
          </FadeInView>

          <FooterLogo />
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundGradient>
  )
}

function FooterLogo() {
  const { colors } = useTheme()
  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerTextContainer}>
        <Text style={[styles.footerBrandText, { color: colors.text.default }]}>MINC</Text>
        <Text style={[styles.footerBrandText, { color: themeColors.primary[500] }]}> TEAMS</Text>
      </View>
    </View>
  )
}

function BrandHeader() {
  const { theme } = useTheme()
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require('../../../assets/logo-minc.png')}
        style={[styles.headerLogo, { tintColor: theme === 'dark' ? undefined : '#000000' }]}
        resizeMode="contain"
      />
    </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: themeSpacing.md,
  },
  headerLogo: {
    width: 200,
    height: 80,
    marginBottom: themeSpacing.xs,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: themeSpacing.xl,
    paddingBottom: themeSpacing.xl,
  },
  footerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerBrandText: {
    fontSize: themeTypography.sizes['2xl'],
    fontWeight: themeTypography.weights.bold,
    letterSpacing: 1,
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
