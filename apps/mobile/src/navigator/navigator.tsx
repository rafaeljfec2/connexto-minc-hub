import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import type { RootStackParamList, MainTabParamList } from './navigator.types'
import { useAuth } from '@/contexts/AuthContext'

import LoginScreen from '@/screens/LoginScreen'
import DashboardScreen from '@/screens/DashboardScreen'
import PeopleScreen from '@/screens/PeopleScreen'
import TeamsScreen from '@/screens/TeamsScreen'
import SchedulesScreen from '@/screens/SchedulesScreen'
import ProfileScreen from '@/screens/ProfileScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#71717a',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Início',
        }}
      />
      <Tab.Screen
        name="People"
        component={PeopleScreen}
        options={{
          tabBarLabel: 'Pessoas',
        }}
      />
      <Tab.Screen
        name="Teams"
        component={TeamsScreen}
        options={{
          tabBarLabel: 'Equipes',
        }}
      />
      <Tab.Screen
        name="Schedules"
        component={SchedulesScreen}
        options={{
          tabBarLabel: 'Escalas',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  )
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  )
}
