# Testing Android Locally (Windows)

This guide explains how to run and test the Android app locally using Android Studio with an emulator or a physical device.

## Prerequisites

1. **Android Studio** (with Android SDK)
   - Download: https://developer.android.com/studio
   - During installation, include:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (AVD)

2. **Environment variables**

   Add these to your Windows `PATH`:

   ```
   %LOCALAPPDATA%\Android\Sdk\platform-tools
   %LOCALAPPDATA%\Android\Sdk\tools
   %LOCALAPPDATA%\Android\Sdk\emulator
   ```

   Or use the full path if the SDK is installed elsewhere:

   ```
   C:\Users\[YOUR_USER]\AppData\Local\Android\Sdk\platform-tools
   C:\Users\[YOUR_USER]\AppData\Local\Android\Sdk\tools
   C:\Users\[YOUR_USER]\AppData\Local\Android\Sdk\emulator
   ```

3. **Java JDK** (usually bundled with Android Studio)

## Step 1: Verify Android SDK

Open PowerShell or CMD and run:

```powershell
adb version
emulator -list-avds
```

If commands fail, configure the environment variables above.

## Step 2: Configure an emulator (option 1 — recommended)

### Create an AVD (Android Virtual Device)

1. Open **Android Studio**
2. Go to **Tools** > **Device Manager**
3. Click **Create Device**
4. Choose a device profile (e.g. Pixel 5)
5. Choose a system image (e.g. Android 13 — API 33)
6. Click **Finish**

### Start the emulator

1. In **Device Manager**, click ▶ on the AVD
2. Or from the command line:

   ```powershell
   emulator -avd [AVD_NAME]
   ```

### List available AVDs

```powershell
emulator -list-avds
```

## Step 3: Use a physical device (option 2)

### Enable developer mode

1. On the Android device:
   - Go to **Settings** > **About phone**
   - Tap **Build number** seven times to enable developer options

2. Enable **USB debugging**:
   - Go to **Settings** > **System** > **Developer options**
   - Turn on **USB debugging**

### Connect the device

1. Connect via USB
2. Accept the authorization prompt on the device
3. Verify the connection:

   ```powershell
   adb devices
   ```

   Expected output:

   ```
   List of devices attached
   ABC123XYZ    device
   ```

## Step 4: Run the app

### Option A: pnpm (recommended)

```powershell
cd apps/mobile
pnpm start

# In another terminal
pnpm android
```

### Option B: Monorepo filter

```powershell
pnpm --filter @minc-teams/mobile start
pnpm --filter @minc-teams/mobile android
```

### Option C: Expo CLI

```powershell
cd apps/mobile
npx expo start
# Press 'a' for Android, or:
npx expo start --android
```

## Step 5: What to expect

1. **Metro Bundler** starts (`Metro waiting on exp://192.168.x.x:8081`)
2. **First build** may take several minutes
3. **The app opens** on the emulator or device
4. **Fast Refresh** applies code changes automatically

## Troubleshooting

### `adb: command not found`

Add the Android SDK paths to the Windows **Path** environment variable (see Prerequisites).

### `No devices/emulators found`

**Emulator:**

```powershell
emulator -list-avds
emulator -avd [AVD_NAME]
```

**Physical device:**

```powershell
adb devices
adb kill-server
adb start-server
adb devices
```

### `Java not found`

Install a JDK or point `JAVA_HOME` to Android Studio’s bundled runtime, for example:

```
C:\Program Files\Android\Android Studio\jbr
```

### Slow emulator

- Enable hardware acceleration (Intel HAXM or Windows Hypervisor Platform)
- Reduce emulator RAM (2 GB is often enough)
- Prefer a physical device for better performance

### Port 8081 already in use

```powershell
netstat -ano | findstr :8081
taskkill /PID [PID] /F
npx expo start --port 8082
```

### App does not load / connection errors

1. Confirm Metro is running
2. Allow Node.js through the firewall
3. On different networks, use a tunnel:

   ```powershell
   npx expo start --tunnel
   ```

### Camera permission errors

On the emulator: **Settings** > **Apps** > **MINC Teams** > **Permissions** > enable **Camera**.

## Useful commands

```powershell
adb devices
adb logcat
adb logcat *:S ReactNative:V ReactNativeJS:V
adb kill-server && adb start-server
adb install app.apk
adb shell
npx expo start --clear
cd apps/mobile && rm -rf node_modules && pnpm install
```

## Recommended development setup

### AVD

- **Device**: Pixel 5 or Pixel 6
- **Android**: API 33 or 34
- **RAM**: 2–4 GB
- **Storage**: 4 GB+

### Performance tips

- Enable hardware acceleration
- Use AVD snapshots for faster boot
- Use a physical device when possible

## Development workflow

1. Start emulator or connect a device
2. Run `pnpm start` in `apps/mobile`
3. Press `a` or run `pnpm android`
4. Develop with Fast Refresh
5. Test QR Code (virtual camera on emulator, real camera on device)

## Next steps

After local testing:

1. Exercise all core flows
2. Test QR Code thoroughly
3. When ready, create an EAS build:

   ```powershell
   pnpm build:android -- --profile preview
   ```

## Notes

- **First run** may download dependencies and take longer
- **Hot Reload / Fast Refresh** update the UI on save
- **Debugging**: use `adb logcat` or React Native Debugger
