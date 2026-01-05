import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import type { RootStackParamList, MainTabParamList } from './navigator.types'
import { useAuth } from '@/contexts/AuthContext'

import LoginScreen from '@/screens/LoginScreen'
import DashboardScreen from '@/screens/DashboardScreen'
import SchedulesScreen from '@/screens/SchedulesScreen'
import CheckinScreen from '@/screens/QRCodeScannerScreen/CheckinScreen'
import ChatScreen from '@/screens/ChatScreen'
import ProfileScreen from '@/screens/ProfileScreen'
import ChurchesScreen from '@/screens/ChurchesScreen'
import MinistriesScreen from '@/screens/MinistriesScreen'
import TeamsScreen from '@/screens/TeamsScreen'
import PeopleScreen from '@/screens/PeopleScreen'
import UsersScreen from '@/screens/UsersScreen'
import ServicesScreen from '@/screens/ServicesScreen'
import MonthlyScheduleScreen from '@/screens/MonthlyScheduleScreen'
import CommunicationScreen from '@/screens/CommunicationScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f97316', // primary-500
        tabBarInactiveTintColor: '#a1a1aa', // dark-400
        tabBarStyle: {
          backgroundColor: '#09090b', // dark-950
          borderTopWidth: 1,
          borderTopColor: '#27272a', // dark-800
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedules"
        component={SchedulesScreen}
        options={{
          tabBarLabel: 'Escalas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Checkin"
        component={CheckinScreen}
        options={{
          tabBarLabel: 'Check-in',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      {/* Hidden tabs - these screens are accessible but don't show in the tab bar */}
      <Tab.Screen
        name="Churches"
        component={ChurchesScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Ministries"
        component={MinistriesScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Teams"
        component={TeamsScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="People"
        component={PeopleScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="MonthlySchedule"
        component={MonthlyScheduleScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="Communication"
        component={CommunicationScreen}
        options={{
          tabBarButton: () => null,
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
