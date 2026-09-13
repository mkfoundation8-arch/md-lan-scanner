# MD LAN Scanner Android WebView

This is the native Android shell for the Vite app. It packages the built React app into `android/app/src/main/assets/www` and opens it in a JavaScript-enabled WebView.

## Build the APK

From the repository root in PowerShell:

```powershell
npm install
npm run android:prepare
Set-Location android
.\gradlew.bat assembleDebug
```

The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

You can also open the `android` directory in Android Studio and run the `app` configuration after running `npm run android:prepare`.

## LAN behavior

The manifest grants Internet and Wi-Fi state access, and the network security policy allows cleartext HTTP because local XAMPP servers commonly use `http://192.168.x.x`. The WebView enables DOM storage, JavaScript, mixed content, and normal back navigation.

The APK contains the React UI locally. The LAN hosts opened by the scanner remain external HTTP/HTTPS resources and therefore require the phone and development machine to be on the same network.
