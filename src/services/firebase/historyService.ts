import {
  collection,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from "@react-native-firebase/firestore";

import type { QRHistoryItem } from "@/store/slices/historySlice";

const db = getFirestore();

export async function syncGuestHistoryToCloud(
  uid: string,
  localItems: QRHistoryItem[],
): Promise<QRHistoryItem[]> {
  const historyRef = collection(db, "users", uid, "history");

  // Upload local items first. Document IDs make retries idempotent.
  for (let start = 0; start < localItems.length; start += 400) {
    const batch = localItems.slice(start, start + 400);

    await Promise.all(
      batch.map((item) =>
        setDoc(doc(historyRef, item.id), item, { merge: true }),
      ),
    );
  }

  // Fetch cloud history only after local uploads succeed.
  const snapshot = await getDocs(historyRef);

  return snapshot.docs.map((document) => document.data() as QRHistoryItem);
}
