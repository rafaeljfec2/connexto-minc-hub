# MINC Teams - Mobile WebView App

React Native Expo application that displays the MINC Teams website in a WebView.

## Features

- ✅ WebView pointing to https://mincteams.com.br
- ✅ Splash screen
- ✅ Loading indicator
- ✅ External link blocking (opens in browser)
- ✅ Android back button support
- ✅ Error handling with retry
- ✅ Offline fallback
- ✅ TypeScript support
- ✅ EAS Build ready

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

### Installation

```bash
cd apps/mobile-webview
npm install
```

### Development

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Building for Production

### Configure EAS

1. Login to EAS:

```bash
eas login
```

2. Configure your project:

```bash
eas build:configure
```

3. Update `app.json` with your project ID from Expo dashboard

### Build Commands

```bash
# Build for Android (APK for testing)
eas build --platform android --profile preview

# Build for Android (AAB for Play Store)
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

## Configuration

### Change Website URL

Edit `App.tsx` and update:

```typescript
const WEBSITE_URL = 'https://your-website.com'
const ALLOWED_DOMAINS = ['your-website.com', 'www.your-website.com']
```

### App Name & Bundle ID

Edit `app.json`:

- `expo.name`: App display name
- `expo.slug`: URL-friendly name
- `expo.ios.bundleIdentifier`: iOS bundle ID
- `expo.android.package`: Android package name

### Icons & Splash Screen

Replace these files in `assets/`:

- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024, Android)
- `splash.png` (1284x2778)
- `favicon.png` (48x48, web)

## Push Notifications (Future)

The app is already configured with `expo-notifications`. To implement:

1. Set up Firebase (Android) and APNs (iOS)
2. Configure credentials in EAS
3. Implement notification handlers in App.tsx

Example code structure is ready in the app configuration.

## Project Structure

```
mobile-webview/
├── App.tsx              # Main application with WebView
├── app.json             # Expo configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── eas.json             # EAS Build config
├── babel.config.js      # Babel config
└── assets/              # Images and icons
```

## Security

- External domains are blocked by default
- Only configured domains can be navigated
- HTTPS enforced
- Secure storage ready for future auth

## Troubleshooting

### WebView not loading

- Check internet connection
- Verify WEBSITE_URL is correct
- Check CORS settings on your website

### Build fails

- Run `eas build:configure` again
- Check bundle identifiers are unique
- Verify EAS project ID in app.json

### Android back button not working

- Ensure you're testing on a physical device
- Check BackHandler implementation in App.tsx

## License

Private - MINC Teams
