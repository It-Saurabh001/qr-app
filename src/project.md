# QR Studio — Architecture, Features & Milestone Roadmap

**Project:** QR Studio  
**Platform:** React Native + Expo (SDK 57) + TypeScript  
**Routing:** Expo Router (File-based navigation)  
**Styling:** NativeWind (Tailwind CSS v4)  
**State Architecture:** Redux Toolkit + Redux Persist  
**Local Guest Engine:** Expo SecureStore + AsyncStorage  
**Cloud Authentication:** React Native Firebase Auth (Email/Password + Google Sign-In)  
**Cloud Database:** Cloud Firestore (User-isolated namespaces)  
**Serverless Signature Gateway:** Cloudflare Worker (`/api/cloudinary/sign`)  
**CDN Image Storage:** Cloudinary (Signed PNG format QR codes & direct image uploads)  
**AI Intelligence:** Gemini-ready security scoring and smart prompt creator  

---

## 1. Architectural Model & How It Works

QR Studio is built on an **offline-first, zero-trust cloud architecture**. It bridges offline convenience with enterprise-grade cloud synchronization:

### 1. Offline-First Guest Engine
- **No Mandatory Login:** Users can immediately launch and operate the application as a Guest without network connectivity or account creation.
- **Hardware-Backed Session Storage:** The guest session marker is stored in device hardware keystores using `expo-secure-store`.
- **Local Data Persistence:** All generated and scanned QR records, favorites, and user preferences are saved locally in Redux and synchronized with `AsyncStorage`.
- **Offline Parity:** Camera scanning, barcode decoding, multi-format QR generation, SVG/PNG rendering, and history filtering function 100% offline.

### 2. Dual Authentication & Identity Flow
- **Firebase Native Auth:** Supports email/password authentication and native Google Sign-In (`@react-native-google-signin/google-signin`).
- **Session Decoupling:** Authentication state operates independently from local guest sessions, preventing auth listeners from prematurely ejecting offline guests.
- **Data Protection Guarantee:** Local guest records are never wiped or overwritten when authenticating. Users are guided through a migration flow to safely upload offline history into their cloud profile.

### 3. Serverless Cloudflare Worker Gateway
- **Zero Client Secrets:** The mobile application contains no Cloudinary API secrets or backend administrative credentials.
- **ID Token Verification:** When an authenticated user triggers a cloud upload, the app sends their Firebase ID token (`Authorization: Bearer <token>`) to the Cloudflare Worker endpoint (`/api/cloudinary/sign`).
- **Cryptographic Signature Generation:** The Worker validates the token against Google's public keys, enforces user folder scoping (`qr-app/${user.uid}/`), and generates a timestamped SHA signature for direct client-to-Cloudinary upload.
- **Unauthorized Request Rejection:** Unauthenticated or expired requests are rejected with status 401, preventing unauthorized storage consumption.

### 4. Cloudinary Signed Upload Pipeline
- **High-Definition PNG Capture:** For QR creations and scanned codes, the app renders a high-definition snapshot using an offscreen canvas (`react-native-view-shot` + `react-native-qrcode-svg`) and captures it in PNG format.
- **Direct Image Uploads:** For codes scanned from gallery photos, the original source image is uploaded directly to Cloudinary.
- **Direct Signed Multipart Upload:** The client uploads the asset directly to Cloudinary's upload API using multipart FormData signed by the Worker.
- **Global CDN Delivery:** Returns secure HTTPS URLs (`secure_url`) and unique public IDs for global delivery.

### 5. Cloud Firestore Database Synchronization
- **Metadata-Only Cloud Storage:** The user's cloud document store (`users/{uid}/history/{itemId}`) stores only lightweight JSON metadata and Cloudinary CDN links (`cloudUrl`, `publicId`, `cloudAssetId`, `title`, `content`, `format`, `createdAt`).
- **Zero Heavy Payload in Database:** Raw binary files or large base64 strings are **never** stored in Firestore, keeping database reads/writes lightning-fast, highly cost-effective, and within strict quota limits.
- **Bidirectional Merge:** When syncing, local history and remote Firestore collections merge seamlessly using deterministic IDs and timestamps, preventing duplicate entries.

---

## 2. Core Features Breakdown

### 📷 Scanning Engine
- **Live Viewfinder:** `expo-camera` with a smooth, continuous scanning reticle and torch control.
- **Format Decoding:** Supports QR codes and 11 barcode formats (EAN-13, EAN-8, Code 128, UPC-A, UPC-E, PDF417, Aztec, DataMatrix, Code 39, Code 93, Codabar).
- **Gallery Import:** Scan barcodes and QR codes from photos and screenshots in the device media library via `expo-image-picker`.
- **Instant Actions:** Context-aware actions for detected URLs (browser opening), Wi-Fi (SSID parsing & password copy), phone dialers, SMS, and geolocation.
- **Automatic Cloud Backup:** For logged-in users, scanned codes and gallery images automatically back up to Cloudinary and sync their CDN link to Firestore.

### 🎨 Creation Studio
- **8 Payload Templates:** Web URL, Plain Text, Wi-Fi Network, Contact (vCard), Email, Phone Number, SMS, and Geolocation.
- **Styling Controls:** Foreground color picker, background color picker, and 4 Error Correction Levels (L, M, Q, H).
- **Export & Share:** Export clean PNG images to device storage or share via the native sharing sheet.
- **Creation Details Screen:** Dedicated detail screen (`/creation/[id]`) showing the high-resolution QR, Cloudinary CDN link card (with copy & browser buttons), re-upload trigger, and deletion with cloud record cleanup.

### 📂 History, Search & Favorites
- **Offline Persistence:** All scans and creations are recorded locally with ISO timestamps.
- **Favorites Organization:** Bookmark critical codes for instant access.
- **Real-Time Filtering & Search:** Filter by type (`All`, `Scanned`, `Created`, `Favorites`) and search query.
- **Cloud Indicators:** Visual status badges distinguish items hosted on Cloudinary and synced with Firestore.
- **Bulk Operations:** Clear all records with confirmation guards and cloud cleanup.

### 👤 Account, Sync & Lifecycle Management
- **Unified Cloud Sync:** Single "Sync Cloud Data Now" action in Account Profile (`/account/profile`) with clean step-by-step progress logging.
- **Offscreen PNG Rendering:** Automatically catches any historical records missing Cloudinary CDN links, renders their PNG QR codes offscreen, uploads them to Cloudinary, and saves CDN links to Firestore.
- **Data Migration:** Dedicated migration flow (`/migrate`) transferring guest offline history into a new user account.
- **Account Deletion Lifecycle:** Complete self-service account deletion (`deleteUserAccount`) that deletes user records and signs out safely.

### 🤖 AI-Ready Intelligence Layer
- **Smart AI Creator:** Natural language prompt processing (`/create/smart`) that understands intents (e.g. *"Create a Wi-Fi QR for guest network with password xyz"*) and auto-populates generator fields.
- **AI Scan Analysis:** Security risk detection screen (`/ai/analyze`) evaluating phishing indicators, URL safety scores, and plain-English summaries.

---

## 3. Work Done Till Yet (Completed Milestones)

### STAGE 0 — Project Audit & Architecture Setup
- [x] Audited existing dependencies, routes, and services.
- [x] Configured TypeScript strict typing, NativeWind v4 styling, and Expo SDK 57 compatibility.
- [x] Established service layer boundaries (UI components never call Firebase or external APIs directly).

### STAGE 1 — App Entry, Onboarding & Welcome Experience
- [x] First-launch onboarding slides with completion persistence via AsyncStorage.
- [x] Welcome screen with "Get Started" and "Continue as Guest" entry points.
- [x] Returning user routing preventing repeated onboarding screens.

### STAGE 2 — Authentication Screens UI
- [x] Sign In screen with email/password and Google Sign-In button.
- [x] Create Account screen with client-side form validation.
- [x] Password Reset screen with error handling and keyboard-aware scroll views.

### STAGE 3 — Offline Guest Session Management
- [x] Implemented hardware-backed guest session marker in `src/services/auth/localGuestSession.ts` using `expo-secure-store`.
- [x] Built session restoration on app launch in `src/app/index.tsx`.
- [x] Protected routes differentiating between Guest, Authenticated, and Logged-Out states.

### STAGE 4 — Main Navigation & Dashboard
- [x] Implemented bottom tab navigation (`Scan`, `Create`, `History`) using Expo Router.
- [x] Built responsive headers, status bar theming, and dark mode support.
- [x] Added quick action cards and smooth tab switching animations.

### STAGE 5 — QR Scanner & Gallery Import
- [x] Integrated `expo-camera` with live camera view, torch toggle, and smooth laser line animation.
- [x] Implemented gallery photo barcode scanning with `expo-image-picker` and `Camera.scanFromURLAsync`.
- [x] Built result cards with contextual actions (Open URL, Call, Copy, Share, Wi-Fi password copy).
- [x] Added haptic feedback on detection and auto-save preference toggles.

### STAGE 6 — QR Creator Studio & Export
- [x] Built 8 format payload generators (URL, Text, Wi-Fi, Contact, Email, Phone, SMS, Location).
- [x] Integrated `react-native-qrcode-svg` with live visual preview.
- [x] Added custom foreground/background color selection and error correction levels.
- [x] Implemented high-resolution PNG export using `react-native-view-shot` and native sharing.

### STAGE 7 — Local History, Search & Favorites
- [x] Configured Redux Toolkit normalized entity adapter (`historySlice.ts`) for $O(1)$ updates.
- [x] Built real-time text search and type filtering (`All`, `Scanned`, `Created`, `Favorites`).
- [x] Added favorite toggle actions and persistent local storage.
- [x] Implemented cloud sync indicator badges on history cards.

### STAGE 8 — Firebase Authentication Integration
- [x] Implemented native Firebase Auth service (`authService.ts`) for email/password and Google Sign-In.
- [x] Added token retrieval helper (`getIdToken()`) with force-refresh options.
- [x] Integrated centralized auth listeners updating Redux auth slice without disturbing guest state.

### STAGE 9 — Guest Data Migration & Firestore Sync
- [x] Created dedicated migration screen (`/migrate`) for transferring local offline history into Firestore.
- [x] Built batch Firestore sync service (`historyService.ts` -> `syncGuestHistoryToCloud`) with chunked batching.
- [x] Enforced user-isolated Firestore namespaces (`users/{uid}/history/{itemId}`).
- [x] Added deterministic ID handling to prevent duplicate records during retries.

### STAGE 10 — Cloudflare Worker & Cloudinary Signed Uploads
- [x] Configured serverless Cloudflare Worker `/api/cloudinary/sign` endpoint validating Firebase ID tokens.
- [x] Enforced user folder scoping on the Worker (`qr-app/${user.uid}/`) with zero client-side secrets.
- [x] Built signed multipart upload service (`uploadService.ts` -> `uploadQrToCloudinary`).
- [x] Created Creation Studio detail screen (`/creation/[id]`) displaying high-res QR, Cloudinary CDN link card, copy/open buttons, and re-upload trigger.
- [x] Implemented cloud deletion cleanup (deleting local items removes them from Firestore).

### STAGE 11 — AI-Ready Feature Screens
- [x] Built Smart AI Creator screen (`/create/smart`) with natural language prompt parsing.
- [x] Built AI Scan Analysis screen (`/ai/analyze`) with security risk scoring and plain-English code explanation.
- [x] Established client AI service layer (`aiService.ts`) ready for backend Gemini endpoints.

### STAGE 12 — Account & Settings Management Hub
- [x] Enhanced Settings screen (`/settings`) with deep links to Profile, Migration, and Smart Creator.
- [x] Built Account & Cloud Settings screen (`/account/profile`) with user info, cloud indicators, and UID copying.
- [x] Implemented self-service account deletion (`deleteUserAccount`) in `accountService.ts`.
- [x] Built 404 fallback route (`+not-found.tsx`) for unmatched URLs.

### STAGE 13 — Security Hardening, Offscreen PNG Rendering & CDN Link Fix
- [x] Fixed Firestore document issue where scanned codes lacked `cloudUrl`:
  - Updated sync loop to process all items missing CDN links (creations and scans).
  - Added offscreen canvas with `QRCode` and `captureRef` to generate PNG format QR snapshots for scanned codes.
  - Added direct image upload for gallery scans.
  - Ensured only Cloudinary CDN URLs (`cloudUrl`) and metadata are stored in Firestore—never raw base64 or heavy image bytes.
- [x] Added standardized one-liner console logging throughout all async pipelines for clear tracing.
- [x] Hardened `.gitignore` to protect environment files, Wrangler dev secrets, Firebase credentials, and IDE files.
- [x] Passed TypeScript typecheck (`npx tsc --noEmit`) and ESLint (`npm run lint`) with zero errors.

---

## 4. Security Rules & Development Standards

1. **Zero Client Secrets:** The mobile client never receives or stores Cloudinary API secrets or Firebase Admin keys.
2. **User-Isolated Storage:** All Cloudinary assets are scoped to `qr-app/${user.uid}/`, and all Firestore documents are scoped to `users/{uid}/history/{itemId}`.
3. **Database Payload Discipline:** Firestore documents store only lightweight JSON metadata and HTTPS CDN links. Raw image binaries and base64 strings are strictly forbidden from database storage.
4. **Offline First:** Every core utility (scanning, decoding, generation, export, local history) must remain fully operational without network access.
5. **Separation of Concerns:** UI components must never call Firebase or external HTTP endpoints directly; all operations are routed through `src/services/`.
6. **Codebase Health:** Every change must validate with `npx tsc --noEmit` and `npm run lint`.

---

## 5. Upcoming Roadmap (Next Steps)

- **STAGE 14: Release Engineering & Production Deployment**
  - EAS Build configuration for Android (`.aab`) and iOS (`.ipa`).
  - Production Firebase App Check integration to safeguard Cloud Functions and backend resources.
  - Final end-to-end device testing across Android and iOS release builds.
