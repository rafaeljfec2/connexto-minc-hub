import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Card, Button } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigator/navigator.types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Escaneamento QR Code</Text>
          <Text style={styles.cardDescription}>
            Escaneie QR codes para registrar presença ou acessar informações
          </Text>
          <Button
            title="Escanear QR Code"
            onPress={() => {
              // Navigation will be handled by adding QRCodeScanner to stack
            }}
            variant="primary"
            style={styles.button}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Ações Rápidas</Text>
          <Button
            title="Ver Pessoas"
            onPress={() => navigation.navigate('Main', { screen: 'People' })}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Ver Equipes"
            onPress={() => navigation.navigate('Main', { screen: 'Teams' })}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Ver Escalas"
            onPress={() => navigation.navigate('Main', { screen: 'Schedules' })}
            variant="outline"
            style={styles.button}
          />
        </Card>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background.light,
  },
  content: {
    padding: themeSpacing.md,
  },
  title: {
    fontSize: themeTypography.sizes['3xl'],
    fontWeight: themeTypography.weights.bold,
    color: themeColors.text.light,
    marginBottom: themeSpacing.lg,
  },
  card: {
    marginBottom: themeSpacing.md,
  },
  cardTitle: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.text.light,
    marginBottom: themeSpacing.xs,
  },
  cardDescription: {
    fontSize: themeTypography.sizes.md,
    color: themeColors.dark[600],
    marginBottom: themeSpacing.md,
  },
  button: {
    marginTop: themeSpacing.sm,
  },
})
