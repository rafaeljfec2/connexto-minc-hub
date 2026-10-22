# MINC Teams WebView App

React Native Expo app that displays the MINC Teams site in a WebView.

## Structure

```
apps/mobile-webview/
├── src/
│   └── App.tsx          # Main component with WebView
├── assets/              # Icons and splash screen
├── index.ts             # Entry point
├── app.json             # Expo configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
└── babel.config.js      # Babel config
```

## Features

- ✅ WebView pointing to https://mincteams.com.br
- ✅ Splash screen
- ✅ Loading indicator
- ✅ External domain blocking
- ✅ Android back button support
- ✅ Connection error handling
- ✅ Offline fallback with retry
- ✅ TypeScript
- ✅ EAS Build configuration

## Usage

### Development

```bash
cd apps/mobile-webview
pnpm start
```

Scan the QR code with the Expo Go app (Android/iOS).

### Production Build

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## Configuration

- **Site URL**: Edit `WEBSITE_URL` in `src/App.tsx`
- **Allowed domains**: Edit `ALLOWED_DOMAINS` in `src/App.tsx`
- **Bundle IDs**: Edit `app.json` to change identifiers

## Notes

- Based on the configuration of `apps/mobile`
- Uses Expo SDK 54 with React 19 and React Native 0.81
- For development with Expo Go, a standalone build may be required
