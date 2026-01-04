import type { NavigatorScreenParams } from '@react-navigation/native'
import type { UserRole } from '@minc-hub/shared/types'

export type RootStackParamList = {
  Login: undefined
  Main: NavigatorScreenParams<MainTabParamList>
}

export type MainTabParamList = {
  Dashboard: undefined
  People: undefined
  Teams: undefined
  Schedules: undefined
  Profile: undefined
}

export type AuthStackParamList = {
  Login: undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
