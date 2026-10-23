import { Ionicons } from "@expo/vector-icons";
import {
  Camera,
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
  type BarcodeType,
} from "expo-camera";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

import { uploadQrToCloudinary } from "@/services/cloudinary/uploadService";
import { saveQrToCloudFirestore } from "@/services/firebase/historyService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addHistoryItem,
  updateHistoryItem,
  type QRHistoryItem,
} from "@/store/slices/historySlice";

const BARCODE_TYPES: BarcodeType[] = [
  "qr",
  "ean13",
  "ean8",
  "code128",
  "upc_a",
  "upc_e",
  "pdf417",
  "datamatrix",
  "code39",
  "code93",
  "itf14",
  "codabar",
  "aztec",
];

function getTitle(content: string) {
  if (/^https?:\/\//i.test(content)) return "Website URL";
  if (/^WIFI:/i.test(content)) return "Wi-Fi Network";
  if (/^mailto:/i.test(content)) return "Email Address";
  if (/^tel:/i.test(content)) return "Phone Number";
  if (/^geo:/i.test(content)) return "Geographic Location";
  if (/^SMSTO:/i.test(content) || /^sms:/i.test(content)) return "SMS Message";
  return "Scanned Code";
}

function parseWifi(content: string) {
  const ssidMatch = content.match(/S:([^;]+)/i);
  const passMatch = content.match(/P:([^;]+)/i);
  const typeMatch = content.match(/T:([^;]+)/i);
  return {
    ssid: ssidMatch ? ssidMatch[1] : "",
    password: passMatch ? passMatch[1] : "",
    type: typeMatch ? typeMatch[1] : "WPA",
  };
}

export default function ScanScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const settings = useAppSelector((state) => state.settings);
  const [permission, requestPermission] = useCameraPermissions();

  const scanQrRef = useRef<View>(null);
  const [activeScanItem, setActiveScanItem] = useState<QRHistoryItem | null>(null);

  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanningGallery, setScanningGallery] = useState(false);
  const [manuallySaved, setManuallySaved] = useState(false);
  const [result, setResult] = useState<{
    content: string;
    format: string;
    imageUri?: string;
  } | null>(null);

  // Smooth scan line animation
  const [scanAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!scanned) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [scanned, scanAnim]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 210],
  });

  async function handleCopy(textToCopy?: string) {
    const text = textToCopy ?? result?.content;
    if (!text) return;
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Content copied to clipboard.");
  }

  async function handleShare() {
    if (!result) return;
    try {
      await Share.share({ message: result.content });
    } catch {
      // Ignore user dismissal
    }
  }

  async function processCloudUploadForScan(item: QRHistoryItem) {
    if (!user?.uid) return;

    try {
      let imageToUpload = "";

      if (item.imageUri) {
        console.log(
          `[ScanScreen] 🖼️ Uploading direct gallery image to Cloudinary CDN for user "${user.uid}"...`,
        );
        imageToUpload = item.imageUri;
      } else {
        console.log(
          `[ScanScreen] 🎨 Generating PNG format QR code for scanned content for user "${user.uid}"...`,
        );
        setActiveScanItem(item);
        await new Promise((resolve) => setTimeout(resolve, 200));

        if (scanQrRef.current) {
          imageToUpload = await captureRef(scanQrRef.current, {
            format: "png",
            quality: 1,
            result: "data-uri",
          });
        }
      }

      if (imageToUpload) {
        console.log(`[ScanScreen] ⏳ Uploading scan asset to Cloudinary CDN...`);
        const cldResult = await uploadQrToCloudinary(
          imageToUpload,
          item.title || "Scanned Code",
        );
        console.log(
          `[ScanScreen] ✅ Cloudinary upload complete! CDN URL: ${cldResult.secureUrl}`,
        );

        const changes = {
          cloudUrl: cldResult.secureUrl,
          publicId: cldResult.publicId,
          cloudAssetId: cldResult.assetId,
          cloudUploadedAt: cldResult.createdAt,
        };

        dispatch(updateHistoryItem({ id: item.id, changes }));
        await saveQrToCloudFirestore(user.uid, { ...item, ...changes });
        console.log(
          `[ScanScreen] ✅ Firestore document saved with Cloudinary asset link.`,
        );
      }
    } catch (err: any) {
      console.warn(
        `[ScanScreen] ⚠️ Cloudinary auto-upload skipped:`,
        err?.message || err,
      );
      if (user?.uid) {
        saveQrToCloudFirestore(user.uid, item).catch(() => {});
      }
    } finally {
      setActiveScanItem(null);
    }
  }

  function handleManualSave() {
    if (!result || manuallySaved) return;

    const newItem: QRHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      content: result.content,
      format: result.format,
      type: "scan",
      title: getTitle(result.content),
      isFavorite: false,
      createdAt: new Date().toISOString(),
      imageUri: result.imageUri,
    };

    dispatch(addHistoryItem(newItem));
    setManuallySaved(true);
    Alert.alert("Saved", "Scanned code has been saved to your history.");

    if (user?.uid) {
      void processCloudUploadForScan(newItem);
    }
  }

  async function handleOpenUrl(url: string) {
    Alert.alert(
      "Open External Link",
      `Do you want to safely open this URL?\n\n${url}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open in Browser",
          onPress: async () => {
            try {
              await WebBrowser.openBrowserAsync(url);
            } catch {
              Linking.openURL(url).catch(() => {
                Alert.alert("Error", "Could not open this web address.");
              });
            }
          },
        },
      ],
    );
  }

  function handleAction() {
    if (!result) return;
    const content = result.content;

    if (/^https?:\/\//i.test(content)) {
      void handleOpenUrl(content);
      return;
    }

    if (/^tel:/i.test(content)) {
      Linking.openURL(content).catch(() => {
        Alert.alert("Cannot call", "Could not launch phone dialer.");
      });
      return;
    }

    if (/^mailto:/i.test(content)) {
      Linking.openURL(content).catch(() => {
        Alert.alert("Cannot email", "Could not launch email app.");
      });
      return;
    }

    if (/^geo:/i.test(content)) {
      Linking.openURL(content).catch(() => {
        Alert.alert("Cannot open map", "Could not open map application.");
      });
      return;
    }

    if (/^sms:/i.test(content) || /^SMSTO:/i.test(content)) {
      const clean = content.replace(/^SMSTO:/i, "sms:");
      Linking.openURL(clean).catch(() => {
        Alert.alert("Cannot SMS", "Could not launch SMS app.");
      });
      return;
    }

    // Default: copy
    void handleCopy();
  }

  async function handleResult(
    content: string,
    format: string,
    directImageUri?: string,
  ) {
    if (!content) return;

    setScanned(true);
    setResult({ content, format, imageUri: directImageUri });

    if (settings.autoSaveScans) {
      const newItem: QRHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        content,
        format,
        type: "scan",
        title: getTitle(content),
        isFavorite: false,
        createdAt: new Date().toISOString(),
        imageUri: directImageUri,
      };

      dispatch(addHistoryItem(newItem));

      if (user?.uid) {
        void processCloudUploadForScan(newItem);
      }
    }

    if (settings.vibrateOnScan) {
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } catch {
        // Haptic feedback may not be available on all devices.
      }
    }
  }

  function onBarcodeScanned(event: BarcodeScanningResult) {
    if (scanned) return;
    void handleResult(event.data, String(event.type));
  }

  async function scanFromGallery() {
    try {
      setScanningGallery(true);

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Gallery permission required",
          "Allow photo access to scan a code from an image.",
        );
        return;
      }

      const image = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (image.canceled || !image.assets[0]) return;

      const codes = await Camera.scanFromURLAsync(
        image.assets[0].uri,
        BARCODE_TYPES,
      );

      if (codes.length === 0) {
        Alert.alert(
          "No code found",
          "Try an image where the QR code or barcode is clear and fully visible.",
        );
        return;
      }

      await handleResult(codes[0].data, String(codes[0].type), image.assets[0].uri);
    } catch (error) {
      console.error("Gallery scan failed:", error);
      Alert.alert("Scan failed", "Could not scan this image. Try another one.");
    } finally {
      setScanningGallery(false);
    }
  }

  function scanAgain() {
    setResult(null);
    setScanned(false);
    setManuallySaved(false);
  }

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-slate-950">
        <ActivityIndicator size="large" color="#7C3AED" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6 dark:bg-slate-950">
        <StatusBar style="auto" />
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950">
          <Ionicons name="camera-outline" size={32} color="#7C3AED" />
        </View>
        <Text className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          Camera permission needed
        </Text>
        <Text className="mb-6 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
          QR Studio needs camera access to scan QR codes and barcodes live.
        </Text>
        <Pressable
          onPress={() => void requestPermission()}
          accessibilityRole="button"
          className="rounded-2xl bg-violet-600 px-6 py-3.5 active:bg-violet-700"
        >
          <Text className="font-bold text-white">Enable Camera</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isUrl = result ? /^https?:\/\//i.test(result.content) : false;
  const isWifi = result ? /^WIFI:/i.test(result.content) : false;
  const wifiData = isWifi && result ? parseWifi(result.content) : null;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-2xl self-center">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-bold tracking-widest text-violet-600">
                QR STUDIO
              </Text>
              <Text className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                Scan Code
              </Text>
            </View>

            <Pressable
              onPress={() => setTorchEnabled((value) => !value)}
              accessibilityRole="button"
              accessibilityLabel="Toggle torch"
              accessibilityState={{ checked: torchEnabled }}
              className={`h-12 w-12 items-center justify-center rounded-2xl ${torchEnabled
                  ? "bg-violet-600"
                  : "bg-slate-100 dark:bg-slate-800"
                }`}
            >
              <Ionicons
                name={torchEnabled ? "flash" : "flash-outline"}
                size={22}
                color={torchEnabled ? "#FFFFFF" : "#7C3AED"}
              />
            </Pressable>
          </View>

          {/* Camera Viewfinder */}
          <View className="mb-6 overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-slate-900/30">
            <View className="relative h-[340px] items-center justify-center">
              {!scanned ? (
                <>
                  <CameraView
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                    facing="back"
                    enableTorch={torchEnabled}
                    barcodeScannerSettings={{
                      barcodeTypes: BARCODE_TYPES,
                    }}
                    onBarcodeScanned={onBarcodeScanned}
                  />

                  {/* Elegant Viewfinder Reticle */}
                  <View
                    pointerEvents="none"
                    className="relative h-60 w-60 items-center justify-center"
                  >
                    {/* Corner Reticles */}
                    <View className="absolute left-0 top-0 h-7 w-7 border-l-4 border-t-4 border-violet-400 rounded-tl-xl" />
                    <View className="absolute right-0 top-0 h-7 w-7 border-r-4 border-t-4 border-violet-400 rounded-tr-xl" />
                    <View className="absolute bottom-0 left-0 h-7 w-7 border-b-4 border-l-4 border-violet-400 rounded-bl-xl" />
                    <View className="absolute bottom-0 right-0 h-7 w-7 border-b-4 border-r-4 border-violet-400 rounded-br-xl" />

                    {/* Animated Smooth Scanning Line */}
                    <Animated.View
                      style={{
                        transform: [{ translateY }],
                        width: "90%",
                        height: 3,
                        backgroundColor: "#A78BFA",
                        shadowColor: "#8B5CF6",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.9,
                        shadowRadius: 8,
                        borderRadius: 2,
                      }}
                    />
                  </View>
                </>
              ) : (
                <View className="flex-1 items-center justify-center px-6">
                  <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                    <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                  </View>
                  <Text className="text-xl font-bold text-white">
                    Code Detected
                  </Text>
                  <Text className="mt-1 text-center text-xs text-slate-400">
                    Scanning paused. Review your result below.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Result Card */}
          {result && (
            <View className="mb-6 rounded-3xl border border-violet-200 bg-violet-50/70 p-5 dark:border-violet-900/60 dark:bg-violet-950/60">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                    <Ionicons
                      name={
                        isUrl
                          ? "globe-outline"
                          : isWifi
                            ? "wifi-outline"
                            : "qr-code"
                      }
                      size={16}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text className="font-bold text-slate-900 dark:text-white">
                    {getTitle(result.content)}
                  </Text>
                </View>

                <View className="rounded-full bg-violet-200/80 px-2.5 py-0.5 dark:bg-violet-900">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-violet-800 dark:text-violet-200">
                    {result.format}
                  </Text>
                </View>
              </View>

              {/* Wi-Fi Details breakdown if Wi-Fi QR */}
              {isWifi && wifiData && (
                <View className="mt-3 rounded-2xl bg-white/80 p-3.5 dark:bg-slate-900/80">
                  <Text className="text-xs text-slate-500 dark:text-slate-400">
                    Network (SSID):{" "}
                    <Text className="font-bold text-slate-900 dark:text-white">
                      {wifiData.ssid || "Unknown"}
                    </Text>
                  </Text>
                  {wifiData.password ? (
                    <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Password:{" "}
                      <Text className="font-mono font-bold text-slate-900 dark:text-white">
                        {wifiData.password}
                      </Text>
                    </Text>
                  ) : null}
                </View>
              )}

              <Text
                selectable
                className="mt-3 text-base leading-6 text-slate-800 dark:text-slate-200"
              >
                {result.content}
              </Text>

              <Text className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {settings.autoSaveScans || manuallySaved
                  ? "✓ Saved to local guest history."
                  : "Auto-save is off. Tap Save to record this scan."}
              </Text>

              {/* Contextual Action Buttons */}
              <View className="mt-4 flex-row flex-wrap gap-2">
                {isUrl && (
                  <Pressable
                    onPress={handleAction}
                    accessibilityRole="button"
                    className="min-h-11 flex-1 flex-row items-center justify-center rounded-xl bg-violet-600 px-3 py-2.5 active:bg-violet-700"
                  >
                    <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                    <Text className="ml-1.5 text-xs font-bold text-white">
                      Open Link
                    </Text>
                  </Pressable>
                )}

                {isWifi && wifiData?.password ? (
                  <Pressable
                    onPress={() => void handleCopy(wifiData.password)}
                    accessibilityRole="button"
                    className="min-h-11 flex-1 flex-row items-center justify-center rounded-xl bg-violet-600 px-3 py-2.5 active:bg-violet-700"
                  >
                    <Ionicons name="key-outline" size={16} color="#FFFFFF" />
                    <Text className="ml-1.5 text-xs font-bold text-white">
                      Copy Password
                    </Text>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={() => void handleCopy()}
                  accessibilityRole="button"
                  className="min-h-11 flex-1 flex-row items-center justify-center rounded-xl bg-white px-3 py-2.5 active:bg-slate-100 dark:bg-slate-900 dark:active:bg-slate-800"
                >
                  <Ionicons name="copy-outline" size={16} color="#7C3AED" />
                  <Text className="ml-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    Copy
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => void handleShare()}
                  accessibilityRole="button"
                  className="min-h-11 flex-1 flex-row items-center justify-center rounded-xl bg-white px-3 py-2.5 active:bg-slate-100 dark:bg-slate-900 dark:active:bg-slate-800"
                >
                  <Ionicons name="share-social-outline" size={16} color="#7C3AED" />
                  <Text className="ml-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    Share
                  </Text>
                </Pressable>

                {!settings.autoSaveScans && !manuallySaved && (
                  <Pressable
                    onPress={handleManualSave}
                    accessibilityRole="button"
                    className="min-h-11 flex-1 flex-row items-center justify-center rounded-xl bg-violet-100 px-3 py-2.5 active:bg-violet-200 dark:bg-violet-900 dark:active:bg-violet-800"
                  >
                    <Ionicons name="bookmark-outline" size={16} color="#7C3AED" />
                    <Text className="ml-1.5 text-xs font-bold text-violet-700 dark:text-violet-200">
                      Save
                    </Text>
                  </Pressable>
                )}
              </View>

              <Pressable
                onPress={scanAgain}
                accessibilityRole="button"
                className="mt-3 flex-row items-center justify-center rounded-xl bg-slate-900 py-3 active:bg-slate-800 dark:bg-white dark:active:bg-slate-200"
              >
                <Ionicons name="refresh" size={16} color="#A78BFA" />
                <Text className="ml-2 text-xs font-bold text-white dark:text-slate-900">
                  Scan Another Code
                </Text>
              </Pressable>
            </View>
          )}

          {/* Scan from Gallery Button */}
          <Pressable
            disabled={scanningGallery}
            onPress={() => void scanFromGallery()}
            accessibilityRole="button"
            className="mb-4 flex-row items-center justify-center rounded-2xl bg-slate-100 py-4 active:bg-slate-200 dark:bg-slate-900 dark:active:bg-slate-800"
          >
            {scanningGallery ? (
              <ActivityIndicator color="#7C3AED" />
            ) : (
              <>
                <Ionicons name="images-outline" size={20} color="#7C3AED" />
                <Text className="ml-2.5 font-bold text-slate-900 dark:text-white">
                  Scan from Gallery Image
                </Text>
              </>
            )}
          </Pressable>

          <Text className="text-center text-xs text-slate-400">
            Works 100% offline. Scanned codes are safely stored on this device.
          </Text>
        </View>
      </ScrollView>

      {/* Off-screen QR rendering canvas for generating PNG format assets for Cloudinary upload */}
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
        {activeScanItem ? (
          <View
            ref={scanQrRef}
            collapsable={false}
            style={{
              width: 240,
              height: 240,
              backgroundColor: activeScanItem.backgroundColor || "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <QRCode
              value={activeScanItem.content.trim() || " "}
              size={200}
              color={activeScanItem.foregroundColor || "#111827"}
              backgroundColor={activeScanItem.backgroundColor || "#FFFFFF"}
              ecl={activeScanItem.ecl || "M"}
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

