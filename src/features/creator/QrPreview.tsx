import type { RefObject } from "react";
import { useMemo } from "react";
import { Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type QrPreviewProps = {
  value?: string;
  title?: string;
  foregroundColor?: string;
  backgroundColor?: string;
  ecl?: "L" | "M" | "Q" | "H";
  qrRef: RefObject<View | null>;
};

export function QrPreview({
  value = "",
  title = "QR Preview",
  foregroundColor = "#111827",
  backgroundColor = "#FFFFFF",
  ecl = "M",
  qrRef,
}: QrPreviewProps) {
  const payload = useMemo(() => value.trim(), [value]);

  const isValidColor = (color: string) => /^#[0-9a-fA-F]{6}$/.test(color);

  const foreground = isValidColor(foregroundColor)
    ? foregroundColor
    : "#111827";

  const background = isValidColor(backgroundColor)
    ? backgroundColor
    : "#FFFFFF";

  return (
    <View className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <Text className="mb-4 text-base font-bold text-gray-900 dark:text-white">
        {title}
      </Text>

      <View
        ref={qrRef}
        collapsable={false}
        className="items-center justify-center self-center rounded-2xl p-5"
        style={{ backgroundColor: background }}
      >
        {payload.length > 0 ? (
          <QRCode
            value={payload}
            size={190}
            color={foreground}
            backgroundColor={background}
            ecl={ecl}
          />
        ) : (
          <View className="h-[190px] w-[190px] items-center justify-center">
            <Text className="text-center text-sm" style={{ color: foreground }}>
              Enter content to generate QR
            </Text>
          </View>
        )}
      </View>

      <Text
        className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400"
        numberOfLines={3}
      >
        {payload || "Your content will appear here"}
      </Text>

      <Text className="mt-2 text-center text-xs text-gray-400">
        Scan this QR code with another device to test it.
      </Text>
    </View>
  );
}
