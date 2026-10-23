import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { useQrExport } from "@/features/creator/useQrExport";
import { uploadQrToCloudinary } from "@/services/cloudinary/uploadService";
import {
  deleteQrFromCloudFirestore,
  updateQrCloudinaryMetadata,
} from "@/services/firebase/historyService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  historySelectors,
  removeHistoryItem,
  toggleFavorite,
  updateHistoryItem,
} from "@/store/slices/historySlice";

export default function CreationDetailScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();

  const creationItem = useAppSelector((state) =>
    id ? historySelectors.selectById(state.history, id) : undefined,
  );
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    console.log(
      `[CreationStudio] 📍 Screen: "Creation Studio" | Item: "${id}" | Cloudinary URL: ${creationItem?.cloudUrl ? `"${creationItem.cloudUrl}"` : "None (Not uploaded yet)"}`,
    );
  }, [id, creationItem?.cloudUrl]);

  const qrRef = useRef<View>(null);
  const { captureQr, saveQr, shareQr } = useQrExport(qrRef);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedCloudUrl, setUploadedCloudUrl] = useState<string | null>(null);
  const cloudUrl = uploadedCloudUrl ?? creationItem?.cloudUrl ?? null;

  const payload = creationItem?.content ?? "https://example.com";
  const format = creationItem?.format ?? "QR";
  const title = creationItem?.title ?? "QR Code Creation";
  const foregroundColor = creationItem?.foregroundColor || "#111827";
  const backgroundColor = creationItem?.backgroundColor || "#FFFFFF";
  const ecl = creationItem?.ecl || "M";

  const handleCopy = async () => {
    await Clipboard.setStringAsync(payload);
    Alert.alert("Copied", "Content copied to clipboard.");
  };

  const handleCopyCloudUrl = async () => {
    if (!cloudUrl) return;
    await Clipboard.setStringAsync(cloudUrl);
    Alert.alert("Copied", "Cloudinary CDN link copied to clipboard.");
  };

  const handleOpenCloudUrl = async () => {
    if (!cloudUrl) return;
    try {
      await Linking.openURL(cloudUrl);
    } catch {
      Alert.alert("Error", "Could not open link in browser.");
    }
  };

  const handleShareText = async () => {
    try {
      await Share.share({ message: payload });
    } catch {
      // Ignore user dismissal
    }
  };

  const handleUploadToCloud = async () => {
    console.log(`[CreationStudio] 🚀 [1/5] Initiating cloud backup for "${title}" (ID: ${id})...`);
    if (!isAuthenticated || !user?.uid) {
      console.warn("[CreationStudio] ⚠️ Upload aborted: User not signed in.");
      Alert.alert(
        "Sign In Required",
        "Sign in to your account to upload and back up QR images to Cloudinary.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/(auth)/sign-in") },
        ],
      );
      return;
    }

    setIsUploading(true);
    try {
      // Step 1: Capture live QR view into high-resolution PNG data URI
      console.log("[CreationStudio] ⏳ [2/5] Capturing high-resolution QR snapshot...");
      const imageUri = await captureQr("data-uri");
      console.log("[CreationStudio] ✅ [2/5] Snapshot captured.");

      // Step 2: Trigger signed Cloudinary upload using Cloudflare Worker signature
      console.log("[CreationStudio] ⏳ [3/5] Starting signed Cloudinary upload...");
      const result = await uploadQrToCloudinary(imageUri, title);
      console.log(`[CreationStudio] ✅ [3/5] Cloudinary upload successful (CDN: ${result.secureUrl}).`);
      setUploadedCloudUrl(result.secureUrl);

      // Step 3: Update local Redux store with Cloudinary metadata
      if (id) {
        console.log("[CreationStudio] ⏳ [4/5] Updating local Redux history store...");
        dispatch(
          updateHistoryItem({
            id,
            changes: {
              cloudUrl: result.secureUrl,
              publicId: result.publicId,
              cloudAssetId: result.assetId,
              cloudUploadedAt: result.createdAt,
            },
          }),
        );
        console.log("[CreationStudio] ✅ [4/5] Local history updated.");

        // Step 4: Persist Cloudinary URL and publicId into user's Firestore history
        console.log(`[CreationStudio] ⏳ [5/5] Persisting Cloudinary metadata to Firestore for user ${user.uid}...`);
        await updateQrCloudinaryMetadata(user.uid, id, {
          cloudUrl: result.secureUrl,
          publicId: result.publicId,
          cloudAssetId: result.assetId,
          cloudUploadedAt: result.createdAt,
        });
        console.log("[CreationStudio] ✅ [5/5] Cloud Firestore sync complete!");
      }

      console.log("[CreationStudio] 🎉 Cloud backup flow completed successfully.");
      Alert.alert(
        "Upload Successful",
        "Your high-resolution QR is now safely hosted on Cloudinary CDN and synced with Firestore.",
      );
    } catch (err: any) {
      console.error("[CreationStudio] ❌ Cloud backup flow failed:", err?.message || err);
      Alert.alert(
        "Upload Failed",
        err?.message || "Could not upload QR code to Cloudinary.",
      );
    } finally {
      setIsUploading(false);
      console.log("[CreationStudio] 🏁 Cloud upload process ended.");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Creation?",
      `Remove "${title}" permanently? ${
        isAuthenticated
          ? "This will remove the local record and any associated cloud assets."
          : "This will delete the code from your device history."
      }`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            console.log(`[CreationStudio] 🗑️ Deleting creation "${title}" (ID: ${id})...`);
            if (id) {
              dispatch(removeHistoryItem(id));
              console.log("[CreationStudio] ✅ Removed item from local Redux state.");
              if (isAuthenticated && user?.uid) {
                try {
                  console.log(`[CreationStudio] ⏳ Deleting Firestore document for item ${id}...`);
                  await deleteQrFromCloudFirestore(user.uid, id);
                  console.log("[CreationStudio] ✅ Firestore cloud document deleted.");
                } catch (delErr) {
                  console.warn("[CreationStudio] ⚠️ Failed to delete from Firestore:", delErr);
                }
              }
            }
            router.back();
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
          <View className="mb-6 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 active:bg-slate-200 dark:bg-slate-900 dark:active:bg-slate-800"
              >
                <Ionicons name="arrow-back" size={22} color="#7C3AED" />
              </Pressable>

              <View>
                <Text className="text-xs font-bold tracking-widest text-violet-600">
                  CREATION STUDIO
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-xl font-bold text-slate-900 dark:text-white"
                >
                  {title}
                </Text>
              </View>
            </View>

            {id && (
              <Pressable
                onPress={() => dispatch(toggleFavorite(id))}
                accessibilityRole="button"
                className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 active:bg-slate-200 dark:bg-slate-900 dark:active:bg-slate-800"
              >
                <Ionicons
                  name={creationItem?.isFavorite ? "star" : "star-outline"}
                  size={20}
                  color={creationItem?.isFavorite ? "#EAB308" : "#94A3B8"}
                />
              </Pressable>
            )}
          </View>

          {/* QR Code Canvas Card */}
          <View className="mb-6 items-center rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <View
              ref={qrRef}
              collapsable={false}
              style={{ backgroundColor }}
              className="items-center justify-center rounded-2xl border border-slate-200/80 p-5 shadow-sm dark:border-slate-800"
            >
              <QRCode
                value={payload.trim() || " "}
                size={200}
                color={foregroundColor}
                backgroundColor={backgroundColor}
                ecl={ecl}
              />
            </View>

            <View className="mt-4 flex-row items-center gap-2">
              <View className="rounded-full bg-violet-100 px-3 py-1 dark:bg-violet-950">
                <Text className="text-xs font-bold text-violet-700 dark:text-violet-300">
                  {format}
                </Text>
              </View>

              <View className="rounded-full bg-slate-200 px-3 py-1 dark:bg-slate-800">
                <Text className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  ECL {ecl}
                </Text>
              </View>
            </View>
          </View>

          {/* Content Payload Card */}
          <View className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Encoded Content
              </Text>
              <Pressable
                onPress={handleCopy}
                accessibilityRole="button"
                className="flex-row items-center gap-1"
              >
                <Ionicons name="copy-outline" size={12} color="#7C3AED" />
                <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                  Copy
                </Text>
              </Pressable>
            </View>

            <Text
              selectable
              className="text-sm leading-6 text-slate-900 dark:text-white"
            >
              {payload}
            </Text>
          </View>

          {/* Cloud Storage & Cloudinary Section (For Online Users) */}
          <View className="mb-6 rounded-3xl border border-violet-100 bg-violet-50/60 p-5 dark:border-violet-900/60 dark:bg-violet-950/30">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={
                    cloudUrl
                      ? "cloud-done"
                      : isAuthenticated
                        ? "cloud-outline"
                        : "cloud-offline-outline"
                  }
                  size={20}
                  color="#7C3AED"
                />
                <Text className="text-sm font-bold text-slate-900 dark:text-white">
                  Cloud Backup & Hosting
                </Text>
              </View>

              <View
                className={`rounded-full px-2.5 py-0.5 ${
                  cloudUrl
                    ? "bg-emerald-100 dark:bg-emerald-950"
                    : isAuthenticated
                      ? "bg-violet-100 dark:bg-violet-950"
                      : "bg-amber-100 dark:bg-amber-950"
                }`}
              >
                <Text
                  className={`text-[10px] font-bold ${
                    cloudUrl
                      ? "text-emerald-700 dark:text-emerald-300"
                      : isAuthenticated
                        ? "text-violet-700 dark:text-violet-300"
                        : "text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {cloudUrl
                    ? "CLOUDINARY HOSTED"
                    : isAuthenticated
                      ? "ONLINE ACCOUNT"
                      : "LOCAL DEVICE"}
                </Text>
              </View>
            </View>

            <Text className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
              {cloudUrl
                ? "This QR code is stored in your Cloudinary repository and backed up to Firestore."
                : isAuthenticated
                  ? "Upload this high-res QR code to your Cloudinary storage for cross-device access and CDN delivery."
                  : "Sign in with an online account to host your creations on Cloudinary with fast global CDN delivery."}
            </Text>

            {cloudUrl && (
              <View className="mt-3 rounded-2xl border border-violet-200/80 bg-white/80 p-3.5 dark:border-violet-900/60 dark:bg-slate-900/80">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cloudinary CDN URL
                  </Text>
                  {creationItem?.publicId && (
                    <Text
                      numberOfLines={1}
                      className="max-w-[160px] text-[10px] font-medium text-slate-500 dark:text-slate-400"
                    >
                      {creationItem.publicId}
                    </Text>
                  )}
                </View>

                <Text
                  numberOfLines={1}
                  selectable
                  className="mt-1 text-xs font-mono text-violet-700 dark:text-violet-300"
                >
                  {cloudUrl}
                </Text>

                <View className="mt-2.5 flex-row gap-2">
                  <Pressable
                    onPress={handleCopyCloudUrl}
                    accessibilityRole="button"
                    className="flex-1 flex-row items-center justify-center rounded-xl bg-violet-100 py-2 active:bg-violet-200 dark:bg-violet-900/40 dark:active:bg-violet-900/60"
                  >
                    <Ionicons name="copy-outline" size={13} color="#7C3AED" />
                    <Text className="ml-1 text-xs font-bold text-violet-700 dark:text-violet-300">
                      Copy CDN Link
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleOpenCloudUrl}
                    accessibilityRole="button"
                    className="flex-1 flex-row items-center justify-center rounded-xl bg-slate-100 py-2 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
                  >
                    <Ionicons name="open-outline" size={13} color="#64748B" />
                    <Text className="ml-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      Open Link
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {isAuthenticated ? (
              <Pressable
                onPress={handleUploadToCloud}
                disabled={isUploading}
                accessibilityRole="button"
                className="mt-4 flex-row items-center justify-center rounded-2xl bg-violet-600 py-3 active:bg-violet-700"
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name={cloudUrl ? "refresh" : "cloud-upload"}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text className="ml-2 text-xs font-bold text-white">
                      {cloudUrl
                        ? "Re-upload to Cloudinary"
                        : "Upload to Cloudinary CDN"}
                    </Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push("/(auth)/sign-in")}
                accessibilityRole="button"
                className="mt-4 flex-row items-center justify-center rounded-2xl bg-white py-3 shadow-xs dark:bg-slate-900"
              >
                <Text className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  Sign In to Enable Cloudinary Sync
                </Text>
              </Pressable>
            )}
          </View>

          {/* Export & Sharing Actions */}
          <View className="mb-4 flex-row gap-3">
            <Pressable
              onPress={() => void saveQr()}
              accessibilityRole="button"
              className="flex-1 flex-row items-center justify-center rounded-2xl bg-slate-900 py-4 active:bg-slate-800 dark:bg-white dark:active:bg-slate-100"
            >
              <Ionicons
                name="download-outline"
                size={18}
                color={foregroundColor === "#FFFFFF" ? "#111827" : "#FFFFFF"}
              />
              <Text className="ml-2 font-bold text-white dark:text-slate-900">
                Save PNG
              </Text>
            </Pressable>

            <Pressable
              onPress={() => void shareQr()}
              accessibilityRole="button"
              className="flex-1 flex-row items-center justify-center rounded-2xl border border-slate-200 py-4 active:bg-slate-50 dark:border-slate-800 dark:active:bg-slate-900"
            >
              <Ionicons name="share-social-outline" size={18} color="#7C3AED" />
              <Text className="ml-2 font-bold text-slate-900 dark:text-white">
                Share QR Image
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleShareText}
            accessibilityRole="button"
            className="mb-4 flex-row items-center justify-center rounded-2xl border border-slate-200 py-3.5 dark:border-slate-800"
          >
            <Ionicons name="link-outline" size={18} color="#64748B" />
            <Text className="ml-2 font-semibold text-slate-700 dark:text-slate-300">
              Share Payload Text
            </Text>
          </Pressable>

          {/* Delete Action */}
          <Pressable
            onPress={handleDelete}
            accessibilityRole="button"
            className="flex-row items-center justify-center rounded-2xl bg-red-50 py-3.5 active:bg-red-100 dark:bg-red-950/60 dark:active:bg-red-900"
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text className="ml-2 font-bold text-red-600 dark:text-red-400">
              Delete Creation
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
