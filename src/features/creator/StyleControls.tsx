import { Text, View } from "react-native";
import { ColorSwatch } from "@/features/creator/ColorSwatch";

const FOREGROUND_COLORS = [
  "#111827",
  "#7C3AED",
  "#2563EB",
  "#059669",
  "#DC2626",
  "#DB2777",
];

const BACKGROUND_COLORS = [
  "#FFFFFF",
  "#F3F4F6",
  "#FEF3C7",
  "#DBEAFE",
  "#D1FAE5",
  "#FCE7F3",
];

type StyleControlsProps = {
  foregroundColor: string;
  backgroundColor: string;
  onForegroundChange: (color: string) => void;
  onBackgroundChange: (color: string) => void;
};

export function StyleControls({
  foregroundColor,
  backgroundColor,
  onForegroundChange,
  onBackgroundChange,
}: StyleControlsProps) {
  return (
    <View className="gap-5 rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <View>
        <Text className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
          QR Color
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {FOREGROUND_COLORS.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              selected={foregroundColor === color}
              onPress={() => onForegroundChange(color)}
              label={color}
            />
          ))}
        </View>
      </View>

      <View>
        <Text className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
          Background Color
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {BACKGROUND_COLORS.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              selected={backgroundColor === color}
              onPress={() => onBackgroundChange(color)}
              label={color}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
