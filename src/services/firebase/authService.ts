export type FirebaseUserLike = {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
} | null;

export function observeAuth(
  _callback: (user: FirebaseUserLike) => void,
) {
  return () => { };
}

function unsupported(): Promise<never> {
  return Promise.reject(
    new Error("Firebase Authentication is available only in the native app."),
  );
}

export function signUpEmail(
  _name: string,
  _email: string,
  _password: string,
) {
  return unsupported();
}

export function signInEmail(
  _email: string,
  _password: string,
) {
  return unsupported();
}

export function signOutUser() {
  return unsupported();
}

export function sendReset(_email: string) {
  return unsupported();
}

export function signInGuest() {
  return unsupported();
}
