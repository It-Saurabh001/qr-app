# QR Studio — Development Roadmap

**Project:** QR Studio  
**Platform:** React Native + Expo + TypeScript  
**Navigation:** Expo Router  
**Styling:** NativeWind v4  
**State Management:** Redux Toolkit  
**Local Guest Session:** Expo SecureStore  
**Local Preferences:** AsyncStorage / Redux Persist, as appropriate  
**Backend:** React Native Firebase  
**Database:** Cloud Firestore  
**QR Image Storage:** Cloudinary through signed Cloud Functions  
**AI:** Gemini through Cloud Functions

---

## 1. Project Rules

1. Inspect existing files before modifying them.
2. Reuse existing screens, routes, components, and configuration wherever possible.
3. Do not create duplicate screens or parallel navigation systems.
4. Complete and test each stage before moving to the next.
5. Keep Firebase SDK calls inside `src/services/`.
6. Guest mode must work without an internet connection.
7. Never treat a guest session as an authenticated Firebase user.
8. Preserve local data until a migration or upload is confirmed successful.
9. Run TypeScript checks and test affected navigation after each stage.
10. Do not implement all features in one large change.

## 2. Overall Development Flow

```text
STAGE 0 — Audit Existing Project
        |
        v
STAGE 1 — App Entry + Onboarding + Welcome
        |
        v
STAGE 2 — Sign In / Sign Up UI
        |
        v
STAGE 3 — Offline Guest Session + Session Restoration
        |
        v
STAGE 4 — Home Screen + Main Navigation
        |
        v
STAGE 5 — QR Scanner + Result Screen
        |
        v
STAGE 6 — QR Creator + Preview + Export
        |
        v
STAGE 7 — Local History + Favorites + Search
        |
        v
STAGE 8 — Firebase Email Authentication
        |
        v
STAGE 9 — Guest Data Migration + Firestore Sync
        |
        v
STAGE 10 — Cloudinary Signed Uploads
        |
        v
STAGE 11 — AI Scan Analysis + Smart Create
        |
        v
STAGE 12 — Settings + Account Management
        |
        v
STAGE 13 — Testing + Security + Performance
        |
        v
STAGE 14 — Release Preparation
```

---

## STAGE 0 — Audit Existing Project

### Objective
Understand the existing structure before making changes.

### Tasks
- Inspect `package.json`, `app.json`, `app.config.ts`, `tsconfig.json` and navigation files.
- Inspect `app/`, `src/`, `assets/` and existing authentication logic.
- Identify existing routes, Redux store, slices, services and reusable UI components.
- Check whether onboarding, welcome, sign-in and sign-up screens already exist.
- Identify duplicate files, incorrect imports and conflicting redirect logic.
- Record installed package versions and existing TypeScript errors.

### Exit Criteria
- Existing architecture and route structure are understood.
- Required changes are listed.
- No files are deleted or rewritten without a clear reason.

---

## STAGE 1 — App Entry, Onboarding and Welcome

### Objective
Complete the first-launch user experience.

### User Flow

```text
App Launch
    |
    v
Check Onboarding Completion
    |
    +-- Not Completed --> Onboarding Slides
    |                         |
    |                         v
    |                       Welcome
    |
    +-- Completed ----------> Welcome
                              |
                              v
                         Get Started
                              |
                              v
                         Sign In Screen
```

### Tasks
- Verify `app/index.tsx` and onboarding-completion logic.
- Finish the existing `app/onboarding.tsx`.
- Persist onboarding completion so slides do not appear on every launch.
- Update the existing `app/welcome.tsx`.
- Keep Welcome's primary action as **Get Started**.
- Route Get Started to `/(auth)/sign-in`.
- Verify Skip and Get Started navigation.
- Check that app restart does not unnecessarily repeat onboarding.

### Exit Criteria
- First launch displays onboarding.
- Completing or skipping onboarding leads to Welcome.
- Returning users do not see onboarding again.
- No redirect loop or missing-route error occurs.

---

## STAGE 2 — Authentication Screens UI

### Objective
Build the authentication experience before connecting real authentication.

### Required Screens
- Sign In
- Create Account
- Forgot Password

### Sign In Screen Actions
- Sign In
- Create Account
- Continue as Guest
- Forgot Password

### Tasks
- Reuse `app/(auth)/sign-in.tsx` if it already exists.
- Create or update sign-up and password-reset screens only as needed.
- Add form validation and loading/error states.
- Verify back navigation and keyboard behavior.
- Keep authentication service logic separate from UI components.
- Do not make the guest button dependent on Firebase.

### Exit Criteria
- All authentication screens open correctly.
- Form validation works.
- Navigation works without Firebase credentials or a network connection.
- Guest entry remains available.

---

## STAGE 3 — Offline Guest Session

### Objective
Allow users to enter and reopen the app without an account or internet connection.

### Storage
Use `expo-secure-store` for the local guest-session marker.

Use local application storage for guest-created QR records and scan history. Keep the guest session marker separate from history data.

### Tasks
- Create `src/services/auth/localGuestSession.ts`.
- Implement starting, checking and clearing a local guest session.
- Restore the session when the app starts.
- Connect Continue as Guest to local session creation.
- Route a restored guest directly to the main app.
- Update protected-route logic to distinguish guest, authenticated, and logged-out states.
- Ensure Firebase auth listeners cannot redirect a valid local guest to Welcome.
- Add a logout/exit path that clears the guest marker without accidentally deleting guest history.

### Session States

```text
                 App Starts
                     |
                     v
               Restore Session
                     |
          +----------+----------+
          |          |          |
          v          v          v
     Auth User    Guest      No Session
          |          |          |
          v          v          v
         Home       Home    Welcome / Sign In
```

### Exit Criteria
- Guest mode works with the internet disabled.
- Closing and reopening the app restores the guest session.
- No Firebase anonymous sign-in occurs.
- Guest history survives normal app restarts.
- Firebase auth-state changes do not incorrectly log out a guest.

---

## STAGE 4 — Home Screen and Main Navigation (Completed & Verified)

### Objective
Build the primary app shell with a modern 3-tab layout and responsive constraints across Android and iOS devices (smartphones, foldables, and tablets).

### Main Navigation (3 Bottom Tabs)
1. **Home Tab** (`/(tabs)/index`):
   - Offline Guest status indicator and personalized greeting.
   - Live guest metrics bar (Scanned, Created, Favorites count from Redux history).
   - Quick Actions grid (Scan QR, Create QR, History, Preferences).
   - Recent Activity feed (latest items with format badges, copy, and favorite state).
2. **Scan QR Tab** (`/(tabs)/scan`):
   - Center elevated circular floating button (`width: 64`, `height: 64`, `borderRadius: 32`, `top: -18`).
   - `#7C3AED` accent background with theme cutout border and white QR icon.
3. **Create QR Tab** (`/(tabs)/create`):
   - Direct access to the offline multi-format QR code generator.

### Hidden Subroutes in `(tabs)`
- **History Screen** (`/(tabs)/history`): Hidden from the bottom bar (`href: null`), accessible via Home Quick Actions and Recent Activity. Includes header back button (`router.back()`).
- **Settings / Preferences Screen** (`/(tabs)/settings`): Hidden from the bottom bar (`href: null`), accessible via Home header settings button. Includes header back button (`router.back()`).

### Responsive Layout Pattern
- All screens wrapped in responsive container `w-full max-w-2xl self-center` (and `max-w-md` for auth screens) to ensure optimal readability on tablets (iPad, Galaxy Tab) and phones.
- All scroll views specify `paddingBottom: 110` so elevated floating bottom bar never obstructs content.

### Exit Criteria
- [x] Exactly 3 primary bottom tabs visible (Home, Center Elevated Scan, Create QR).
- [x] History and Settings accessible as subroutes with back navigation.
- [x] Guest users can access all permitted local features without an internet connection.
- [x] Responsive layout verified across mobile, foldable, and tablet form factors.

---

## STAGE 5 — QR Scanner and Result Screen (Completed & Verified)

### Objective
Scan QR codes and common supported barcodes with live camera or gallery import, offering contextual actions and offline persistence.

### Tasks & Features
- Integrated `expo-camera` (`CameraView`) supporting 13 barcode types (`qr`, `ean13`, `code128`, `upc_a`, `datamatrix`, etc.).
- Camera permission flow with informative grant screen.
- Smooth native-driver animated scanning reticle with moving laser line (60 FPS).
- Torch toggle with active feedback state.
- Gallery scanning via `expo-image-picker` and `Camera.scanFromURLAsync`.
- Parsed payload classification and contextual actions:
  - **URL**: Safe "Open in Browser" (with external link confirmation alert), "Copy", "Share".
  - **Wi-Fi**: Parsed SSID and Password display, "Copy Password", "Share".
  - **Phone / Email / SMS / Geo**: Direct dialer, email composer, SMS, or map launcher.
  - **Plain Text / Codes**: One-tap copy to clipboard and native sharing.
- Auto-save preference respect: automatically records to Redux history, or allows manual saving when auto-save is disabled.
- Dedicated detail screen `src/app/scan-result/[id].tsx` connected to Redux history items.

### Exit Criteria
- [x] Live camera scanning works offline on Android and iOS devices.
- [x] Gallery image scanning decodes QR and barcodes reliably.
- [x] External links require user confirmation before opening.
- [x] Scans save to local history in guest mode.

---

## STAGE 6 — QR Creator and Export (Completed & Verified)

### Objective
Generate high quality QR codes locally with rich styles, error correction, and multiple export formats.

### Supported Offline QR Types (8 Formats)
- URL
- Plain text
- Wi-Fi (SSID, Password, Security type, Hidden network)
- Contact / vCard (Name, Phone, Email, Organization)
- Email (Recipient, Subject, Message body)
- SMS (Phone number, Message body)
- Phone (Dialer number)
- Geographic location (Latitude, Longitude)

### Customization & Export
- Live SVG preview using `react-native-qrcode-svg`.
- Custom foreground and background hex colors.
- Error Correction Level (ECL) selector: Low (7%), Medium (15%), Quartile (25%), High (30%).
- Save PNG to device photo library via `expo-media-library`.
- Native sharing via `expo-sharing`.
- One-tap "Save to History" action recording creation in local Redux/AsyncStorage.

### Exit Criteria
- [x] All 8 QR types generate valid, scannable QR payloads offline.
- [x] Live SVG preview updates reactively.
- [x] Error correction and custom colors function without errors.
- [x] PNG export and native share sheet work on physical devices.
- [x] Creations are preserved in local guest history.

---

## STAGE 7 — Local History, Favorites and Search (Completed & Verified)

### Objective
Provide full offline data persistence, organization, and search for guests without requiring an account or cloud backend.

### Features
- Redux Toolkit `createEntityAdapter` managing `historySlice` items (`id`, `content`, `format`, `type: 'scan' | 'create'`, `title`, `isFavorite`, `createdAt`).
- Persisted locally to AsyncStorage via `redux-persist` (`whitelist: ['settings', 'history']`).
- Search bar with live content/format/title filtering and clear button.
- Filter chips: All, Scanned, Created, Favorites.
- Star/favorite toggle with instant persistence.
- Delete individual items with destructive confirmation alert.
- "Clear All" history action with safety confirmation.
- One-tap copy to clipboard with haptic feedback.
- Back navigation button returning to Home screen.
- **QR Preview Box Modal**: Interactive pop-up dialog rendering the scannable SVG QR code with custom colors and error-correction levels, full scrollable input content box with one-tap copy, and direct export options ("Save PNG" to gallery and "Share QR").
- Tappable history cards with prominent "Tap to view QR" badges and dedicated "View QR" action buttons.

### Exit Criteria
- [x] Scans and creations persist across complete app restarts.
- [x] Search, filter, favorite, and delete operate 100% offline.
- [x] Tapping any history card or "View QR" button opens a visual QR modal showing the scannable code and input content.
- [x] Guest history remains isolated from authentication sessions until explicit migration.

---

## STAGE 8 — Firebase Email Authentication

### Objective
Connect real account creation and sign-in after the main local experience is stable.

### Tasks
- Verify the development build supports React Native Firebase.
- Configure Firebase Auth.
- Implement email/password sign-up and sign-in.
- Implement password reset and sign-out.
- Create a centralized auth service.
- Keep SDK calls inside `src/services/`.
- Update auth state without confusing guest sessions with Firebase users.
- Add loading, network-error and authentication-error handling.

### Exit Criteria
- Real users can create accounts and sign in.
- Password reset works.
- Authenticated sessions restore correctly.
- Guest mode still works independently and offline.

---

## STAGE 9 — Guest Data Migration and Firestore Sync

### Objective
Allow a guest to create an account without losing local history.

### Migration Flow

```text
Guest Uses App
      |
      v
Local History Accumulates
      |
      v
User Signs In / Creates Account
      |
      v
Read and Validate Local Records
      |
      v
Upload Records to User's Firestore Namespace
      |
      v
Verify Successful Writes
      |
      v
Mark Records as Synced
      |
      v
Keep Local Copy Until Safe to Clean Up
```

### Tasks & Deliverables
- [x] Guest Data Migration Screen: `src/app/migrate.tsx` for validating and uploading local offline history directly to Firestore.
- [x] Firestore Batch Sync Service: `src/services/firebase/historyService.ts` (`syncGuestHistoryToCloud`).
- [x] Post sign-in & sign-up migration redirect: automatic detection of local guest items directing to `/migrate`.
- Associate records with the correct account namespace (`users/{uid}/history`).
- Prevent duplicate uploads during retries with deterministic IDs.
- Keep local records until successful migration is confirmed.

### Exit Criteria
- [x] Guest records migrate to the correct account.
- [x] Local guest data is never destroyed on network error.
- [x] Users can skip migration and continue to app seamlessly.
- Repeated retries do not create duplicates.
- Failed uploads do not destroy local records.
- User A cannot access user B's data.
- History works offline and synchronizes after connectivity returns.

---

## STAGE 10 — Cloudinary Signed Uploads (Completed & Verified)

### Objective
Store generated QR PNG images in Cloudinary securely using server-signed upload parameters and sync metadata to Firestore.

### Current Status: Working & Fully Verified
- **Cloudflare Worker Signing**: Live `/api/cloudinary/sign` endpoint validates Firebase ID tokens (`Authorization: Bearer <token>`) and returns cryptographic signature, API key, timestamp, and folder. Rejects unauthenticated/invalid requests with 401.
- **User-Specific Isolation**: Enforces user folder scoping (`qr-app/${user.uid}`) on the worker. User A cannot write to User B's Cloudinary storage.
- **Direct Signed Upload**: High-resolution QR PNG images captured via `react-native-view-shot` (`data-uri` / `tmpfile`) are uploaded directly to Cloudinary's upload API using multipart form data.
- **Firestore Metadata Integration**: Cloudinary `secure_url`, `public_id`, `asset_id`, and `created_at` timestamp are persisted to `users/{uid}/history/{itemId}` in Firestore and synced with local Redux history.
- **Creation Studio UI**: `src/app/creation/[id].tsx` provides real-time upload progress, displays the Cloudinary CDN link card with "Copy CDN Link" and "Open in Browser", and provides re-upload capability.
- **Deletion & Cleanup Flow**: Deleting a creation cleans up the local Redux state and deletes the corresponding Firestore record from `users/{uid}/history/{id}`.
- **Zero Client Secrets**: Cloudinary API secret is kept exclusively on the Cloudflare Worker server; the React Native app never receives or stores the secret.
- **Guest Mode Preservation**: Offline guest mode remains 100% functional, local, and unaffected.

### Tasks & Deliverables Implemented
- [x] Worker Signing Integration: `src/services/api/workerAuthService.ts` (`getCloudinaryUploadSignature` & `CloudinarySignResponse`).
- [x] Signed Cloudinary Upload Service: `src/services/cloudinary/uploadService.ts` (`uploadQrToCloudinary` using live worker signature and `getIdToken()`).
- [x] QR Export Hook Enhancement: `src/features/creator/useQrExport.ts` (exports `captureQr` with `data-uri` option).
- [x] Redux Cloud Metadata Support: `src/store/slices/historySlice.ts` (`cloudUrl`, `publicId`, `cloudAssetId`, `cloudUploadedAt`, and `updateHistoryItem` action).
- [x] Firestore Sync & Cleanup Service: `src/services/firebase/historyService.ts` (`saveQrToCloudFirestore`, `updateQrCloudinaryMetadata`, `deleteQrFromCloudFirestore`).
- [x] Creation Detail Screen Integration: `src/app/creation/[id].tsx` (high-res capture, live upload, CDN link display, copy/open links, Firestore sync, delete cleanup).
- [x] History Screen Cloud Badges & Deletion: `src/app/(tabs)/history.tsx` (shows "Cloud" sync badge and cleans up cloud Firestore records on item delete or clear all).
- [x] Creator Screen Cloud Auto-Sync: `src/app/(tabs)/create.tsx` (auto-syncs created items to user's Firestore namespace when authenticated).

### What Remains
- STAGE 11: AI Analysis and Smart Create (server-side Gemini endpoints, App Check, quota protection).
- STAGE 12: Settings + Account Management (account deletion, storage analytics, remote config).
- STAGE 13 & 14: Automated end-to-end testing, bundle size optimization, release builds.

### Exit Criteria
- [x] Creation details screen displays high-res QR, styling parameters, and Cloudinary upload status.
- [x] Signed uploads work for authorized users with live Cloudflare Worker signature.
- [x] No Cloudinary API secret is shipped or exposed in the app.
- [x] Upload status is visible and recoverable with user-friendly error alerts.
- [x] Deleting a creation cleans up the Firestore record and local state.
- [x] Typecheck (`npx tsc --noEmit`) and lint (`npm run lint`) pass with 0 errors.

---

## STAGE 11 — AI Analysis and Smart Create

### Objective
Add optional AI features without compromising privacy or offline functionality.

### AI Features
- Explain a scanned code.
- Summarize its destination and content type.
- Provide risk hints.
- Convert a natural-language request into a QR payload.

### Tasks & Deliverables
- [x] Smart AI Creator Screen: `src/app/create/smart.tsx` with natural-language prompt parsing and pre-filled QR configurations.
- [x] AI Scan Analysis Screen: `src/app/ai/analyze.tsx` with security risk scoring (low/medium/high), phishing detection, and plain-English code explanation.
- [x] Client AI Service: `src/services/ai/aiService.ts` (`analyzeScanWithAi` & `smartCreateWithAi`).
- [x] Contextual Triggers: "Analyze with Gemini AI" on `scan-result/[id]` and "Smart AI Creator" banner on `(tabs)/create`.
- Implement `analyzeScan` and `smartCreate` Cloud Functions.
- Call Gemini only through the server.
- Require explicit user action before sending scanned content for analysis.
- Validate AI input and output.
- Add authentication, App Check and server-side quotas.
- Show progress, failure and retry states.
- Keep ordinary scanning and QR creation fully functional without AI.

### Exit Criteria
- [x] AI screens and services render responsive, elegant UI with clear online account gating.
- [x] AI failures do not block core offline QR features.
- AI features work through secured server endpoints.
- API keys remain server-side.
- Users control when scan content is submitted.

---

## STAGE 12 — Settings and Account Management

### Objective
Complete user preferences and account lifecycle management.

### Tasks & Deliverables
- [x] Online User Account Profile Screen: `src/app/account/profile.tsx` with cloud storage indicators, force sync trigger, UID copy, and permanent account deletion.
- [x] Account Deletion Service: `src/services/firebase/accountService.ts` (`deleteUserAccount`).
- [x] Enhanced Settings Screen: `src/app/(tabs)/settings.tsx` with deep-links to `/account/profile`, `/migrate`, and `/create/smart`.
- [x] 404 Route Screen: `src/app/+not-found.tsx` for missing deep-links with return home action.
- Implement system/light/dark theme.
- Add haptics, sound, auto-save and auto-open preferences.
- Persist settings locally and synchronize them when appropriate.
- Add account deletion through a secured Cloud Function.
- Delete associated Firestore and Cloudinary data as required.
- Add feature flags through Remote Config.
- Keep compiled defaults so basic functionality remains available offline.

### Exit Criteria
- [x] Preferences survive app restarts.
- [x] Theme changes apply consistently.
- [x] Account profile and deletion flows are accessible and confirmed.
- Remote configuration failures do not break the app.

---

## STAGE 13 — Testing, Security and Performance

### Objective
Verify that the complete app is stable, private and safe.

### Test Areas
- First launch and returning-user navigation.
- Guest session restoration.
- Offline scanning and QR creation.
- Local history persistence.
- Account sign-in, sign-out and password reset.
- Guest-to-account migration and retry behavior.
- Firestore access rules.
- Cloudinary upload and deletion.
- AI quotas, validation and privacy.
- Camera and gallery permissions.
- Light/dark mode and accessibility.
- Android and iOS builds, where supported.

### Exit Criteria
- TypeScript checks pass.
- No critical navigation or data-loss bugs remain.
- Security rules are tested.
- Offline behavior is verified on a physical device.
- Performance and crash reporting are reviewed.

---

## STAGE 14 — Release Preparation

### Objective
Prepare a production-ready release.

### Tasks
- Create preview and production build configurations.
- Verify environment variables and native Firebase configuration.
- Check release signing and app metadata.
- Configure analytics, Crashlytics and usage alerts.
- Configure App Check after validating legitimate traffic.
- Review billing alerts and Cloud Functions limits.
- Test a release build with internal testers.
- Prepare store screenshots, description and privacy disclosures.
- Document build, deployment and rollback procedures.

### Exit Criteria
- Release build installs and works correctly.
- No development secrets are exposed.
- Monitoring and billing alerts are configured.
- Critical user flows pass final testing.

---

## 3. Cross-Stage Rules

**Code structure:** UI components should not call Firebase or external APIs directly. Services handle data and SDK operations.

**State management:** Use typed Redux hooks, serializable state, normalized history where useful, and ISO date strings in Redux.

**Error handling:** Use a consistent `{ code, message }` error shape.

**Styling:** Use NativeWind classes and shared design tokens. Avoid scattered hard-coded colors.

**Privacy:** Never include scanned or created content in analytics events.

**Security:** Protect server-side operations with authentication, App Check, input validation and quotas as appropriate.

**Version control:** Commit after each completed stage and use tags such as `stage-3-complete`.

## 4. Immediate Next Steps

The current priority is **not** Firebase, Cloudinary or AI. First establish a reliable app entry and offline guest experience.

1. Audit the existing routes and authentication files.
2. Verify onboarding and Welcome navigation.
3. Finish the authentication screens.
4. Install `expo-secure-store` if it is not already installed.
5. Implement local guest-session creation and restoration.
6. Test guest access with the internet disabled and after restarting the app.
7. Only then proceed to the main navigation and QR features.

**Development rule:** Do not start the next stage until the current stage's exit criteria pass.
