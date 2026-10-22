import { useCallback } from "react";
import { Alert, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library/legacy";
import * as Sharing from "expo-sharing";
import type { RefObject } from "react";

//import * as MediaLibrary from "expo-media-library/legacy";    note is legacy ko change krna padega build time

export function useQrExport(qrRef: RefObject<View | null>) {
  const captureQr = useCallback(async () => {
    if (!qrRef.current) {
      throw new Error("QR preview is not ready.");
    }

    return captureRef(qrRef.current, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });
  }, [qrRef]);

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

      const uri = await captureQr();
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

      const uri = await captureQr();
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

  return { saveQr, shareQr };
}
