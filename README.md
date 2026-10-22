# QR Studio

<p align="center">
  <img src="https://img.shields.io/badge/Expo-~57.0.30-000020?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-~6.0.3-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/State-Redux%20Toolkit-764ABC?logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Style-NativeWind-5B21B6?logo=tailwindcss&logoColor=white" alt="NativeWind" />
</p>

A mobile-first QR experience built with Expo and React Native for scanning, creating, saving, and organizing QR codes offline-first on Android and iOS.

## Overview

QR Studio is a cross-platform QR application focused on speed, privacy, and offline reliability. The app supports:

- live QR/barcode scanning with camera and gallery import
- custom QR generation for multiple formats
- local history, favorites, and search
- guest-mode access without a Firebase account
- optional Firebase authentication, Firestore sync, and AI enhancements

## Why this app stands out

- Offline-first experience for scanning and creation
- Mobile-optimized UI with responsive layouts for phones, foldables, and tablets
- Secure local persistence using Redux + AsyncStorage + SecureStore
- Built with Expo Router for file-based navigation
- Prepared for production expansion with Firebase, Cloudinary, and Gemini integrations

## Key features

### QR scanning

- Camera-based scanning with permission handling
- Barcode and QR decoding support
- Gallery image import and analysis
- Result screens with contextual actions for URLs, emails, Wi-Fi, phone numbers, and text
- Copy, share, open, and export actions

### QR creation

- Generate QR codes for URL, plain text, Wi‑Fi, contact, email, SMS, phone, and geolocation payloads
- Live preview with custom colors and error-correction settings
- Export as PNG and share via native sharing sheets
- Save generated QR records into app history

### Local data management

- Persistent history and favorites
- Search and filter by content type or favorites
- Guest-mode support without internet access
- Local session restoration on app reopen

### Authentication and sync

- Firebase email/password flow
- Guest-to-account migration support
- Firestore sync for user data
- Secure service layer separation from UI

### AI-ready experience

- AI scan analysis screen
- AI-assisted QR creation helpers
- Smart content explanation and risk hints

## Tech stack

| Layer | Stack |
| --- | --- |
| App framework | Expo SDK 57, React Native 0.86 |
| UI | React Native, NativeWind, Expo Router |
| State | Redux Toolkit, Redux Persist |
| Storage | AsyncStorage, Expo SecureStore |
| QR engine | react-native-qrcode-svg, expo-camera |
| Media | expo-image-picker, expo-media-library, expo-sharing |
| Backend | Firebase Auth, Firestore, Cloud Functions |
| AI | Gemini via Cloud Functions |
| Dev tooling | TypeScript, ESLint, Jest |

## Project structure

```text
qr-app/
├─ src/
│  ├─ app/                  # Expo Router screens and layouts
│  │  ├─ (auth)/            # Auth flows
│  │  ├─ (tabs)/            # Main tab navigation
│  │  ├─ account/           # Profile and account screens
│  │  ├─ ai/                # AI analysis screens
│  │  ├─ create/            # QR creation workflows
│  │  ├─ creation/          # Creation detail views
│  │  ├─ scan-result/       # Scan result details
│  │  ├─ _layout.tsx        # Root layout
│  │  ├─ index.tsx          # App entry
│  │  ├─ onboarding.tsx     # First-launch onboarding
│  │  ├─ welcome.tsx        # Welcome screen
│  │  └─ +not-found.tsx     # Custom 404 route
│  ├─ components/           # Reusable UI components
│  ├─ features/             # Feature domains
│  ├─ hooks/                # Hooks
│  ├─ services/             # Firebase, AI, auth, Cloudinary, QR logic
│  ├─ store/                # Redux store and slices
│  ├─ utils/                # Shared helpers
│  └─ project.md            # Development roadmap and implementation notes
├─ functions/               # Firebase Cloud Functions
├─ app.config.ts            # Expo app configuration
├─ app.json                 # Expo metadata
├─ babel.config.js          # Babel config
├─ tailwind.config.js       # NativeWind Tailwind config
├─ package.json             # Dependencies and scripts
├─ firebase.json            # Firebase config
├─ eas.json                 # EAS build configuration
├─ global.css               # Global styles
├─ README.md                # Project documentation
├─ LICENSE                  # License
└─ assets/                  # App assets and branding
```

## Getting started

### Prerequisites

- Node.js 18+
- Expo CLI / Expo Go ready environment
- iOS Simulator or Android Emulator, or a physical device
- Optional: Firebase project configuration for cloud features

### Install dependencies

```bash
npm install
```

### Start the app

```bash
npx expo start
```

Then choose one of the following:

- Android emulator
- iOS simulator
- Expo Go
- development build

### Useful scripts

```bash
npx expo start
npx expo lint
npx tsc --noEmit
npx expo-doctor
npx expo install --fix
```

## Mobile-first development notes

This project follows Expo mobile-first patterns:

- responsive containers and touch-friendly controls
- bottom-tab navigation for native app feel
- safe-area and keyboard-aware layouts
- offline-safe flows for guest users
- native permission handling for camera and media access

## Environment and configuration

The app is configured in `app.config.ts` and includes Firebase and camera permissions for mobile app usage.

Common setup steps:

1. Configure Firebase credentials for Android/iOS.
2. Add Cloudinary env values for signed uploads if using cloud image storage.
3. Set up Gemini or Cloud Function endpoints for AI-powered features.

## App flow

```text
App launch
  -> onboarding (first-time users)
  -> welcome
  -> sign in / guest access
  -> home dashboard
  -> scan / create / history / settings
```

## Current implementation status

### Completed

- [x] App entry and onboarding flow
- [x] Guest session restoration and offline-first access
- [x] Main 3-tab home navigation
- [x] QR scanning and barcode detection
- [x] QR generation and export
- [x] Local history, favorites, and search
- [x] Firebase-auth-ready architecture
- [x] Migration and sync preparation
- [x] AI feature screens and service hooks

### Planned / extension work

- [ ] production Firebase configuration and security hardening
- [ ] Cloudinary signed upload pipeline
- [ ] AI backend validation and quotas
- [ ] release build and app-store preparation

## Contributing

1. Create a feature branch.
2. Keep service logic inside `src/services/`.
3. Prefer Expo-recommended APIs and mobile-safe patterns.
4. Validate with TypeScript and lint before finalizing changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Resources

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router docs](https://docs.expo.dev/router/introduction)
- [React Native docs](https://reactnative.dev/)
- [Firebase for React Native](https://firebase.google.com/docs)

---

Built for fast, secure, mobile-first QR workflows.
