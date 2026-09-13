# MD LAN Scanner

A cross-platform LAN scanning tool that combines a native Android shell with a React web UI. Scan and discover devices on your local area network with ease.

## Features

- 📱 Native Android application with WebView
- ⚡ React + Vite for fast web UI
- 🌐 Scan local network devices
- 🔒 Secure cleartext HTTP for LAN communication
- 📦 Bundled React app in native APK
- 🎨 Dark theme optimized UI

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Android**: Kotlin, Android SDK 35, AndroidX
- **Build**: Gradle (Kotlin DSL), npm

## Project Structure

```
md-lan-scanner/
├── android/                          # Android native app
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/mdlan/scanner/    # Kotlin source
│   │   │   │   └── MainActivity.kt
│   │   │   ├── res/                       # Android resources
│   │   │   ├── assets/www/                # Bundled React app (generated)
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle.kts
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── gradlew / gradlew.bat
├── src/                              # React source
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   └── index.css
├── scripts/                          # Build scripts
│   └── copy-assets.js               # Copy Vite output to Android
├── public/                           # Static assets
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Node dependencies
└── BUILD_INSTRUCTIONS.md            # Detailed build guide
```

## Quick Start

### Prerequisites
- Node.js v18+
- Java JDK 17+
- Android SDK (API 35)
- PowerShell (Windows) or Bash (macOS/Linux)

### Build & Install

```bash
# Install dependencies
npm install

# Build web app and prepare Android assets
npm run android:prepare

# Build APK
cd android
.\gradlew.bat assembleDebug    # Windows
# or
./gradlew assembleDebug         # macOS/Linux

# Install on phone
adb install app/build/outputs/apk/debug/app-debug.apk
```

**Detailed instructions**: See [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)

## Development

### Web App Development

```bash
# Start dev server with hot reload
npm run dev
```

Open http://localhost:5173 in your browser.

### Android Development

Open the `android/` folder in Android Studio for native debugging and testing.

## Permissions

The app requires the following Android permissions:
- `INTERNET` - Access network for scanning
- `ACCESS_NETWORK_STATE` - Check network status
- `ACCESS_WIFI_STATE` - Get WiFi network information

## Security Notes

- The app allows **cleartext HTTP** for local network communication (LAN devices typically use HTTP)
- All network access is limited to local area network resources
- The bundled React app runs in a WebView sandbox

## Architecture

```
┌─────────────────────────────────────────┐
│         Android Package (APK)           │
├─────────────────────────────────────────┤
│  MainActivity (Android/Kotlin)          │
│  └── WebView (Android System)           │
│      └── React App (Bundled Assets)     │
│          ├── UI Components              │
│          └── LAN Scanning Logic         │
├─────────────────────────────────────────┤
│  Network Access Layer                   │
│  └── HTTP/HTTPS to LAN Devices          │
└─────────────────────────────────────────┘
```

## Build Outputs

- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`
- **Web Bundle**: `dist/` (copied to Android assets during build)

## Next Steps

1. Review and modify `src/App.tsx` for your scanning UI
2. Add device discovery and scanning logic
3. Implement network scanning API calls
4. Customize app icon and theme in `android/app/src/main/res/`
5. Sign and publish to Google Play Store

## Troubleshooting

**Issue**: "gradlew command not found"
- Solution: Ensure you're in the `android/` directory and make gradlew executable: `chmod +x ./gradlew`

**Issue**: "No Java compiler found"
- Solution: Set JAVA_HOME environment variable to your JDK 17+ installation

**Issue**: "API level 35 not available"
- Solution: Open Android Studio SDK Manager and install Android 15 (API 35)

For more troubleshooting, see [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Push to your fork
5. Open a Pull Request

## License

[Add your license here]

## Support

For issues, questions, or suggestions:
- Open a GitHub Issue
- Check existing documentation
- Review BUILD_INSTRUCTIONS.md

---

**Ready to build?** Run `npm install && npm run android:prepare` to get started!