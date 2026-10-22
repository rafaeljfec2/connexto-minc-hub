# Android SDK on Windows with WSL2

This guide explains how to use the Android SDK installed on Windows from a WSL2 Linux environment.

## Context

- **Code**: WSL2 (Linux)
- **Android SDK**: Windows
- **Challenge**: WSL2 must invoke Windows SDK tools and reach devices/emulators

## Options

### Option 1: Use Windows ADB from WSL2 (recommended)

WSL2 can run Windows executables directly.

#### Step 1: Locate the SDK on Windows

Typical path:

```
C:\Users\[YOUR_USER]\AppData\Local\Android\Sdk
```

In WSL2:

```
/mnt/c/Users/[YOUR_USER]/AppData/Local/Android/Sdk
```

#### Step 2: Add to PATH in WSL2

Edit `~/.bashrc` or `~/.zshrc`:

```bash
export ANDROID_HOME=/mnt/c/Users/[YOUR_USER]/AppData/Local/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/emulator
```

**Or use Windows binaries via aliases:**

```bash
alias adb='/mnt/c/Users/[YOUR_USER]/AppData/Local/Android/Sdk/platform-tools/adb.exe'
alias emulator='/mnt/c/Users/[YOUR_USER]/AppData/Local/Android/Sdk/emulator/emulator.exe'
```

#### Step 3: Reload the shell

```bash
source ~/.bashrc
```

#### Step 4: Verify

```bash
adb version
adb devices
```

### Option 2: Connect to the Windows ADB server

#### Step 1: Start ADB on Windows (PowerShell as Administrator)

```powershell
cd $env:LOCALAPPDATA\Android\Sdk\platform-tools
.\adb.exe start-server
.\adb.exe devices
```

#### Step 2: Use from WSL2

Install Linux `adb` if needed:

```bash
sudo apt update
sudo apt install android-tools-adb
```

Then call the Windows binary directly:

```bash
/mnt/c/Users/[YOUR_USER]/AppData/Local/Android/Sdk/platform-tools/adb.exe devices
```

### Option 3: Expo Go on a physical device (simplest)

#### Step 1: Start Expo in WSL2

```bash
cd apps/mobile
pnpm start
```

#### Step 2: Open the app on the device

1. Install **Expo Go** from the Play Store
2. Scan the QR code shown in the terminal

**Or use a tunnel:**

```bash
pnpm start --tunnel
```

### Option 4: Windows emulator + TCP from WSL2

#### Step 1: Start the emulator on Windows

```powershell
cd $env:LOCALAPPDATA\Android\Sdk\emulator
.\emulator.exe -list-avds
.\emulator.exe -avd [AVD_NAME]
```

#### Step 2: Connect from WSL2

```bash
adb connect 127.0.0.1:5554
adb devices
```

If that fails, find the Windows host IP (`ipconfig` in PowerShell, often a `172.x.x.x` WSL adapter) and connect with:

```bash
adb connect 172.x.x.x:5554
```

## Recommended WSL2 setup script

Create `setup-android-wsl2.sh`:

```bash
#!/bin/bash
WINDOWS_USER="your_windows_user"
ANDROID_SDK_WIN="/mnt/c/Users/$WINDOWS_USER/AppData/Local/Android/Sdk"

export ANDROID_HOME=$ANDROID_SDK_WIN
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/emulator

alias adb="$ANDROID_SDK_WIN/platform-tools/adb.exe"
alias emulator="$ANDROID_SDK_WIN/emulator/emulator.exe"

echo "Android SDK (Windows) configured"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "Try: adb devices"
```

Source it from `~/.bashrc` if desired.

## Simplest path: Expo Go

**Advantages:**

- No ADB configuration required
- Works over the network
- Hot reload works
- Often faster than an emulator

**Usage:**

```bash
cd apps/mobile
pnpm start --tunnel
```

Scan the QR code with Expo Go on your phone.

## Verify configuration

```bash
adb version
adb devices
cd apps/mobile && pnpm start
# 't' for tunnel, or 'a' for Android when adb sees a device
```

## Troubleshooting

### `adb: command not found`

Use the full path to `adb.exe` or add SDK paths to `PATH` (option 1).

### `no devices/emulators found`

- Ensure an emulator or device is running on Windows
- Try `adb connect` over TCP
- Prefer Expo Go with `--tunnel`

### `cannot connect to daemon`

Start the server on Windows:

```powershell
cd $env:LOCALAPPDATA\Android\Sdk\platform-tools
.\adb.exe start-server
```

### Expo cannot find a device

```bash
pnpm start --tunnel
adb devices
```

## Useful commands

```bash
adb version
adb devices
adb connect 127.0.0.1:5554
adb logcat *:S ReactNative:V ReactNativeJS:V
npx expo start --clear
npx expo start --tunnel
```

## Recommendation

For day-to-day development on WSL2:

1. **Expo Go + `--tunnel`** on a physical device (fastest setup), or
2. **Windows SDK on PATH / aliases** + emulator started on Windows

Production builds do not require a local SDK when using **EAS Build**.

## Next steps

1. Pick an option above and verify `pnpm start`
2. When ready:

   ```bash
   pnpm build:android -- --profile preview
   ```
