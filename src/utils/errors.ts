export type AppError = {
  code: string;
  message: string;
};

const authMessages: Record<string, string> = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Choose a stronger password.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed":
    "Network error. Check your internet connection.",
  "auth/requires-recent-login": "Please sign in again to continue.",
  "auth/operation-not-allowed": "This sign-in method is not enabled.",
  "auth/user-cancelled": "Google Sign-In was cancelled.",
  "auth/google-sign-in-failed": "Google Sign-In failed. Please try again.",
  "auth/native-module-missing":
    "Google Sign-In requires a native development build. Rebuild your app using 'npx expo run:android' or 'npx expo run:ios'.",
  "auth/developer-error":
    "Google Sign-In configuration error (DEVELOPER_ERROR 10). Missing Web Client ID in .env or SHA-1 fingerprint in Firebase Console.",
  "10":
    "Google Sign-In configuration error (DEVELOPER_ERROR 10). Missing Web Client ID in .env or SHA-1 fingerprint in Firebase Console.",
};

export function getAppError(error: unknown): AppError {
  const candidate = error as {
    code?: string;
    message?: string;
  };

  const code = candidate?.code ?? "auth/unknown";

  return {
    code,
    message:
      authMessages[code] ??
      candidate?.message ??
      "Something went wrong. Please try again.",
  };
}
