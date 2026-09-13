# MD LAN Scanner - Build Instructions

Complete guide to build and install the APK on your Android phone.

## Prerequisites

### On Your Computer
- **Node.js** (v18+) and npm
- **Java Development Kit (JDK)** (v17+)
- **Android SDK** (API level 35)
- **Android NDK** (optional, for native compilation)
- **PowerShell** (Windows) or **Bash** (macOS/Linux)

### Optional but Recommended
- **Android Studio** (for easier setup and debugging)
- **Gradle** (usually bundled with Android Studio or Android SDK)

## Setup Steps

### 1. Install Node.js Dependencies

```bash
npm install
```

This installs React, Vite, TypeScript, and other required packages.

### 2. Build the Web App

```bash
npm run build
```

This compiles the React app using Vite and outputs optimized files to the `dist/` directory.

### 3. Copy Web Assets to Android

```bash
npm run android:prepare
```

This runs both `build` and `copy-assets`, which copies the compiled web app to:
```
android/app/src/main/assets/www/
```

### 4. Build the APK

#### Option A: Using Gradle Command (PowerShell on Windows)

```powershell
Set-Location android
.\gradlew.bat assembleDebug
```

#### Option B: Using Gradle Command (Bash on macOS/Linux)

```bash
cd android
./gradlew assembleDebug
```

#### Option C: Using Android Studio

1. Open the `android/` directory in Android Studio
2. Select **Build → Make Project**
3. Select **Build → Build Bundle(s) / APK(s) → Build APK(s)**

### 5. Locate Your APK

The debug APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Installation on Phone

### Method 1: USB Cable (Recommended)

1. **Enable Developer Mode on your phone:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back, open Developer Options
   - Enable "USB Debugging"

2. **Connect your phone via USB**

3. **Install using adb (Android Debug Bridge):**

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 2: Manual File Transfer

1. Copy `app-debug.apk` to your phone via USB or cloud storage
2. On your phone, enable "Unknown sources" in Settings → Security
3. Open the APK file in your file manager
4. Tap "Install"

### Method 3: Generate Release APK (For Google Play)

For production, you'll need to sign the APK:

```powershell
Set-Location android
.\gradlew.bat assembleRelease
```

This creates an unsigned release APK at:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

You'll need to sign it with your keystore before uploading to Google Play.

## Troubleshooting

### "gradlew not found"
- Ensure you're in the `android/` directory
- On macOS/Linux, make gradlew executable: `chmod +x ./gradlew`

### "JAVA_HOME not set"
- Set Java path:
  - **Windows**: Go to Control Panel → Environment Variables → Add JAVA_HOME
  - **macOS/Linux**: `export JAVA_HOME=$(/usr/libexec/java_home)`

### "API level 35 not installed"
- Open Android Studio → SDK Manager
- Go to SDK Platforms tab
- Install "Android 15 (API 35)"

### APK won't install
- Ensure previous version is uninstalled
- Check that your phone's Android version is 6.0+ (minSdk = 23)
- Enable installation from unknown sources in Security settings

### WebView loads blank page
- Check that `android/app/src/main/assets/www/index.html` exists
- Run `npm run android:prepare` again
- Rebuild the APK

## Fast Build/Test Cycle

For rapid development:

```bash
# Terminal 1: Watch web app changes
npm run dev

# Terminal 2: Build, copy, and install when ready
npm run android:prepare && cd android && .\gradlew.bat assembleDebug && adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Important Notes

- The app requires **Internet permission** to scan LAN devices
- Your phone must be on the **same WiFi network** as the devices you want to scan
- The app allows **cleartext HTTP** for local network communication
- First build may take 2-5 minutes; subsequent builds are faster

## Next Steps

- Customize the React app in `src/App.tsx`
- Add scanning logic and device detection
- Update app icon and colors in `android/app/src/main/res/`
- Add more features as needed

For questions or issues, check the README.md or open a GitHub issue.