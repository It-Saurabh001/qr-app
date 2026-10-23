import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

import { clearLocalGuestSession } from "@/services/auth/localGuestSession";
import { uploadQrToCloudinary } from "@/services/cloudinary/uploadService";
import { deleteUserAccount } from "@/services/firebase/accountService";
import {
  fetchUserCloudHistory,
  syncGuestHistoryToCloud,
} from "@/services/firebase/historyService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signOut } from "@/store/slices/authSlice";
import {
  historySelectors,
  mergeHistoryItems,
  updateHistoryItem,
  type QRHistoryItem,
} from "@/store/slices/historySlice";
import { guestSessionEnded } from "@/store/slices/localGuestSlice";

export default function AccountProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const history = useAppSelector((state) =>
    historySelectors.selectAll(state.history),
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState("");
  const [currentSyncItem, setCurrentSyncItem] = useState<QRHistoryItem | null>(
    null,
  );
  const syncQrRef = useRef<View>(null);

  const handleCopyUid = async () => {
    console.log('[AccountProfile] 🔘 Button "Copy UID" pressed');
    if (user?.uid) {
      await Clipboard.setStringAsync(user.uid);
      Alert.alert("Copied", "User ID copied to clipboard.");
    }
  };

  const handleForceSync = async () => {
    console.log(`[AccountProfile] 📍 Screen: "Account & Cloud Settings"`);
    console.log(
      `[AccountProfile] 🔘 Button "Sync Cloud Data Now" pressed by user: ${user?.uid || "unauthenticated"}`,
    );

    if (!user) {
      console.warn("[AccountProfile] ⚠️ Sync aborted: No authenticated user.");
      Alert.alert(
        "Sign In Required",
        "Please sign in with an online account to sync data to Firestore.",
      );
      return;
    }

    setIsSyncing(true);
    setSyncStatusText("Checking local creations...");

    try {
      // Step 1: Detect all items (creations and scans, local and remote) needing Cloudinary PNG or direct image upload
      setSyncStatusText("Checking items for Cloudinary upload...");
      console.log(`[AccountProfile] 🔍 Fetching and checking records for user "${user.uid}"...`);

      let remoteItems: QRHistoryItem[] = [];
      try {
        remoteItems = await fetchUserCloudHistory(user.uid);
        console.log(`[AccountProfile] ☁️ Found ${remoteItems.length} records in Firestore.`);
      } catch (e: any) {
        console.warn("[AccountProfile] ⚠️ Could not fetch existing cloud records ahead of time:", e?.message || e);
      }

      // Merge remoteItems and local history into a comprehensive map
      const itemMap = new Map<string, QRHistoryItem>();
      for (const item of remoteItems) {
        if (item?.id) itemMap.set(item.id, item);
      }
      for (const item of history) {
        if (!item?.id) continue;
        const existing = itemMap.get(item.id);
        itemMap.set(item.id, {
          ...existing,
          ...item,
          cloudUrl: item.cloudUrl || existing?.cloudUrl,
          publicId: item.publicId || existing?.publicId,
          cloudAssetId: item.cloudAssetId || existing?.cloudAssetId,
          cloudUploadedAt: item.cloudUploadedAt || existing?.cloudUploadedAt,
        });
      }

      let workingHistory = Array.from(itemMap.values());

      // Filter ALL items (whether type === "create" or "scan") that do NOT have a cloudUrl!
      const unuploadedItems = workingHistory.filter((item) => !item.cloudUrl);

      if (unuploadedItems.length > 0) {
        console.log(
          `[AccountProfile] ⏳ [1/3] Found ${unuploadedItems.length} items missing Cloudinary CDN URL. Uploading...`,
        );

        for (let idx = 0; idx < unuploadedItems.length; idx++) {
          const item = unuploadedItems[idx];
          setSyncStatusText(
            `Uploading asset ${idx + 1}/${unuploadedItems.length} to Cloudinary...`,
          );

          // Check if item has a direct image file URI (e.g. from gallery scan or image file)
          const directImageUri =
            (item.imageUri &&
              (item.imageUri.startsWith("file://") ||
                item.imageUri.startsWith("content://") ||
                item.imageUri.startsWith("data:image/")))
              ? item.imageUri
              : (typeof item.content === "string" &&
                  (item.content.startsWith("file://") ||
                    item.content.startsWith("content://") ||
                    item.content.endsWith(".png") ||
                    item.content.endsWith(".jpg") ||
                    item.content.endsWith(".jpeg") ||
                    item.content.endsWith(".webp")))
                ? item.content
                : null;

          let imageUriToUpload = "";

          if (directImageUri) {
            console.log(
              `[AccountProfile] 🖼️ [1/3] Item "${item.id}" is a direct image. Uploading directly to Cloudinary...`,
            );
            imageUriToUpload = directImageUri;
          } else {
            console.log(
              `[AccountProfile] 🎨 [1/3] Rendering QR in PNG format for "${item.title || item.id}"...`,
            );
            setCurrentSyncItem(item);
            await new Promise((resolve) => setTimeout(resolve, 180));

            if (syncQrRef.current) {
              imageUriToUpload = await captureRef(syncQrRef.current, {
                format: "png",
                quality: 1,
                result: "data-uri",
              });
            }
          }

          if (imageUriToUpload) {
            try {
              const cldResult = await uploadQrToCloudinary(
                imageUriToUpload,
                item.title || (item.type === "scan" ? "Scanned Code" : "QR Code"),
              );

              console.log(
                `[AccountProfile] ✅ [1/3] Cloudinary upload success! CDN URL: ${cldResult.secureUrl}`,
              );

              const changes = {
                cloudUrl: cldResult.secureUrl,
                publicId: cldResult.publicId,
                cloudAssetId: cldResult.assetId,
                cloudUploadedAt: cldResult.createdAt,
              };

              dispatch(
                updateHistoryItem({
                  id: item.id,
                  changes,
                }),
              );

              workingHistory = workingHistory.map((h) =>
                h.id === item.id ? { ...h, ...changes } : h,
              );
            } catch (cldErr: any) {
              console.warn(
                `[AccountProfile] ⚠️ Cloudinary upload skipped for item "${item.id}":`,
                cldErr?.message || cldErr,
              );
            }
          }
        }

        setCurrentSyncItem(null);
        console.log(
          `[AccountProfile] ✅ [1/3] Cloudinary uploads complete. All assets hosted on Cloudinary CDN.`,
        );
      } else {
        console.log(
          `[AccountProfile] ℹ️ [1/3] All items already hosted on Cloudinary or none to upload.`,
        );
      }

      // Step 2: Sync records with Cloudinary asset links into Firestore (not storing raw image data)
      setSyncStatusText("Saving records and Cloudinary URLs to Firestore...");
      console.log(
        `[AccountProfile] ⏳ [2/3] Uploading records with Cloudinary asset links to Firestore...`,
      );

      const syncedItems = await syncGuestHistoryToCloud(user.uid, workingHistory);

      // Step 3: Merge back into Redux store
      console.log(
        `[AccountProfile] 🔄 [3/3] Merging ${syncedItems.length} records into Redux store...`,
      );
      dispatch(mergeHistoryItems(syncedItems));

      console.log(
        `[AccountProfile] ✅ [3/3] Cloud sync completed successfully (${syncedItems.length} records).`,
      );

      Alert.alert(
        "Cloud Sync Complete",
        `Your QR codes are safely hosted on Cloudinary in PNG format, and their secure CDN links are stored in Firestore.`,
      );
    } catch (err: any) {
      console.error(
        "[AccountProfile] ❌ Cloud sync failed:",
        err?.message || err,
      );
      Alert.alert(
        "Sync Failed",
        err?.message || "Could not complete cloud synchronization.",
      );
    } finally {
      setCurrentSyncItem(null);
      setIsSyncing(false);
      setSyncStatusText("");
      console.log("[AccountProfile] 🏁 Sync operation finished.");
    }
  };

  const handleSignOut = () => {
    console.log('[AccountProfile] 🔘 Button "Sign Out" pressed');
    Alert.alert(
      "Sign Out",
      "Do you want to retain your local data on this device after signing out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear & Sign Out",
          style: "destructive",
          onPress: async () => {
            console.log('[AccountProfile] ⏳ Signing out (clearing local data)...');
            try {
              await dispatch(signOut()).unwrap();
            } catch {
              // ignore
            }
            await clearLocalGuestSession();
            dispatch(guestSessionEnded());
            console.log('[AccountProfile] ✅ Sign out complete. Redirecting to Sign In.');
            router.replace("/(auth)/sign-in");
          },
        },
        {
          text: "Keep Local Data",
          onPress: async () => {
            console.log('[AccountProfile] ⏳ Signing out (retaining local data)...');
            try {
              await dispatch(signOut()).unwrap();
            } catch {
              // ignore
            }
            console.log('[AccountProfile] ✅ Sign out complete. Redirecting to Sign In.');
            router.replace("/(auth)/sign-in");
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    console.log('[AccountProfile] 🔘 Button "Delete Account Permanently" pressed');
    Alert.alert(
      "Delete Account Permanently?",
      "WARNING: This action is permanent and cannot be undone. All your Firestore records, Cloudinary assets, and Firebase account will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            console.log(`[AccountProfile] ⏳ Deleting account permanently for user: ${user?.uid}...`);
            try {
              await deleteUserAccount();
              await clearLocalGuestSession();
              dispatch(guestSessionEnded());
              console.log('[AccountProfile] ✅ Account permanently deleted.');
              router.replace("/(auth)/sign-in");
              Alert.alert("Account Deleted", "Your account and data have been removed.");
            } catch (err) {
              console.error("[AccountProfile] ❌ Delete account error:", err);
              Alert.alert(
                "Error",
                "Could not delete account. If you haven't signed in recently, please re-authenticate and try again.",
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-2xl self-center">
          {/* Header */}
          <View className="mb-6 flex-row items-center gap-3">
            <Pressable
              onPress={() => {
                console.log('[AccountProfile] 🔘 Button "Back" pressed');
                router.back();
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 active:bg-slate-200 dark:bg-slate-900 dark:active:bg-slate-800"
            >
              <Ionicons name="arrow-back" size={22} color="#7C3AED" />
            </Pressable>

            <View>
              <Text className="text-xs font-bold tracking-widest text-violet-600">
                CLOUD ACCOUNT
              </Text>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                Account & Cloud
              </Text>
            </View>
          </View>

          {/* User Profile Card */}
          <View className="mb-6 items-center rounded-3xl border border-violet-100 bg-violet-50/70 p-6 dark:border-violet-900/60 dark:bg-violet-950/40">
            {user?.photoURL ? (
              <View className="mb-4 h-20 w-20 overflow-hidden rounded-3xl border-2 border-violet-300 shadow-md shadow-violet-500/25 dark:border-violet-700">
                <Image
                  source={{ uri: user.photoURL }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={200}
                />
              </View>
            ) : (
              <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-violet-600 shadow-md shadow-violet-500/25">
                <Text className="text-3xl font-extrabold text-white">
                  {(user?.displayName || user?.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            )}

            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.displayName || "Signed In User"}
            </Text>

            <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user?.email || "Firebase Authentication"}
            </Text>

            <View className="mt-3 flex-row items-center gap-2">
              <View className="rounded-full bg-emerald-100 px-3 py-1 dark:bg-emerald-950">
                <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  ONLINE • SECURE
                </Text>
              </View>

              <Pressable
                onPress={handleCopyUid}
                className="flex-row items-center gap-1 rounded-full bg-white px-3 py-1 shadow-xs dark:bg-slate-900"
              >
                <Ionicons name="finger-print-outline" size={13} color="#7C3AED" />
                <Text className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  UID: {user?.uid ? `${user.uid.slice(0, 8)}...` : "None"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Cloud Storage & Quotas */}
          <View className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Cloud Infrastructure
            </Text>

            <View className="gap-3.5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950">
                    <Ionicons name="cloud-done-outline" size={18} color="#7C3AED" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">
                      Firestore Database
                    </Text>
                    <Text className="text-[11px] text-slate-400">
                      Real-time cloud database
                    </Text>
                  </View>
                </View>
                <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Active
                </Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-slate-800" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                    <Ionicons name="images-outline" size={18} color="#2563EB" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">
                      Cloudinary Hosting
                    </Text>
                    <Text className="text-[11px] text-slate-400">
                      High-speed CDN image assets
                    </Text>
                  </View>
                </View>
                <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Ready
                </Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-slate-800" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950">
                    <Ionicons name="sparkles" size={18} color="#D97706" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">
                      Gemini 2.5 AI
                    </Text>
                    <Text className="text-[11px] text-slate-400">
                      Smart creator & threat analysis
                    </Text>
                  </View>
                </View>
                <Text className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  50 / 50 Left
                </Text>
              </View>
            </View>
          </View>

          {/* Cloud Operations: Unified Single-Place Sync */}
          <View className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <Text className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Cloud Data Synchronization
            </Text>
            <Text className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              Upload all local scans & creations to Firestore and fetch latest cloud records across your devices.
            </Text>

            <Pressable
              onPress={handleForceSync}
              disabled={isSyncing}
              accessibilityRole="button"
              className="flex-row items-center justify-center rounded-2xl bg-violet-600 py-4 shadow-lg shadow-violet-500/25 active:bg-violet-700"
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="sync" size={18} color="#FFFFFF" />
                  <Text className="ml-2 font-bold text-white">
                    Sync Cloud Data Now
                  </Text>
                </>
              )}
            </Pressable>

            {isSyncing && syncStatusText ? (
              <Text className="mt-2.5 text-center text-xs font-semibold text-violet-600 dark:text-violet-400">
                {syncStatusText}
              </Text>
            ) : null}
          </View>

          {/* Account Lifecycle */}
          <View className="rounded-3xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Management
            </Text>

            <Pressable
              onPress={handleSignOut}
              accessibilityRole="button"
              className="mb-3 flex-row items-center justify-center rounded-2xl bg-slate-100 py-3.5 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
            >
              <Ionicons name="log-out-outline" size={18} color="#64748B" />
              <Text className="ml-2 font-bold text-slate-800 dark:text-slate-200">
                Sign Out of QR Studio
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              accessibilityRole="button"
              className="flex-row items-center justify-center rounded-2xl bg-red-50 py-3.5 active:bg-red-100 dark:bg-red-950/60 dark:active:bg-red-900"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text className="ml-2 font-bold text-red-600 dark:text-red-400">
                    Delete Account Permanently
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Off-screen QR rendering canvas for generating PNG format assets for Cloudinary upload during sync */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -2000,
          left: 0,
          width: 250,
          height: 250,
        }}
        collapsable={false}
      >
        {currentSyncItem ? (
          <View
            ref={syncQrRef}
            collapsable={false}
            style={{
              width: 240,
              height: 240,
              backgroundColor: currentSyncItem.backgroundColor || "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <QRCode
              value={currentSyncItem.content.trim() || " "}
              size={200}
              color={currentSyncItem.foregroundColor || "#111827"}
              backgroundColor={currentSyncItem.backgroundColor || "#FFFFFF"}
              ecl={currentSyncItem.ecl || "M"}
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
