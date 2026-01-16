import React from 'react'
import { StyleSheet, Text, TouchableOpacity, Platform } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

interface ErrorScreenProps {
  readonly onRetry: () => void
}

// iOS já gerencia Safe Area automaticamente
// Android precisa de edges explícitos
const SAFE_AREA_EDGES = Platform.select({
  ios: [] as const,
  android: ['top', 'bottom'] as const,
  default: [] as const,
})

export function ErrorScreen({ onRetry }: ErrorScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <StatusBar style="auto" />
      <Text style={styles.emoji}>📡</Text>
      <Text style={styles.title}>Sem Conexão</Text>
      <Text style={styles.message}>
        Não foi possível carregar o conteúdo.{'\n'}
        Verifique sua conexão com a internet.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
