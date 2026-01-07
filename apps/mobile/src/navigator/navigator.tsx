import React from 'react'
import { Alert } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import type { RootStackParamList, MainTabParamList } from './navigator.types'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import LoginScreen from '@/screens/LoginScreen'
import DashboardScreen from '@/screens/DashboardScreen'
import SchedulesScreen from '@/screens/SchedulesScreen'
import { CheckinScreen } from '@/screens/QRCodeScannerScreen'
import ChatScreen from '@/screens/ChatScreen'
import ChatDetailScreen from '@/screens/ChatScreen/ChatDetailScreen'
import ProfileScreen from '@/screens/ProfileScreen'

import ChurchesScreen from '@/screens/ChurchesScreen'
import MinistriesScreen from '@/screens/MinistriesScreen'
import TeamsScreen from '@/screens/TeamsScreen'
import PeopleScreen from '@/screens/PeopleScreen'
import UsersScreen from '@/screens/UsersScreen'
import ServicesScreen from '@/screens/ServicesScreen'
import MonthlyScheduleScreen from '@/screens/MonthlyScheduleScreen'
import CommunicationScreen from '@/screens/CommunicationScreen'

import { DashboardHeader } from '@/screens/DashboardScreen/DashboardHeader'

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()
const HomeStack = createNativeStackNavigator<RootStackParamList>()

const renderDashboardHeader = () => (
  <DashboardHeader
    onMenuPress={() => Alert.alert('Menu', 'Abrir drawer')}
    onProfilePress={() => Alert.alert('Perfil', 'Ir para perfil')}
    onNotificationPress={() => Alert.alert('Notificações', 'Sem novas notificações')}
  />
)

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        header: renderDashboardHeader,
        animation: 'slide_from_right',
      }}
    >
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} />
      <HomeStack.Screen name="Churches" component={ChurchesScreen} />
      <HomeStack.Screen name="Ministries" component={MinistriesScreen} />
      <HomeStack.Screen name="Teams" component={TeamsScreen} />
      <HomeStack.Screen name="People" component={PeopleScreen} />
      <HomeStack.Screen name="Users" component={UsersScreen} />
      <HomeStack.Screen name="Services" component={ServicesScreen} />
      <HomeStack.Screen name="MonthlySchedule" component={MonthlyScheduleScreen} />
      <HomeStack.Screen name="Communication" component={CommunicationScreen} />
      {/* Messages/Chat could also be here if we want tabs visible, but Chat has its own tab */}
    </HomeStack.Navigator>
  )
}

const DashboardIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="home" size={size} color={color} />
)
const SchedulesIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="calendar" size={size} color={color} />
)
const CheckinIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="qr-code" size={size} color={color} />
)
const ChatIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="chatbubbles" size={size} color={color} />
)
const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="person" size={size} color={color} />
)

function MainTabs() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.dark,
        tabBarStyle: {
          backgroundColor: colors.background.default,
          borderTopWidth: 1,
          borderTopColor: colors.card.border,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          height: 60 + insets.bottom,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: DashboardIcon,
        }}
      />
      <Tab.Screen
        name="Schedules"
        component={SchedulesScreen}
        options={{
          tabBarLabel: 'Escalas',
          tabBarIcon: SchedulesIcon,
        }}
      />
      <Tab.Screen
        name="Checkin"
        component={CheckinScreen}
        options={{
          tabBarLabel: 'Check-in',
          tabBarIcon: CheckinIcon,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ChatIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ProfileIcon,
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
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  )
}
