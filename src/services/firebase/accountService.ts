import { getAuth } from "@react-native-firebase/auth";
import { getFirestore, doc, deleteDoc } from "@react-native-firebase/firestore";

export async function deleteUserAccount(): Promise<void> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user found.");
  }

  const db = getFirestore();
  const userDocRef = doc(db, "users", user.uid);

  // Attempt to delete user metadata doc first
  try {
    await deleteDoc(userDocRef);
  } catch {
    // Non-fatal if doc doesn't exist
  }

  // Delete Firebase Auth account
  await user.delete();
}
