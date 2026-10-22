import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const foregroundColors = [
  { name: "Black", value: "#111827" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Blue", value: "#2563EB" },
  { name: "Green", value: "#047857" },
];

const backgroundColors = [
  { name: "White", value: "#FFFFFF" },
  { name: "Lavender", value: "#F3E8FF" },
  { name: "Blue tint", value: "#DBEAFE" },
];

export default function CreatePreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; value?: string }>();

  const type = Array.isArray(params.type) ? params.type[0] : params.type;
  const value = Array.isArray(params.value) ? params.value[0] : params.value;

  const [foreground, setForeground] = useState("#111827");
  const [background, setBackground] = useState("#FFFFFF");

  const renderPalette = (
    title: string,
    colors: { name: string; value: string }[],
    selected: string,
    onSelect: (value: string) => void,
  ) => (
    <View className="mb-6">
      <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
        {title}
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = selected === color.value;

          return (
            <Pressable
              key={color.value}
              onPress={() => onSelect(color.value)}
              accessibilityRole="button"
              accessibilityLabel={`${title}: ${color.name}`}
              accessibilityState={{ selected: isSelected }}
              className={`items-center rounded-2xl border p-3 ${
                isSelected
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-950"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <View
                className="mb-2 h-9 w-9 rounded-full border border-slate-300"
                style={{ backgroundColor: color.value }}
              />
              <Text className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {color.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900"
          >
            <Text className="text-2xl text-slate-900 dark:text-white">‹</Text>
          </Pressable>

          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              QR Preview
            </Text>
            <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Customize your design
            </Text>
          </View>
        </View>

        {/* Preview placeholder */}
        <View className="mb-8 items-center rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <View
            className="h-56 w-56 items-center justify-center rounded-2xl p-5"
            style={{ backgroundColor: background }}
          >
            <View
              className="h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed"
              style={{ borderColor: foreground }}
            >
              <Text style={{ color: foreground, fontSize: 76 }}>▦</Text>
              <Text
                style={{ color: foreground }}
                className="mt-1 text-xs font-semibold"
              >
                QR PREVIEW
              </Text>
            </View>
          </View>

          <Text className="mt-5 text-base font-bold text-slate-900 dark:text-white">
            Your QR design
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-slate-500 dark:text-slate-400">
            This is a placeholder, not a scannable QR code. Real QR rendering
            will be connected in the feature stage.
          </Text>
        </View>

        {renderPalette("QR color", foregroundColors, foreground, setForeground)}

        {renderPalette(
          "Background color",
          backgroundColors,
          background,
          setBackground,
        )}

        <View className="mb-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <Text className="text-sm font-semibold text-slate-900 dark:text-white">
            Content summary
          </Text>
          <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Type: {type ?? "text"}
          </Text>
          <Text
            numberOfLines={3}
            className="mt-2 text-sm leading-5 text-slate-700 dark:text-slate-300"
          >
            {value ?? "No content provided"}
          </Text>
        </View>

        <Pressable
          onPress={() => {}}
          accessibilityRole="button"
          className="mb-3 items-center rounded-2xl bg-violet-600 py-4"
        >
          <Text className="font-bold text-white">Save QR Code</Text>
        </Pressable>

        <Pressable
          onPress={() => {}}
          accessibilityRole="button"
          className="items-center rounded-2xl border border-slate-200 py-4 dark:border-slate-700"
        >
          <Text className="font-bold text-slate-900 dark:text-white">
            Share QR Code
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
