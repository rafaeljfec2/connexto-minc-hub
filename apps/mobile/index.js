import { registerRootComponent } from 'expo'

// Polyfill for FormData (required for React Native)
if (typeof global.FormData === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  global.FormData = require('react-native/Libraries/Network/FormData').default
}

import App from './src/App'

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)
