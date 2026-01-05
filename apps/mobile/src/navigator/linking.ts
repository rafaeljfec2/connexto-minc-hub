import type { LinkingOptions } from '@react-navigation/native'

export const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: ['mincteams://'],
  config: {
    screens: {
      Login: 'login',
      Main: {
        screens: {
          Dashboard: 'dashboard',
          Schedules: 'schedules',
          Checkin: 'checkin',
          Activities: 'activities',
          Profile: 'profile',
        },
      },
    },
  },
}
