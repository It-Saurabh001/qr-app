import { getAuth } from "@react-native-firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  setDoc,
} from "@react-native-firebase/firestore";

import type { QRHistoryItem } from "@/store/slices/historySlice";

const db = getFirestore();

function sanitizeItem(item: QRHistoryItem): Record<string, unknown> {
  const { imageUri, ...rest } = item;
  return Object.fromEntries(
    Object.entries(rest).filter(([_, v]) => v !== undefined),
  );
}

function parseCloudDoc(docSnap: any): QRHistoryItem {
  const data = docSnap.data();
  return {
    ...data,
    format: String(data.format ?? "QR_CODE"),
  } as QRHistoryItem;
}

export async function fetchUserCloudHistory(
  uid: string,
): Promise<QRHistoryItem[]> {
  if (!uid) return [];
  try {
    const historyRef = collection(db, "users", uid, "history");
    const snapshot = await getDocs(historyRef);
    return snapshot.docs.map(parseCloudDoc);
  } catch (err: any) {
    console.warn("[FirestoreSync] ⚠️ Error fetching cloud history:", err?.message || err);
    return [];
  }
}

export async function syncGuestHistoryToCloud(
  uid: string,
  localItems: QRHistoryItem[],
): Promise<QRHistoryItem[]> {
  if (!uid) {
    console.error("[FirestoreSync] ❌ Aborted: User UID is required for sync.");
    throw new Error("User UID is required for cloud synchronization.");
  }

  console.log(
    `[FirestoreSync] 🚀 Starting cloud sync for user "${uid}" (Local items: ${localItems.length})...`,
  );

  // Ensure native auth has fresh credentials
  const auth = getAuth();
  if (auth.currentUser) {
    try {
      console.log(`[FirestoreSync] 🔑 Validating auth credentials for UID: ${auth.currentUser.uid}...`);
      await auth.currentUser.getIdToken(false);
    } catch (tokenErr) {
      console.warn("[FirestoreSync] ⚠️ Token refresh warning:", tokenErr);
    }
  }

  const historyRef = collection(db, "users", uid, "history");

  try {
    // Step 1: Upload local items if present
    if (localItems.length > 0) {
      console.log(
        `[FirestoreSync] ⏳ [1/2] Uploading ${localItems.length} items to users/${uid}/history...`,
      );

      for (let start = 0; start < localItems.length; start += 50) {
        const batch = localItems.slice(start, start + 50);

        await Promise.all(
          batch.map((item) =>
            setDoc(doc(historyRef, item.id), sanitizeItem(item), { merge: true }),
          ),
        );

        if (localItems.length > 50) {
          console.log(
            `[FirestoreSync] ⏳ [1/2] Uploaded batch (${Math.min(start + 50, localItems.length)}/${localItems.length})...`,
          );
        }
      }

      console.log(
        `[FirestoreSync] ✅ [1/2] Successfully uploaded ${localItems.length} local items to Firestore.`,
      );
    } else {
      console.log(
        "[FirestoreSync] ℹ️ [1/2] No local items to upload. Fetching remote cloud history...",
      );
    }

    // Step 2: Fetch full cloud history with timeout protection
    console.log(
      `[FirestoreSync] ⏳ [2/2] Fetching remote history documents from Firestore...`,
    );

    const snapshot = await Promise.race([
      getDocs(historyRef),
      new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Firestore sync timed out after 15s. Please check your network.",
              ),
            ),
          15000,
        ),
      ),
    ]);

    const cloudItems = snapshot.docs.map(parseCloudDoc);

    console.log(
      `[FirestoreSync] ✅ [2/2] Successfully retrieved ${cloudItems.length} cloud records from Firestore.`,
    );

    return cloudItems;
  } catch (err: any) {
    console.error(
      `[FirestoreSync] ❌ Cloud synchronization failed:`,
      err?.message || err,
    );
    throw err;
  }
}

/**
 * Saves a single QR item into the authenticated user's Firestore namespace (`users/{uid}/history/{item.id}`).
 */
export async function saveQrToCloudFirestore(
  uid: string,
  item: QRHistoryItem,
): Promise<void> {
  if (!uid || !item?.id) {
    console.warn("[Firestore] ⚠️ Cannot save QR: missing uid or item ID.");
    return;
  }
  console.log(`[Firestore] ⏳ Saving item "${item.id}" to users/${uid}/history...`);
  try {
    const itemDocRef = doc(db, "users", uid, "history", item.id);
    await setDoc(itemDocRef, sanitizeItem(item), { merge: true });
    console.log(`[Firestore] ✅ QR item "${item.id}" saved to Firestore.`);
  } catch (err: any) {
    console.error(`[Firestore] ❌ Error saving item "${item.id}" to Firestore:`, err?.message || err);
    throw err;
  }
}

/**
 * Updates Cloudinary hosting metadata for a specific QR creation in Firestore.
 */
export async function updateQrCloudinaryMetadata(
  uid: string,
  itemId: string,
  metadata: {
    cloudUrl: string;
    publicId: string;
    cloudAssetId?: string;
    cloudUploadedAt: string;
  },
): Promise<void> {
  if (!uid || !itemId) {
    console.warn("[Firestore] ⚠️ Cannot update metadata: missing uid or itemId.");
    return;
  }
  console.log(`[Firestore] ⏳ Updating Cloudinary metadata for item "${itemId}"...`);
  try {
    const itemDocRef = doc(db, "users", uid, "history", itemId);
    await setDoc(itemDocRef, metadata, { merge: true });
    console.log(`[Firestore] ✅ Cloudinary metadata updated for item "${itemId}".`);
  } catch (err: any) {
    console.error(`[Firestore] ❌ Error updating Cloudinary metadata for "${itemId}":`, err?.message || err);
    throw err;
  }
}

/**
 * Deletes a QR item document from the authenticated user's Firestore namespace.
 */
export async function deleteQrFromCloudFirestore(
  uid: string,
  itemId: string,
): Promise<void> {
  if (!uid || !itemId) {
    console.warn("[Firestore] ⚠️ Cannot delete item: missing uid or itemId.");
    return;
  }
  console.log(`[Firestore] ⏳ Deleting item "${itemId}" from users/${uid}/history...`);
  const itemDocRef = doc(db, "users", uid, "history", itemId);
  try {
    await deleteDoc(itemDocRef);
    console.log(`[Firestore] ✅ Item "${itemId}" deleted from Firestore.`);
  } catch (error: any) {
    console.warn(`[Firestore] ⚠️ Failed to delete item "${itemId}" from cloud:`, error?.message || error);
  }
}
