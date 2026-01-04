import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MINC Hub</Text>
      <Text style={styles.subtitle}>Login Screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
})
