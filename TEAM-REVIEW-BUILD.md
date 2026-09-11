# Navo Plus Android — Client Preview Build

**Build date:** August 7, 2026  
**Version:** 1.0.0 (versionCode 1)  
**API:** `https://navoapi.viaspark.site/api/v1`

---

## Install (Android)

**Install page (open on phone or share with client):**  
https://expo.dev/accounts/random_expouser/projects/navoPlus/builds/bcf575a7-22fa-4a5f-89bb-11482a2fc32b

**Direct APK download:**  
https://expo.dev/artifacts/eas/d2Qt7-ssRglWTq2OlMhrN57TBXA70ePKTVGuw1yN1HY.apk

1. Open the link on an Android device (Chrome recommended).
2. Tap **Install** / download the APK.
3. Allow install from browser if prompted (Settings → Install unknown apps).

---

## What’s included

- Standalone APK (full native modules — not Expo Go)
- Live API: `https://navoapi.viaspark.site/api/v1`
- Stripe test publishable key (from preview profile)

---

## Rebuild command

From `navo_app_frontend/`:

```bash
npx eas build --platform android --profile preview --non-interactive
```
