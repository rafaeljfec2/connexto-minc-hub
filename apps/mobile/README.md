# MINC Teams Mobile

Mobile app for the MINC (Minha Church na Cidade) team management system.

## Technologies

- React Native
- Expo
- TypeScript
- React Navigation
- Expo Camera (QR Code)

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start development server
pnpm --filter mobile start

# Start on Android
pnpm --filter mobile android

# Start on iOS
pnpm --filter mobile ios
```

## Build

### Development (EAS Build)

```bash
# Build Android APK (development)
pnpm --filter mobile build:android -- --profile development

# Build iOS (development)
pnpm --filter mobile build:ios -- --profile development
```

### Production

```bash
# Build Android
pnpm --filter mobile build:android -- --profile production

# Build iOS
pnpm --filter mobile build:ios -- --profile production

# Build both platforms
pnpm --filter mobile build:all -- --profile production
```

## Submission

```bash
# Submit Android to Google Play
pnpm --filter mobile submit:android

# Submit iOS to App Store
pnpm --filter mobile submit:ios
```

## Structure

```
apps/mobile/
├── src/
│   ├── App.tsx              # Entry point
│   ├── components/          # Reusable components
│   ├── contexts/            # Contexts (Auth, Theme)
│   ├── navigator/           # Navigation configuration
│   ├── screens/             # Application screens
│   ├── theme/               # Design tokens
│   └── lib/                 # Utilities and API client
├── app.json                 # Expo configuration
├── eas.json                 # EAS Build configuration
└── package.json
```

## Environment Variables

Create a `.env` file:

```
EXPO_PUBLIC_API_URL=https://api.minc-teams.com
EXPO_PUBLIC_MOCK_MODE=false
```

## Permissions

The app requires the following permissions:

- **Camera**: To scan QR codes (critical feature)

Configured automatically via `app.json`.

## Notes

- The app uses `@minc-teams/shared` to share types, services, and utils with the web app
- Hybrid navigation: Stack Navigator + Tab Navigator
- Design system based on shared tokens
