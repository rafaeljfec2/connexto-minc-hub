import type { NavigatorScreenParams } from '@react-navigation/native'

export type RootStackParamList = {
  Login: undefined
  Main: NavigatorScreenParams<MainTabParamList>
  Churches: undefined
  Ministries: undefined
  Teams: undefined
  People: undefined
  Users: undefined
  Services: undefined
  MonthlySchedule: undefined
  Communication: undefined
  ChatDetail: { conversationId: string; otherUserId: string }
}

export type MainTabParamList = {
  Dashboard: undefined
  Schedules: undefined
  Checkin: undefined
  Chat: undefined
  Profile: undefined
  QRCodeScanner: undefined
  QRCodeScanner: undefined
}

export type AuthStackParamList = {
  Login: undefined
}

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
