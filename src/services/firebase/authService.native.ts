import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "@react-native-firebase/auth";

const auth = getAuth();

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

  return credential.user;
}

export function signInEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export function signOutUser() {
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

export function signInGuest() {
  return signInAnonymously(auth);
}
