# QR Studio

<p align="center">
  <img src="https://img.shields.io/badge/Expo-~57.0.30-000020?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?logo=react&logoColor=white" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-~6.0.3-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/State-Redux%20Toolkit-764ABC?logo=redux&logoColor=white" alt="Redux Toolkit" />
  <img src="https://img.shields.io/badge/Style-NativeWind-5B21B6?logo=tailwindcss&logoColor=white" alt="NativeWind" />
  <img src="https://img.shields.io/badge/Cloud-Firebase%20%7C%20Cloudinary%20%7C%20Cloudflare-FFCA28?logo=firebase&logoColor=black" alt="Cloud Stack" />
</p>

QR Studio is a production-grade, mobile-first QR and barcode management ecosystem engineered with React Native, Expo, and TypeScript. It combines high-speed offline utility with a robust, zero-trust cloud architecture that integrates Firebase Authentication, Cloud Firestore, Cloudflare Workers, and Cloudinary CDN storage.

---

## How It Works

QR Studio is architected around an **offline-first, zero-trust cloud model**. Users can launch, scan, create, and organize codes completely offline, and later connect an online account to back up and host their codes securely in the cloud.

### 1. Offline-First Guest Architecture
- **Instant Entry Without Friction:** Users can jump straight into the application as a Guest without needing an internet connection or an online account.
- **Secure Local State:** Guest session status is persisted in hardware-backed storage (`Expo SecureStore`), while local QR history, favorites, and user preferences are maintained via Redux Toolkit and AsyncStorage.
- **Offline Reliability:** Camera scanning, barcode decoding, QR image generation, color customization, and history management work 100% offline.

### 2. Authentication & Identity Pipeline
- **Firebase Authentication:** Supports both native Email/Password credentials and Google Sign-In (`@react-native-google-signin/google-signin`).
- **Session Lifecycle:** Tracks auth state seamlessly without conflicting with offline guest sessions.
- **Zero Account Data Overwrite:** When an offline guest signs in or creates an account, the app automatically offers an intelligent migration flow (`/migrate`) to transfer offline history into their personal cloud account.

### 3. Serverless Cloudflare Worker Gateway
- **Zero Client Secrets:** The mobile application **never** stores or ships Cloudinary API secrets.
- **Token Verification:** When an online user initiates an asset backup, the app sends their Firebase ID token (`Authorization: Bearer <token>`) to a secured Cloudflare Worker endpoint (`/api/cloudinary/sign`).
- **Cryptographic Signature Generation:** The Worker validates the token with Google Firebase public keys, enforces user-isolated folder scoping (`qr-app/${user.uid}/`), and returns a timestamped cryptographic signature and API key for client-side signed upload.

### 4. Cloudinary Signed CDN Storage
- **High-Resolution PNG QR Upload:** For created QR codes or scanned barcodes, the app renders a high-definition snapshot in PNG format using offscreen canvas capture (`react-native-view-shot` + `react-native-qrcode-svg`) and sends it directly to Cloudinary using signed multipart FormData.
- **Direct Image Upload:** For gallery photo scans, the source image is uploaded directly to Cloudinary.
- **Global CDN Delivery:** Returns secure, optimized HTTPS CDN links (`secure_url`) and public IDs for ultra-fast asset delivery.

### 5. Cloud Firestore Database Synchronization
- **Metadata-Only Cloud Storage:** The user's cloud document store (`users/{uid}/history/{itemId}`) stores only lightweight JSON metadata and Cloudinary CDN URLs (`cloudUrl`, `publicId`, `cloudAssetId`, `title`, `content`, `format`, `createdAt`).
- **Zero Heavy Payload in Database:** Raw binary files or large base64 strings are **never** stored in Firestore, keeping database reads/writes lightning-fast, highly cost-effective, and within strict quota limits.
- **Bidirectional Merge:** When syncing, local history and remote Firestore collections merge seamlessly using deterministic IDs and timestamps, preventing duplicate entries.

---

## Key Features

### 📷 High-Performance QR & Barcode Scanner
- **Live Camera Feed:** Powered by `expo-camera` with a smooth, pulsing laser reticle animation.
- **Comprehensive Format Support:** Scans QR codes and common 1D/2D barcodes (EAN-13, EAN-8, Code 128, UPC-A, UPC-E, PDF417, Aztec, DataMatrix, Code 39, Code 93, Codabar).
- **Gallery Photo Import:** Scan codes directly from photos and screenshots stored in the device media library.
- **Contextual Instant Actions:**
  - **URLs:** In-app browser launching with SSL verification.
  - **Wi-Fi Networks:** SSID parsing, network security type detection, and one-tap password copying.
  - **Contacts & VCards:** Direct dialing, email composition, and address resolution.
  - **SMS & Geolocation:** Native phone dialer and map application triggers.
- **User Feedback:** Haptic feedback on detection and torch toggle for low-light environments.
- **Automatic Cloud Hosting:** When online, scanned codes automatically generate a Cloudinary PNG asset and sync their CDN link to Firestore.

### 🎨 Creative QR Generator Studio
- **8 Distinct Payload Templates:**
  - **Website URL:** Web address with auto-formatting.
  - **Plain Text:** Multiline raw text and notes.
  - **Wi-Fi Network:** Network SSID, password, and encryption type (WPA/WPA2/WEP/None).
  - **Contact (vCard):** First name, last name, phone, email, organization.
  - **Email:** Recipient address, subject line, and pre-filled body text.
  - **Phone Number:** International phone format support.
  - **SMS:** Recipient phone number and message payload.
  - **Location:** Geographic coordinates (Latitude and Longitude).
- **Real-Time Visual Customization:** Custom foreground color, background color, and adjustable Error Correction Levels (L: 7%, M: 15%, Q: 25%, H: 30%).
- **Export & Share:** Export clean PNG images directly to the device or share via native system sheets.
- **Instant Cloud Backup:** Auto-uploads generated PNGs to Cloudinary CDN and synchronizes metadata with Firestore.

### 🔍 Creation Studio Detail Screen
- **Full Asset Overview:** Dedicated inspection screen (`/creation/[id]`) for every created code.
- **Cloudinary CDN Card:** Displays live hosting status, the HTTPS CDN URL, one-tap "Copy CDN Link", and "Open in Browser" action buttons.
- **One-Tap Re-Upload:** Re-syncs or updates cloud assets if offline creation occurred previously.
- **Full Deletion Cleanup:** Deleting a code removes it from local Redux state and permanently cleans up the cloud Firestore document.

### 📂 History, Search & Favorites
- **Offline Persistence:** All scans and creations are recorded locally with ISO timestamps.
- **Favorites Organization:** Bookmark critical codes for instant access.
- **Real-Time Filtering & Search:** Filter by type (`All`, `Scanned`, `Created`, `Favorites`) and search query.
- **Cloud Indicators:** Visual status badges distinguish items hosted on Cloudinary and synced with Firestore.
- **Bulk Operations:** Clear all records with confirmation guards and cloud cleanup.

### 👤 Account & Cloud Management
- **Unified Cloud Sync:** Single "Sync Cloud Data Now" action in Account Profile (`/account/profile`) with clean step-by-step progress logging.
- **Offscreen PNG Rendering:** Automatically catches any historical records missing Cloudinary CDN links, renders their PNG QR codes offscreen, uploads them to Cloudinary, and saves CDN links to Firestore.
- **Data Migration:** Dedicated migration flow (`/migrate`) transferring guest offline history into a new user account.
- **Account Deletion Lifecycle:** Complete self-service account deletion (`deleteUserAccount`) that deletes user records and signs out safely.

### 🤖 AI-Ready Intelligence Layer
- **Smart AI Creator:** Natural language prompt processing (`/create/smart`) that understands intents (e.g. *"Create a Wi-Fi QR for guest network with password xyz"*) and auto-populates generator fields.
- **AI Scan Analysis:** Security risk detection screen (`/ai/analyze`) evaluating phishing indicators, URL safety scores, and plain-English summaries.

---

## What We Have Done Yet (Milestone Summary)

| Stage / Milestone | Status | Details & Deliverables |
| :--- | :---: | :--- |
| **Stage 0: Audit & Architecture** | ✅ Completed | Audited existing codebase, established TypeScript types, verified package compatibility with Expo SDK 57 and React Native 0.86. |
| **Stage 1: App Entry & Onboarding** | ✅ Completed | First-launch onboarding slides with completion persistence, Welcome screen, and seamless "Get Started" routing. |
| **Stage 2: Authentication Screens UI** | ✅ Completed | Built responsive Sign In, Create Account, and Forgot Password screens with form validation and offline guest entry. |
| **Stage 3: Offline Guest Session** | ✅ Completed | Hardware-backed guest session marker using `expo-secure-store`, session restoration on app relaunch, and offline route protection. |
| **Stage 4: Home Dashboard & Tabs** | ✅ Completed | Mobile-first 3-tab layout (`Scan`, `Create`, `History`), responsive headers, status bar adaptation, and quick action cards. |
| **Stage 5: Camera Scanner & Gallery** | ✅ Completed | Live camera scanning with smooth reticle, torch toggle, gallery photo decoding via `expo-image-picker`, and contextual action handlers. |
| **Stage 6: QR Generator Studio** | ✅ Completed | 8 payload builders, live SVG preview, foreground/background color pickers, error correction levels, and PNG export. |
| **Stage 7: History & Favorites** | ✅ Completed | Redux Toolkit entity adapter, persistent local storage, search, filter chips, favorites toggle, and cloud sync badges. |
| **Stage 8: Firebase Authentication** | ✅ Completed | Integrated Firebase Auth for Email/Password and Google Sign-In, token retrieval, and centralized auth services. |
| **Stage 9: Guest Data Migration** | ✅ Completed | Built `/migrate` screen, batch Firestore migration service, duplicate prevention, and post-auth redirect triggers. |
| **Stage 10: Cloudflare Worker & Cloudinary** | ✅ Completed | Built Worker token verification (`/api/cloudinary/sign`), client upload service, signed PNG upload, and Creation Studio (`/creation/[id]`). |
| **Stage 11: AI Integration Foundation** | ✅ Completed | Smart Creator UI (`/create/smart`), Scan Analysis UI (`/ai/analyze`), and modular AI service layer ready for server-side Gemini endpoints. |
| **Stage 12: Account & Settings Hub** | ✅ Completed | Enhanced Settings (`/settings`), Account Profile (`/account/profile`), account deletion service, and unified cloud sync. |
| **Stage 13: Firestore CDN Link Fix & Security** | ✅ Completed | Fixed Firestore documents missing `cloudUrl`, added offscreen PNG generation for all un-synced items, and hardened `.gitignore`. |

---

## Security Model & Zero-Trust Guarantees

- **No Exposed Secrets:** Neither Cloudinary API secrets nor Firebase Admin credentials exist in the client mobile bundle.
- **Per-User Folder Isolation:** Upload signatures from the Cloudflare Worker are strictly constrained to the requesting user's folder (`qr-app/${user.uid}/`).
- **Database Sanitization:** Firestore rules and client sanitizers ensure that only authorized users can read/write their own path (`users/{uid}/history/{itemId}`).
- **Zero Raw File Storage in Database:** The database stores strictly lightweight HTTPS URLs pointing to Cloudinary CDN, never raw file blobs or base64 data.
- **Safe Guest Isolation:** Guest mode runs strictly on device storage. No guest telemetry or scan data is transmitted to external servers without user sign-in and explicit consent.

---

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI / Expo Go environment
- Physical Android/iOS device or emulator

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript typecheck
npx tsc --noEmit

# 3. Run ESLint
npm run lint

# 4. Start the Expo development server
npx expo start
```

---

## License

This project is licensed under the MIT License. Built for fast, secure, mobile-first QR workflows.
