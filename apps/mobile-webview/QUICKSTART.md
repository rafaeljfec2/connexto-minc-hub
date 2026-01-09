# Quick Start Guide

## First Time Setup

1. **Install dependencies**

   ```bash
   cd apps/mobile-webview
   npm install
   ```

2. **Start development server**

   ```bash
   npm start
   ```

3. **Run on device**
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## Before Production Build

### 1. Update Configuration

Edit `app.json`:

- Change `expo.name` to your app name
- Update `expo.ios.bundleIdentifier` (e.g., `com.yourcompany.app`)
- Update `expo.android.package` (e.g., `com.yourcompany.app`)

### 2. Add Your Assets

Place these files in `assets/` directory:

- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024)
- `splash.png` (1284x2778)
- `favicon.png` (48x48)

### 3. Configure Website URL

Edit `App.tsx`:

```typescript
const WEBSITE_URL = 'https://your-website.com'
const ALLOWED_DOMAINS = ['your-website.com', 'www.your-website.com']
```

### 4. Setup EAS Build

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure
```

This will create an Expo project and update `app.json` with your project ID.

### 5. Build

```bash
# Android APK (for testing)
eas build --platform android --profile preview

# Android AAB (for Play Store)
eas build --platform android --profile production

# iOS (for App Store)
eas build --platform ios --profile production
```

## Common Commands

```bash
# Development
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS

# Clear cache
expo start --clear

# Check for issues
npx expo-doctor
```

## Troubleshooting

**"Module not found"**

```bash
rm -rf node_modules
npm install
```

**"Unable to resolve module"**

```bash
expo start --clear
```

**Build fails**

- Check bundle identifiers are unique
- Verify all required assets exist
- Run `eas build:configure` again

## Next Steps

1. Test on real devices using Expo Go
2. Add your branding (icons, splash screen)
3. Configure push notifications (optional)
4. Build and submit to app stores

For detailed documentation, see README.md
