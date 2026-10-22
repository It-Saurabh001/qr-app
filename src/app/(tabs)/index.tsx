import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppSelector } from "@/store/hooks";
import { historySelectors, type QRHistoryItem } from "@/store/slices/historySlice";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, status } = useAppSelector((state) => state.auth);
  const guestActive = useAppSelector((state) => state.localGuest.active);
  const history = useAppSelector((state) =>
    historySelectors.selectAll(state.history),
  );

  const isAuthenticated = status === "authenticated" && Boolean(user);

  const greeting = user?.displayName
    ? `Hello, ${user.displayName.split(" ")[0]}!`
    : user?.email
      ? `Hello, ${user.email.split("@")[0]}!`
      : guestActive
        ? "Hello, Guest!"
        : "Hello there!";

  const stats = useMemo(() => {
    const scanned = history.filter((i) => i.type === "scan").length;
    const created = history.filter((i) => i.type === "create").length;
    const favorites = history.filter((i) => i.isFavorite).length;
    return { scanned, created, favorites };
  }, [history]);

  const recentItems = useMemo(() => history.slice(0, 3), [history]);

  const handleCopy = async (item: QRHistoryItem) => {
    await Clipboard.setStringAsync(item.content);
    Alert.alert("Copied", `"${item.title ?? item.format}" copied to clipboard.`);
  };

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
              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-bold tracking-widest text-violet-600">
                  QR STUDIO
                </Text>
                {isAuthenticated ? (
                  <View className="rounded-full bg-emerald-100 px-2.5 py-0.5 dark:bg-emerald-950">
                    <Text className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                      ONLINE
                    </Text>
                  </View>
                ) : guestActive ? (
                  <View className="rounded-full bg-amber-100 px-2.5 py-0.5 dark:bg-amber-950">
                    <Text className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      OFFLINE GUEST
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                {greeting}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/settings")}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 active:bg-slate-200 dark:bg-slate-900 dark:active:bg-slate-800"
            >
              <Ionicons name="settings-outline" size={22} color="#7C3AED" />
            </Pressable>
          </View>

          {/* Hero Banner */}
          <View className="mb-6 overflow-hidden rounded-3xl bg-violet-600 p-6 shadow-lg shadow-violet-500/20">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-xs font-semibold tracking-wider uppercase text-violet-200">
                  Offline QR Toolkit
                </Text>
                <Text className="mb-2 mt-1 text-2xl font-bold text-white">
                  Scan. Create. Save.
                </Text>
                <Text className="mb-5 text-sm leading-5 text-violet-100">
                  Fast camera scanner and high quality QR generator with instant offline history.
                </Text>
              </View>

              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <Ionicons name="qr-code-outline" size={32} color="#FFFFFF" />
              </View>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => router.push("/scan")}
                accessibilityRole="button"
                className="flex-1 flex-row items-center justify-center rounded-2xl bg-white py-3.5 active:bg-violet-50"
              >
                <Ionicons name="camera-outline" size={18} color="#7C3AED" />
                <Text className="ml-2 font-bold text-violet-700">
                  Scan QR
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/create")}
                accessibilityRole="button"
                className="flex-1 flex-row items-center justify-center rounded-2xl bg-violet-700 py-3.5 active:bg-violet-800"
              >
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text className="ml-2 font-bold text-white">
                  Create QR
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Quick Stats Bar */}
          <View className="mb-6 flex-row gap-3">
            <Pressable
              onPress={() => router.push("/history")}
              accessibilityRole="button"
              className="flex-1 items-center rounded-2xl border border-slate-100 bg-slate-50 p-3.5 active:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            >
              <Text className="text-2xl font-extrabold text-violet-600 dark:text-violet-400">
                {stats.scanned}
              </Text>
              <Text className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Scanned
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/history")}
              accessibilityRole="button"
              className="flex-1 items-center rounded-2xl border border-slate-100 bg-slate-50 p-3.5 active:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            >
              <Text className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                {stats.created}
              </Text>
              <Text className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Created
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/history")}
              accessibilityRole="button"
              className="flex-1 items-center rounded-2xl border border-slate-100 bg-slate-50 p-3.5 active:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            >
              <Text className="text-2xl font-extrabold text-amber-500 dark:text-amber-400">
                {stats.favorites}
              </Text>
              <Text className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Favorites
              </Text>
            </Pressable>
          </View>

          {/* Quick Tools Grid */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">
              Quick Actions
            </Text>
            <Text className="text-xs text-slate-400">Tools</Text>
          </View>

          <View className="mb-6 flex-row flex-wrap gap-3">
            <Pressable
              onPress={() => router.push("/scan")}
              accessibilityRole="button"
              className="w-[48%] flex-grow rounded-3xl border border-slate-100 bg-white p-4 active:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:active:bg-slate-800"
            >
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950">
                <Ionicons name="scan" size={24} color="#7C3AED" />
              </View>
              <Text className="text-base font-bold text-slate-900 dark:text-white">
                Scan QR
              </Text>
              <Text className="mt-1 text-xs leading-4 text-slate-500 dark:text-slate-400">
                Camera or gallery image
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/create")}
              accessibilityRole="button"
              className="w-[48%] flex-grow rounded-3xl border border-slate-100 bg-white p-4 active:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:active:bg-slate-800"
            >
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950">
                <Ionicons name="add-circle" size={24} color="#2563EB" />
              </View>
              <Text className="text-base font-bold text-slate-900 dark:text-white">
                Create QR
              </Text>
              <Text className="mt-1 text-xs leading-4 text-slate-500 dark:text-slate-400">
                URLs, Wi-Fi, Contacts & more
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/history")}
              accessibilityRole="button"
              className="w-[48%] flex-grow rounded-3xl border border-slate-100 bg-white p-4 active:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:active:bg-slate-800"
            >
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950">
                <Ionicons name="time" size={24} color="#D97706" />
              </View>
              <Text className="text-base font-bold text-slate-900 dark:text-white">
                History
              </Text>
              <Text className="mt-1 text-xs leading-4 text-slate-500 dark:text-slate-400">
                Saved codes & favorites
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/settings")}
              accessibilityRole="button"
              className="w-[48%] flex-grow rounded-3xl border border-slate-100 bg-white p-4 active:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:active:bg-slate-800"
            >
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950">
                <Ionicons name="options" size={24} color="#059669" />
              </View>
              <Text className="text-base font-bold text-slate-900 dark:text-white">
                Preferences
              </Text>
              <Text className="mt-1 text-xs leading-4 text-slate-500 dark:text-slate-400">
                Theme, sound & haptics
              </Text>
            </Pressable>
          </View>

          {/* Recent Activity Section */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Activity
            </Text>
            {history.length > 0 && (
              <Pressable
                onPress={() => router.push("/history")}
                accessibilityRole="button"
              >
                <Text className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  View All ({history.length}) →
                </Text>
              </Pressable>
            )}
          </View>

          {recentItems.length > 0 ? (
            <View className="gap-3">
              {recentItems.map((item) => {
                const isScan = item.type === "scan";
                const title = item.title ?? item.format;

                return (
                  <View
                    key={item.id}
                    className="flex-row items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <View className="mr-3 flex-1 flex-row items-center">
                      <View
                        className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${isScan
                            ? "bg-violet-100 dark:bg-violet-950"
                            : "bg-blue-100 dark:bg-blue-950"
                          }`}
                      >
                        <Ionicons
                          name={isScan ? "qr-code" : "color-wand"}
                          size={20}
                          color={isScan ? "#7C3AED" : "#2563EB"}
                        />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center gap-1.5">
                          <Text
                            numberOfLines={1}
                            className="font-bold text-slate-900 dark:text-white"
                          >
                            {title}
                          </Text>
                          {item.isFavorite && (
                            <Ionicons name="star" size={12} color="#EAB308" />
                          )}
                        </View>

                        <Text
                          numberOfLines={1}
                          className="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
                        >
                          {item.content}
                        </Text>

                        <Text className="mt-1 text-[10px] text-slate-400">
                          {isScan ? "Scanned" : "Created"} • {formatDate(item.createdAt)}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => void handleCopy(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Copy ${title}`}
                      className="h-10 w-10 items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
                    >
                      <Ionicons name="copy-outline" size={16} color="#64748B" />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950">
                <Ionicons name="sparkles" size={22} color="#7C3AED" />
              </View>
              <Text className="text-base font-bold text-slate-900 dark:text-white">
                No activity yet
              </Text>
              <Text className="mt-1 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                Codes you scan or generate will appear here and persist locally in guest mode.
              </Text>

              <Pressable
                onPress={() => router.push("/scan")}
                accessibilityRole="button"
                className="mt-4 rounded-xl bg-violet-600 px-5 py-2.5 active:bg-violet-700"
              >
                <Text className="text-xs font-bold text-white">
                  Scan your first QR
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

