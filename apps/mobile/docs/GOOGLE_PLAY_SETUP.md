# EAS Build for Google Play (Android)

This guide explains how to configure EAS and build the Android app for Google Play.

## Prerequisites

1. **Google Play Developer account**
   - https://play.google.com/console
   - One-time registration fee ($25)

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

This creates or links the project in your Expo account.

## Step 2: Android credentials

### Option A: Let EAS manage credentials (recommended)

```bash
eas credentials
```

Select:

- Platform: `android`
- Profile: `production` (for Google Play)

EAS will generate and store a keystore securely.

> **Important:** Store the keystore password in a secure location. If you lose it, you cannot update the same app listing.

### Option B: Use an existing keystore

Run `eas credentials`, choose **Use existing**, and provide:

- Path to `.jks` or `.keystore`
- Key alias and passwords

## Step 3: Configure `app.json`

```json
{
  "expo": {
    "android": {
      "package": "com.minc.hub",
      "versionCode": 1
    }
  }
}
```

- **`package`** must be unique and match the Play Console application ID
- **`versionCode`** must increase on every upload (integer)

## Step 4: Create the app in Play Console

1. Open https://play.google.com/console
2. **Create app**
3. Fill in app name, default language, app type, and pricing
4. Accept terms and create

## Step 5: Service account (automated submit)

### Create a service account

1. Play Console: **Settings** > **API access**
2. Link a Google Cloud project
3. In Google Cloud IAM: https://console.cloud.google.com/iam-admin/serviceaccounts
4. **Create service account** (e.g. `EAS Submit`)
5. Create a **JSON key** and download it

### Grant Play Console access

1. Play Console: **Settings** > **API access**
2. Find the service account and **Grant access**
3. Role: **Admin** (or the minimum required for your submit flow)

### Store the key safely

Save as e.g. `apps/mobile/google-play-key.json` and add to `.gitignore`:

```
google-play-key.json
*.json
```

### Update `eas.json`

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "internal"
      }
    }
  }
}
```

**Tracks:** `internal`, `alpha`, `beta`, `production`

## Step 6: Build for Google Play

```bash
pnpm build:android -- --profile production
# or
eas build --platform android --profile production
```

Output is a signed **`.aab`** (Android App Bundle).

## Step 7: Submit to Google Play

### EAS Submit (recommended)

```bash
eas submit --platform android --profile production
eas submit --platform android --latest
```

### Manual upload

1. Play Console → your app → **Production** or **Internal testing**
2. **Create new release**
3. Upload the `.aab` from EAS
4. Complete release notes and publish

## Step 8: Testing tracks

- **Internal testing**: up to 100 testers by email
- **Closed testing (alpha/beta)**: tester lists or open links

## `eas.json` production profile

Typical settings:

```json
{
  "build": {
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  }
}
```

- **`distribution: "store"`** — store release
- **`buildType: "app-bundle"`** — required format for Play

## Check build status

```bash
eas build:list --platform android
eas build:view [BUILD_ID]
```

## Troubleshooting

| Issue | Action |
| ----- | ------ |
| No keystore | `eas credentials --platform android` → set up new keystore |
| Package name taken | Change `android.package` in `app.json` |
| Service account key missing | Verify path in `eas.json` and file permissions |
| Upload failed | Confirm API access and JSON validity |
| Version code already used | Increment `versionCode` in `app.json` |

## Useful commands

```bash
eas login
eas whoami
eas init
eas credentials --platform android
eas build --platform android --profile production
eas submit --platform android --latest
eas build:list --platform android
eas submit:list --platform android
```

## Versioning

- **`versionCode`**: integer, not shown to users, must increase every build
- **`version`**: semver string shown in the store (e.g. `1.0.0`)

Example bump:

```json
{
  "expo": {
    "version": "1.0.1",
    "android": { "versionCode": 2 }
  }
}
```

## Release checklist

- [ ] EAS CLI installed and logged in
- [ ] `eas init` completed
- [ ] Android credentials configured
- [ ] App created in Play Console
- [ ] Service account created and JSON key stored (not in git)
- [ ] `eas.json` submit path configured
- [ ] Unique `package` and incremented `versionCode`
- [ ] Production build succeeded
- [ ] Submit to internal track and test before production

## Notes

1. First builds may take 15–30 minutes
2. Losing the upload keystore blocks updates to the same app ID
3. Google Play requires **AAB** for new apps
4. First store review can take several hours

## Next steps

After internal testing, fix issues, bump `versionCode`, rebuild, submit, and promote to production when ready.
