# Navo Plus Mobile 🚀

Navo Plus is an all-in-one cross-border fintech, logistics, and assisted commerce mobile application built with **React Native**, **Expo (SDK 51)**, **Expo Router**, **NativeWind (Tailwind CSS)**, and **Redux Toolkit**.

The application empowers users across Nigeria, the United Kingdom, the United States, and Europe to seamlessly manage multi-currency accounts, shop internationally from global retailers, lodge and track international shipments, pay utility bills, and conduct secure foreign exchange transactions.

---

## 📑 Table of Contents

- [Core Product Features](#-core-product-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Repository & Branching Workflow](#-repository--branching-workflow)
- [Prerequisites](#-prerequisites)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Running the App: Expo Go vs Native Dev Client](#-running-the-app-expo-go-vs-native-dev-client)
- [Environment Variables & Secrets](#-environment-variables--secrets)
- [EAS Build & Deployment Guide](#-eas-build--deployment-guide)
  - [1. EAS Setup & Authentication](#1-eas-setup--authentication)
  - [2. EAS Profiles (`eas.json`)](#2-eas-profiles-easjson)
  - [3. Managing Credentials & Keystores](#3-managing-credentials--keystores)
  - [4. Generating Builds](#4-generating-builds)
  - [5. Over-The-Air (OTA) Updates](#5-over-the-air-ota-updates)
  - [6. App Store & Play Store Submission](#6-app-store--play-store-submission)
- [Project Directory Structure](#-project-directory-structure)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌟 Core Product Features

1. **Multi-Currency Wallets & Foreign Exchange (FX)**:
   - Dedicated digital wallets for **NGN (Nigerian Naira)**, **GBP (British Pound)**, **USD (US Dollar)**, and **EUR (Euro)**.
   - Real-time exchange rate tickers, currency conversion calculator, and instant wallet-to-wallet exchanges.
   - Local & international bank beneficiary management for rapid payouts and transfers.

2. **Shop4Me (Assisted Cross-Border Commerce)**:
   - **Amazon Integration**: Search products, explore curated categories, view product details with currency conversion, calculate shipping quotes, and manage cart.
   - **Naija Shop**: Marketplace connecting overseas users with verified local Nigerian merchants and specialty goods.
   - **eBay Integration**: Direct search and assisted purchase of eBay items.
   - **Shop-with-Link / Store**: Users can paste any external product URL to generate proxy purchase orders, delivery fee calculations, and doorstep fulfillment.

3. **Global Logistics & Package Forwarding**:
   - **Lodge Shipment**: Send packages internationally or locally with dimension/weight inputs, goods category selection, and automated price estimation.
   - **Check-In Shipment**: Log inbound packages arriving at overseas warehouse hubs.
   - **Live Shipment Timeline**: Visual milestone tracking (`Pending`, `Arrived at Facility`, `In Transit`, `Delivered`).
   - **Adjustment Fee Payments**: Pay weight discrepancy adjustments directly in-app.

4. **Virtual Payments & Value-Added Services (VAS)**:
   - Airtime & Mobile Data top-ups (MTN, Airtel, Glo, 9mobile).
   - Cable TV subscription renewals (DSTV, GOTV, Startimes).
   - Utility bill payments (Electricity distribution companies, meter recharge).

5. **Identity Verification & Compliance (KYC)**:
   - Tiered onboarding verification: Nigeria BVN verification with SMS/OTP authentication.
   - UK & International Document KYC: ID/Passport scanning, proof of address, and selfie liveness/face detection powered by ML-Kit.

6. **Enterprise-Grade Security**:
   - Biometric login (FaceID / Fingerprint via `expo-local-authentication`).
   - Custom 4-digit transaction PIN with secure keypad (`SetPin`, `ChangePin`, `ForgotPin` with OTP).
   - Cryptographic security questions for account recovery.
   - Secure token storage via `expo-secure-store` and `react-native-keychain`.
   - Automatic JWT token refresh interceptor via Axios (`globalApi.ts`).

7. **Transactions & PDF Invoicing**:
   - Comprehensive ledger of all user transactions with advanced status filtering.
   - One-tap dynamic PDF receipt generation and sharing (`expo-print`, `expo-sharing`).

---

## 🛠 Tech Stack & Architecture

- **Core Framework**: React Native `0.74.5` / Expo SDK `51`
- **Navigation & Routing**: Expo Router `v3` (file-based routing under `app/`)
- **Language**: TypeScript with strict mode
- **Styling**: NativeWind `v4` (Tailwind CSS `v3`) with custom Aeonik & Raleway typography
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
  - Slices: `AuthSlice`, `ProfileSlice`, `WalletSlice`, `TransactionSlice`, `ReferralSlice`, `LoaderSlice`
- **Networking**: Axios instance (`globalApi.ts`) with automated `401` refresh token retry logic
- **Payments**: `@stripe/stripe-react-native` + Native multi-currency gateways
- **Hardware & Native**: `react-native-vision-camera`, `@react-native-ml-kit/face-detection`, `react-native-mmkv`, `react-native-blob-util`, `expo-print`, `expo-sharing`

---

## 🌿 Repository & Branching Workflow

> [!IMPORTANT]
> **Branch Convention**: The primary development and production branch for this repository is **`master`** (not `main`). Always make sure your local repository points to and pulls from `master`.

### Cloning and Branch Setup

```bash
# Clone the repository
git clone -b master https://github.com/maekandex-collab/navo_mobile.git

# Navigate into the project folder
cd navo_mobile

# Verify the current branch is master
git branch
# * master

# Always pull latest updates from master before starting work
git checkout master
git pull origin master
```

### Development Flow
1. Branch off `master`: `git checkout -b feature/your-feature-name`
2. Commit changes with clear, descriptive commit messages.
3. Push to origin: `git push origin feature/your-feature-name`
4. Open a Pull Request against **`master`**.

---

## 📦 Prerequisites

Before setting up the project, make sure you have the following installed:

- **Node.js**: `v18.x` or `v20.x` LTS ([Download Node.js](https://nodejs.org/))
- **npm** (included with Node) or **yarn**
- **Git**: Installed and configured
- **Expo CLI**: Available via `npx expo`
- **EAS CLI**: Required for cloud builds and deployments:
  ```bash
  npm install -g eas-cli
  ```
- **Mobile Development Environment** (Optional for Expo Go, Required for Native Builds):
  - **Android**: Android Studio with Android SDK (API 34+), build-tools, and an Android Emulator or physical device with USB debugging enabled.
  - **iOS** (macOS only): Xcode 15+, CocoaPods, and Command Line Tools.

---

## 🚀 Getting Started & Local Setup

### 1. Install Dependencies

Run `npm install` inside the project root:

```bash
npm install
```

> [!NOTE]
> The `postinstall` script automatically runs `patch-package` to apply necessary compatibility fixes for packages like `react-native-snap-carousel` (`patches/react-native-snap-carousel+3.9.1.patch`).

### 2. Configure Local Environment Variables

Create your local `.env` file by copying the provided `.env.example`:

```bash
# On Windows PowerShell
Copy-Item .env.example .env

# On macOS/Linux
cp .env.example .env
```

Open `.env` and fill in the appropriate values:

```env
# Backend API Base URL
EXPO_PUBLIC_SERVER_URI=https://navoapi.viaspark.site/api/v1

# API Authentication Header Key
EXPO_PUBLIC_API_KEY=your_api_key_here

# Stripe Publishable Key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Base URL for user avatar uploads
EXPO_PUBLIC_IMAGE_URI=https://navoapi.viaspark.site/
```

---

## 📱 Running the App: Expo Go vs Native Dev Client

This project utilizes custom native modules (such as `react-native-vision-camera`, `@stripe/stripe-react-native`, `react-native-mmkv`, and `react-native-blob-util`). You have two ways to run the app during development:

### Option A: Expo Go Mode (Fast Simulation via Compatibility Stubs)

If you want to rapidly work on UI screens, forms, layouts, or navigation without compiling native binaries, use the built-in **Expo Go compatibility layer**:

```bash
npm run start:expo-go
```

**How it works:**
`scripts/start-expo-go.js` sets `EXPO_GO_COMPAT=1`. Metro (`metro.config.js`) intercepts imports of custom native libraries and dynamically aliases them to safe fallback stubs located in `compat/expo-go/`. This allows standard Expo Go to run without crashing on unsupported native code.

### Option B: Native Development Build (Full Features & Real Hardware)

To test features that require actual native hardware (camera face detection, live Stripe payment sheets, secure keychain storage):

```bash
# Run on connected Android device / emulator
npm run android
# Or: npx expo run:android

# Run on iOS simulator / device (macOS only)
npm run ios
# Or: npx expo run:ios
```

To clear Metro bundler cache at any time:
```bash
npm run start:clear
```

---

## 🔐 Environment Variables & Secrets

### Client-Side Variables (`EXPO_PUBLIC_*`)
In Expo SDK 49+, all variables prefixed with `EXPO_PUBLIC_` are statically embedded into the JavaScript bundle at build time.

| Variable Name | Description | Example |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_SERVER_URI` | Base endpoint for the Navo REST backend | `https://navoapi.viaspark.site/api/v1` |
| `EXPO_PUBLIC_API_KEY` | Custom header key passed in `expo-api-key` | `abc123secretkey` |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for `<StripeProvider>` | `pk_test_51...` |
| `EXPO_PUBLIC_IMAGE_URI` | CDN or server base URL for user avatars | `https://navoapi.viaspark.site/` |

### EAS Build Secrets & Cloud Environment Variables
When building via EAS (Expo Application Services), `.env` files are not pushed to git. Instead, configure them in EAS:

#### Method 1: Using the EAS CLI
```bash
# Add a variable to a specific environment
eas env:create --environment preview --name EXPO_PUBLIC_SERVER_URI --value https://navoapi.viaspark.site/api/v1
eas env:create --environment production --name EXPO_PUBLIC_SERVER_URI --value https://navoapi.viaspark.site/api/v1
eas env:create --environment preview --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value pk_test_...
eas env:create --environment production --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value pk_live_...
```

#### Method 2: EAS Web Dashboard
1. Log in to [expo.dev](https://expo.dev).
2. Open the **navoPlus** project.
3. In the left navigation, go to **Project Settings** → **Environment Variables**.
4. Add your variables and assign them to `preview`, `production`, and `development` scopes.

---

## 🚀 EAS Build & Deployment Guide

The project is pre-configured for automated cloud compilation via **EAS (Expo Application Services)**.

### 1. EAS Setup & Authentication

1. Install EAS CLI globally (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. Log in with your Expo developer account:
   ```bash
   eas login
   ```

3. Check current project linkage:
   ```bash
   eas project:info
   ```
   *(If initializing on a fresh account, run `eas init` and choose the project `navoPlus`).*

---

### 2. EAS Profiles (`eas.json`)

The project includes pre-configured build profiles in `eas.json`:

```json
{
  "cli": {
    "version": ">= 10.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "channel": "production",
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

- **`development`**: Compiles an Expo Dev Client with all native modules for internal testing on emulators.
- **`preview`**: Generates a **standalone Android APK** (`.apk`) suitable for immediate distribution to team members, clients, and QA testers without going through Google Play.
- **`production`**: Generates an optimized **Android App Bundle (`.aab`)** and iOS production binary for Google Play Console and Apple App Store submission.

---

### 3. Managing Credentials & Keystores

EAS manages release signing keys securely in the cloud:

```bash
# View or configure signing credentials
eas credentials
```

- **Android**: EAS can generate and securely store your Android Keystore automatically on first build, or you can import an existing `.jks` file.
- **iOS**: EAS manages Distribution Certificates, Provisioning Profiles, and Push Notification keys via your Apple Developer Account.

---

### 4. Generating Builds

#### Android Preview Build (Standalone APK for Testing)
Use this command to generate a shareable `.apk` for team review:

```bash
npx eas build --platform android --profile preview
```
*(Add `--non-interactive` for CI/CD environments).*

When complete, EAS outputs:
1. An Expo build URL (e.g. `https://expo.dev/accounts/.../projects/navoPlus/builds/...`)
2. A direct download link and QR code for the `.apk` file.

#### Android Production Build (Google Play AAB)
```bash
npx eas build --platform android --profile production
```

#### iOS Preview / Ad-Hoc Build
```bash
npx eas build --platform ios --profile preview
```

#### iOS Production Build (App Store / TestFlight)
```bash
npx eas build --platform ios --profile production
```

#### Multi-Platform Build
```bash
npx eas build --platform all --profile preview
```

---

### 5. Over-The-Air (OTA) Updates

To deploy JavaScript and asset bug fixes immediately without recompiling native binaries:

```bash
# Publish an update to the preview channel
eas update --channel preview --message "Fix exchange rate calculation display"

# Publish an update to production users
eas update --channel production --message "Update security question verification flow"
```

---

### 6. App Store & Play Store Submission

Submit builds directly to stores using EAS Submit:

#### Google Play Store
```bash
eas submit --platform android
```
*(Requires Google Service Account JSON configured via `eas credentials` or Google Play API access).*

#### Apple App Store (TestFlight & App Store Connect)
```bash
eas submit --platform ios
```
*(Requires Apple ID credentials or an App Store Connect API Key).*

---

## 📁 Project Directory Structure

```plaintext
navo_mobile/
├── app/                           # Expo Router file-based route definitions
│   ├── (onboarding)/              # Auth routes: SignIn, SignUp, OTP, ResetPassword
│   ├── (protected)/               # Authenticated application flows
│   │   ├── (routes)/              # Sub-screens (Accounts, KYC, Security, Shop4Me)
│   │   └── (tabs)/                # Main bottom tab navigators:
│   │       ├── home/              # Dashboard, quick actions, balances
│   │       ├── market/            # Shop4Me marketplace hub
│   │       ├── shipments/         # Logistics, package lodging, tracking
│   │       ├── transactions/      # Transaction history & receipts
│   │       └── more/              # Profile, KYC, Security, VAS, Settings
│   ├── _layout.tsx                # Root layout, theme providers, deep link router
│   └── index.tsx                  # Root entry redirection
├── assets/                        # Static assets (fonts, brand images, icons)
│   ├── fonts/                     # Aeonik & Raleway custom typography
│   └── images/                    # UI illustrations, icons, splash images
├── compat/                        # Compatibility layer for standard Expo Go
│   └── expo-go/                   # Stub implementations for custom native modules
├── components/                    # Reusable UI component library
│   ├── amazon/                    # Amazon shop product cards, search, carousel
│   ├── naija-shop/                # Naija Shop vendor lists & items
│   ├── orders-card/               # Specialized order cards (Amazon, Fooding, etc.)
│   ├── select-modals/             # Modals for banks, states, utility billers
│   └── skeleton/                  # Shimmer skeleton loading components
├── constants/                     # Design tokens: Colors, Images, Icons, Data
├── hooks/                         # Custom React hooks (LayoutLoader, etc.)
├── patches/                       # patch-package diffs (e.g. react-native-snap-carousel)
├── redux/                         # Redux Toolkit store & slices
│   ├── AuthSlice.ts               # User authentication & session state
│   ├── ProfileSlice.ts            # User profile data & avatar
│   ├── WalletSlice.ts             # Multi-currency balances
│   ├── TransactionSlice.ts        # Transaction records & filters
│   ├── ReferralSlice.ts           # Referral links & statistics
│   ├── LoaderSlice.ts             # Global loading modal overlay
│   └── store.ts                   # Central store configuration
├── screens/                       # Screen implementations mapped to routes
├── scripts/                       # Developer utility scripts
│   └── start-expo-go.js           # Metro launcher enabling Expo Go stubs
├── types/                         # TypeScript ambient type declarations
├── utils/                         # Business logic & helper utilities
│   ├── AmazonCartStorage.tsx      # Amazon shopping cart persistence
│   ├── CartStorage.ts             # Shop-with-Link cart storage
│   ├── NaijaShopCartStorage.ts    # Naija Shop cart management
│   ├── ReceiptPDF.ts              # PDF receipt template & generator
│   ├── TransactionsApi.ts         # Transaction API helpers
│   └── WalletApi.ts               # Multi-currency wallet operations
├── .easignore                     # Files excluded from EAS Cloud Builds
├── .env.example                   # Template for local environment variables
├── .gitignore                     # Git ignore rules (configured for security)
├── app.json                       # Expo app manifest & native plugins
├── babel.config.js                # Babel configuration (NativeWind & Reanimated)
├── eas.json                       # EAS Build, Update, and Submit profiles
├── global.css                     # Tailwind CSS entry stylesheet
├── globalApi.ts                   # Central Axios client with token refresh
├── metro.config.js                # Metro bundler config with NativeWind & Go compat
├── package.json                   # Project dependencies and npm scripts
├── tailwind.config.js             # Tailwind design tokens and color scheme
└── tsconfig.json                  # TypeScript compiler settings & path aliases
```

---

## ❓ Troubleshooting & FAQs

### 1. `Render Error: Native module not found` in Expo Go
- **Cause**: Standard Expo Go does not contain custom native code like `react-native-vision-camera` or `@stripe/stripe-react-native`.
- **Fix**: Run `npm run start:expo-go` to activate the built-in compatibility stubs, or compile a native build using `npx expo run:android` / `npx expo run:ios`.

### 2. `ViewPropTypes has been removed from React Native`
- **Cause**: Older third-party carousel libraries rely on removed prop-types.
- **Fix**: Run `npx patch-package` or reinstall dependencies (`npm install`). The included patch in `patches/` automatically substitutes `deprecated-react-native-prop-types`.

### 3. Infinite 401 Loop or Token Refresh Errors
- **Cause**: The stored refresh token has expired or is invalid.
- **Fix**: Clear application data or delete tokens via `expo-secure-store`. The Axios interceptor in `globalApi.ts` will clear state and redirect to `/(onboarding)/SignIn`.

### 4. Metro Bundler Cache Issues
- If styles or file changes are not reflecting, clear the cache:
  ```bash
  npx expo start --clear
  ```

### 5. Deep Linking Not Opening Screen
- Verify that URL scheme `navo://` is used (e.g. `navo://goto?screen=fx&status=successful&currencyTo=NGN`).
- Ensure the app is listening via `Linking.addEventListener('url', handleDeepLink)` in `app/_layout.tsx`.

---

## 🤝 Contributing

1. Ensure your branch is updated with `master`.
2. Adhere to the established Tailwind design system and color palette in `tailwind.config.js`.
3. Test changes in both Expo Go stub mode and a native development build before pushing.
4. Keep secret keys and credentials out of commits and git history.
