import * as MediaLibrary from "expo-media-library/legacy";
import * as Sharing from "expo-sharing";
import type { RefObject } from "react";
import { useCallback } from "react";
import { Alert, View } from "react-native";
import { captureRef } from "react-native-view-shot";

//import * as MediaLibrary from "expo-media-library/legacy";    note is legacy ko change krna padega build time

export function useQrExport(qrRef: RefObject<View | null>) {
  const captureQr = useCallback(
    async (result: "tmpfile" | "data-uri" = "tmpfile") => {
      console.log(`[QrExport] 📸 Capturing QR code snapshot as format "${result}"...`);
      if (!qrRef.current) {
        console.error("[QrExport] ❌ QR preview ref is not available.");
        throw new Error("QR preview is not ready.");
      }

      try {
        const uri = await captureRef(qrRef.current, {
          format: "png",
          quality: 1,
          result,
        });
        console.log("[QrExport] ✅ QR snapshot generated successfully.");
        return uri;
      } catch (captureErr) {
        console.error("[QrExport] ❌ captureRef failed:", captureErr);
        throw captureErr;
      }
    },
    [qrRef],
  );

  const saveQr = useCallback(async () => {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true);

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Allow photo access to save your QR code.",
        );
        return;
      }

      const uri = await captureQr("tmpfile");
      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("Success", "QR code saved to your gallery.");
    } catch (error) {
      console.error("QR save failed:", error);
      Alert.alert("Error", "Could not save the QR code.");
    }
  }, [captureQr]);

  const shareQr = useCallback(async () => {
    try {
      const available = await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert("Unavailable", "Sharing is not available on this device.");
        return;
      }

      const uri = await captureQr("tmpfile");
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share QR code",
        UTI: "public.png",
      });
    } catch (error) {
      console.error("QR sharing failed:", error);
      Alert.alert("Error", "Could not share the QR code.");
    }
  }, [captureQr]);

  return { captureQr, saveQr, shareQr };
}
