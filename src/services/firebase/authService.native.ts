import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "@react-native-firebase/auth";

import { Platform } from "react-native";

import { verifyWithCloudflareWorker } from "@/services/api/workerAuthService";

const auth = getAuth();

/**
 * Lazily loads @react-native-google-signin/google-signin so that missing native
 * bindings in Expo Go or older dev-client binaries do not crash the app on startup.
 */
function getGoogleSignInModule() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("@react-native-google-signin/google-signin");
    return mod?.GoogleSignin ? mod : null;
  } catch {
    return null;
  }
}

let isGoogleConfigured = false;
export function configureGoogleSignIn() {
  if (isGoogleConfigured) return;
  const mod = getGoogleSignInModule();
  if (!mod?.GoogleSignin) {
    console.warn("[GoogleAuth] @react-native-google-signin/google-signin native module not loaded yet.");
    return;
  }

  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    "873634436099-elttbsv83m3kafmsuihrlh1t2ppvi3cn.apps.googleusercontent.com";

  try {
    console.log("[GoogleAuth] Configuring GoogleSignin with webClientId:", webClientId);
    mod.GoogleSignin.configure({
      webClientId,
    });
    isGoogleConfigured = true;
    console.log("[GoogleAuth] GoogleSignin configured successfully.");
  } catch (configErr) {
    console.error("[GoogleAuth] Failed to configure GoogleSignin:", configErr);
  }
}

export async function signInGoogle() {
  console.log("\n[GoogleAuth] ========================================");
  console.log("[GoogleAuth] 🚀 Starting Google Sign-In Flow");
  console.log("[GoogleAuth] Platform:", Platform.OS);
  console.log(
    "[GoogleAuth] Current EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:",
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "(using fallback webClientId)",
  );

  const mod = getGoogleSignInModule();

  if (!mod?.GoogleSignin) {
    console.error("[GoogleAuth] ❌ RNGoogleSignin native module is missing from the binary!");
    throw {
      code: "auth/native-module-missing",
      message:
        "Google Sign-In requires a native development build with 'RNGoogleSignin'. Please run 'npx expo run:android' or 'npx expo run:ios' to compile the native module.",
    };
  }

  configureGoogleSignIn();

  const { GoogleSignin, statusCodes } = mod;

  try {
    console.log("[GoogleAuth] Step 1: Checking Google Play Services...");
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log("[GoogleAuth] Step 1 OK: Play Services available.");

    console.log("[GoogleAuth] Step 2: Calling GoogleSignin.signIn()...");
    const response = await GoogleSignin.signIn();
    console.log("[GoogleAuth] Step 2 OK: Received response type:", response.type);
    console.log("[GoogleAuth] Response data:", JSON.stringify(response, null, 2));

    if (response.type === "success") {
      const { idToken } = response.data;
      if (!idToken) {
        console.error("[GoogleAuth] ❌ No idToken in Google Sign-In response!");
        throw {
          code: "auth/google-sign-in-failed",
          message: "Google Sign-In failed: No ID token returned.",
        };
      }
      console.log("[GoogleAuth] Step 3: Exchanging idToken for Firebase credential...");
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      console.log(
        "[GoogleAuth] ✅ Firebase signInWithCredential SUCCESS! UID:",
        userCredential.user.uid,
        "Email:",
        userCredential.user.email,
      );

      // Connect to Cloudflare Worker with Firebase ID token
      try {
        console.log("[GoogleAuth] Fetching Firebase ID token for Cloudflare Worker verification...");
        const firebaseIdToken = await userCredential.user.getIdToken();
        if (firebaseIdToken) {
          await verifyWithCloudflareWorker(firebaseIdToken);
        }
      } catch (workerErr) {
        console.warn("[GoogleAuth] Non-fatal Cloudflare Worker verification error:", workerErr);
      }

      console.log("[GoogleAuth] ========================================\n");
      return userCredential;
    }

    console.warn("[GoogleAuth] User cancelled Google Sign-In prompt.");
    throw {
      code: "auth/user-cancelled",
      message: "Google Sign-In was cancelled.",
    };
  } catch (err: any) {
    console.error("\n[GoogleAuth] ========================================");
    console.error("[GoogleAuth] ❌ Google Sign-In Exception Caught:");
    console.error("[GoogleAuth] Error Code:", err?.code);
    console.error("[GoogleAuth] Error Message:", err?.message);
    try {
      console.error(
        "[GoogleAuth] Full Error Object:",
        JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
      );
    } catch {
      console.error("[GoogleAuth] Full Error Object:", err);
    }

    const isDeveloperError =
      String(err?.code) === "10" ||
      String(err?.code) === "DEVELOPER_ERROR" ||
      (typeof err?.message === "string" && err?.message.includes("DEVELOPER_ERROR"));

    if (isDeveloperError) {
      console.error(`
[GoogleAuth] ⚠️ DEVELOPER_ERROR (Code 10) DIAGNOSIS:
[GoogleAuth] Google Play Services rejected the request because:
[GoogleAuth] 1. Android SHA-1 fingerprint mismatch in Firebase Console.
[GoogleAuth]    -> Keystore SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
[GoogleAuth] 2. Web Client ID must match client_type 3:
[GoogleAuth]    -> 873634436099-elttbsv83m3kafmsuihrlh1t2ppvi3cn.apps.googleusercontent.com
[GoogleAuth] 3. Rebuild app using 'npx expo run:android' after updating google-services.json.
`);
      console.error("[GoogleAuth] ========================================\n");
      throw {
        code: "auth/developer-error",
        message:
          "Google Sign-In configuration error (DEVELOPER_ERROR 10). Missing Web Client ID or SHA-1 fingerprint in Firebase Console.",
      };
    }

    if (err?.code === statusCodes?.SIGN_IN_CANCELLED) {
      console.warn("[GoogleAuth] Sign-in was cancelled by user.");
      throw {
        code: "auth/user-cancelled",
        message: "Google Sign-In was cancelled.",
      };
    }
    if (err?.code === statusCodes?.IN_PROGRESS) {
      console.warn("[GoogleAuth] Sign-in is already in progress.");
      throw {
        code: "auth/google-sign-in-failed",
        message: "Sign-in already in progress.",
      };
    }
    if (err?.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) {
      console.error("[GoogleAuth] Google Play Services not available.");
      throw {
        code: "auth/google-sign-in-failed",
        message: "Google Play Services not available or outdated.",
      };
    }

    console.error("[GoogleAuth] ========================================\n");
    throw err;
  }
}

export async function signUpEmail(
  name: string,
  email: string,
  password: string,
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  const displayName = name.trim();

  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }

  // Connect to Cloudflare Worker with Firebase ID token
  try {
    const idToken = await credential.user.getIdToken();
    if (idToken) {
      await verifyWithCloudflareWorker(idToken);
    }
  } catch (workerErr) {
    console.warn("[Auth] Non-fatal Cloudflare Worker verification error on sign-up:", workerErr);
  }

  return credential.user;
}

export async function signInEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

  // Connect to Cloudflare Worker with Firebase ID token
  try {
    const idToken = await credential.user.getIdToken();
    if (idToken) {
      await verifyWithCloudflareWorker(idToken);
    }
  } catch (workerErr) {
    console.warn("[Auth] Non-fatal Cloudflare Worker verification error on sign-in:", workerErr);
  }

  return credential;
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken(forceRefresh);
}

export async function signOutUser() {
  try {
    const mod = getGoogleSignInModule();
    if (mod?.GoogleSignin && (await mod.GoogleSignin.hasPreviousSignIn())) {
      await mod.GoogleSignin.signOut();
    }
  } catch {
    // Ignore Google Sign-In signout errors when already signed out or unavailable
  }
  return signOut(auth);
}

export function sendReset(email: string) {
  return sendPasswordResetEmail(auth, email.trim());
}

export function observeAuth(
  callback: Parameters<typeof onAuthStateChanged>[1],
) {
  return onAuthStateChanged(auth, callback);
}
