# EAS Build for TestFlight (iOS)

This guide explains how to configure EAS and ship iOS builds to TestFlight.

## Prerequisites

1. **Apple Developer Program** membership ($99/year) — https://developer.apple.com
2. **EAS CLI**

   ```bash
   npm install -g eas-cli
   ```

3. **Expo login**

   ```bash
   eas login
   ```

## Step 1: Initialize the EAS project

```bash
cd apps/mobile
eas init
```

## Step 2: iOS credentials

### Option A: EAS-managed credentials (recommended)

```bash
eas credentials
```

Select platform **iOS** and profile **production**. EAS can create the App ID, distribution certificate, and provisioning profile.

### Option B: Existing credentials

Run `eas credentials` and choose **Use existing** for each credential type.

## Step 3: Configure `app.json`

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.minc.hub",
      "buildNumber": "1"
    }
  }
}
```

The **bundle identifier** must be unique and match App Store Connect / Apple Developer.

## Step 4: Build for TestFlight

```bash
pnpm build:ios -- --profile production
# or
eas build --platform ios --profile production
```

EAS produces a signed **`.ipa`** for App Store distribution.

## Step 5: Submit to TestFlight

### EAS Submit (recommended)

```bash
eas submit --platform ios --profile production
eas submit --platform ios --latest
```

### App Store Connect (manual)

1. https://appstoreconnect.apple.com
2. **My Apps** → your app → **TestFlight**
3. Upload the `.ipa` from EAS
4. Add testers after processing completes

## Step 6: TestFlight setup

1. **What to test** — release notes for testers
2. **Testers**
   - **Internal**: up to 100 team members
   - **External**: up to 10,000 (requires Apple review on first external build)
3. Assign the processed build to tester groups

## `eas.json` production profile

```json
{
  "build": {
    "production": {
      "distribution": "store",
      "ios": {
        "resourceClass": "m-medium",
        "buildConfiguration": "Release"
      }
    }
  }
}
```

- **`distribution: "store"`** — App Store / TestFlight
- **`buildConfiguration: "Release"`** — optimized release build

## Check build status

```bash
eas build:list --platform ios
eas build:view [BUILD_ID]
```

## Troubleshooting

| Issue | Action |
| ----- | ------ |
| No Apple Team ID | Set in `eas credentials` or `eas.json` (`appleTeamId`) |
| Bundle ID already in use | Change `ios.bundleIdentifier` in `app.json` |
| Signing failed | Regenerate credentials via `eas credentials` |
| Build not in TestFlight | Wait 10–30 minutes for processing; check `eas submit:list` |

## Useful commands

```bash
eas login
eas whoami
eas init
eas credentials --platform ios
eas build --platform ios --profile production
eas submit --platform ios --latest
eas build:list --platform ios
eas submit:list --platform ios
```

## Notes

1. First iOS builds often take 15–30 minutes
2. External TestFlight testing requires Apple review (often 1–2 days the first time)
3. Increment **`buildNumber`** for every new binary
4. Bump **`version`** when releasing a new user-visible version

## Next steps

After TestFlight feedback, fix issues, increment `buildNumber`, rebuild, and resubmit.
