import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppSelector } from "@/store/hooks";
import { historySelectors } from "@/store/slices/historySlice";

export default function ScanResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const historyItem = useAppSelector((state) =>
    id ? historySelectors.selectById(state.history, id) : undefined,
  );

  const value = historyItem?.content ?? "https://example.com";
  const format = historyItem?.format ?? "QR";
  const title = historyItem?.title ?? "Scanned Code";
  const isUrl = /^https?:\/\//i.test(value);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);
    Alert.alert("Copied", "Content copied to clipboard.");
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: value });
    } catch {
      // Ignore user dismissal
    }
  };

  const handleOpenLink = async () => {
    Alert.alert(
      "Open External Link",
      `Do you want to safely open this URL?\n\n${value}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open in Browser",
          onPress: async () => {
            try {
              await WebBrowser.openBrowserAsync(value);
            } catch {
              Alert.alert("Error", "Could not open this web address.");
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
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-2xl self-center">
          {/* Header */}
          <View className="mb-6 flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="mr-3.5 h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 active:bg-slate-200 dark:bg-slate-900 dark:active:bg-slate-800"
            >
              <Ionicons name="arrow-back" size={22} color="#7C3AED" />
            </Pressable>

            <View>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                Scan Details
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                Review your scanned content
              </Text>
            </View>
          </View>

          {/* Success status */}
          <View className="mb-6 items-center rounded-3xl bg-emerald-50 px-6 py-6 dark:bg-emerald-950">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
              <Ionicons name="checkmark-circle" size={36} color="#059669" />
            </View>

            <Text className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </Text>
            <Text className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {format} Format • Recorded locally
            </Text>
          </View>

          {/* Scanned value */}
          <View className="mb-6 rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Scanned Content
            </Text>

            <Text
              selectable
              className="mt-3 text-base leading-6 text-slate-900 dark:text-white"
            >
              {value}
            </Text>

            <View className="mt-4 flex-row gap-2">
              <Pressable
                onPress={handleCopy}
                accessibilityRole="button"
                className="flex-1 flex-row items-center justify-center rounded-xl bg-slate-100 py-3 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
              >
                <Ionicons name="copy-outline" size={16} color="#7C3AED" />
                <Text className="ml-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  Copy
                </Text>
              </Pressable>

              <Pressable
                onPress={handleShare}
                accessibilityRole="button"
                className="flex-1 flex-row items-center justify-center rounded-xl bg-slate-100 py-3 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
              >
                <Ionicons name="share-social-outline" size={16} color="#7C3AED" />
                <Text className="ml-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  Share
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Safety note */}
          {isUrl && (
            <View className="mb-4 flex-row items-start rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#D97706"
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <Text className="flex-1 text-xs leading-5 text-amber-800 dark:text-amber-300">
                Always verify the web domain address before opening. Scanned
                links are never automatically launched.
              </Text>
            </View>
          )}

          {/* AI Scan Analysis Button */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/ai/analyze",
                params: { id, content: value, format },
              })
            }
            accessibilityRole="button"
            className="mb-4 flex-row items-center justify-between rounded-3xl border border-violet-200 bg-violet-50/80 p-4 active:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/40"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 shadow-sm shadow-violet-500/25">
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </View>
              <View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-sm font-bold text-slate-900 dark:text-white">
                    Analyze with Gemini AI
                  </Text>
                  <View className="rounded-full bg-violet-200 px-1.5 py-0.5 dark:bg-violet-900">
                    <Text className="text-[9px] font-bold text-violet-800 dark:text-violet-200">
                      ONLINE
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  Check safety risk, phishing threat & explanation
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#7C3AED" />
          </Pressable>

          {/* Actions */}
          {isUrl && (
            <Pressable
              onPress={handleOpenLink}
              accessibilityRole="button"
              className="mb-3 flex-row items-center justify-center rounded-2xl bg-violet-600 py-4 active:bg-violet-700"
            >
              <Ionicons name="open-outline" size={18} color="#FFFFFF" />
              <Text className="ml-2 font-bold text-white">Open in Browser</Text>
            </Pressable>
          )}

          <Pressable
            onPress={() => router.replace("/(tabs)/scan")}
            accessibilityRole="button"
            className="flex-row items-center justify-center rounded-2xl border border-slate-200 py-3.5 dark:border-slate-800"
          >
            <Ionicons name="camera-outline" size={18} color="#7C3AED" />
            <Text className="ml-2 font-bold text-slate-900 dark:text-white">
              Scan Another Code
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

