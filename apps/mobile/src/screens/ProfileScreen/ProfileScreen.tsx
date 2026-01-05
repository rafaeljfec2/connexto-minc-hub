import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native'
import { Card, Button, Input, Header } from '@/components'
import { themeColors, themeSpacing, themeTypography } from '@/theme'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
  })

  function handleSubmit() {
    // TODO: Implementar atualização de perfil
    Alert.alert('Aviso', 'Funcionalidade de atualização de perfil será implementada em breve')
  }

  async function handleLogout() {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout()
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <Header title="Meu Perfil" subtitle="Gerencie suas informações pessoais" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Informações Pessoais</Text>
          <View style={styles.form}>
            <Input
              label="Nome *"
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
            />
            <Input
              label="Email *"
              value={formData.email}
              onChangeText={text => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Telefone"
              value={formData.phone}
              onChangeText={text => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              placeholder="(11) 99999-9999"
            />
            <View style={styles.actions}>
              <Button
                title="Salvar Alterações"
                onPress={handleSubmit}
                variant="primary"
                style={styles.saveButton}
              />
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Ações</Text>
          <View style={styles.actions}>
            <Button
              title="Sair"
              onPress={handleLogout}
              variant="outline"
              style={styles.logoutButton}
            />
          </View>
        </Card>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: themeSpacing.md,
    paddingTop: themeSpacing.md,
  },
  card: {
    marginBottom: themeSpacing.md,
  },
  cardTitle: {
    fontSize: themeTypography.sizes.lg,
    fontWeight: themeTypography.weights.semibold,
    color: themeColors.text.default,
    marginBottom: themeSpacing.md,
  },
  form: {
    marginTop: themeSpacing.sm,
  },
  actions: {
    marginTop: themeSpacing.md,
  },
  saveButton: {
    width: '100%',
  },
  logoutButton: {
    width: '100%',
    borderColor: '#ef4444',
  },
})
