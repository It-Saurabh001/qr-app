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
};

export function getAppError(error: unknown): AppError {
  const candidate = error as {
    code?: string;
    message?: string;
  };

  const code = candidate?.code ?? "auth/unknown";

  return {
    code,
    message: authMessages[code] ?? "Something went wrong. Please try again.",
  };
}
