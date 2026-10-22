import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import { useQrExport } from "@/features/creator/useQrExport";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearHistory,
  historySelectors,
  removeHistoryItem,
  toggleFavorite,
  type QRHistoryItem,
} from "@/store/slices/historySlice";

const filters = ["All", "Scanned", "Created", "Favorites"] as const;
type HistoryFilter = (typeof filters)[number];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function HistoryScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const history = useAppSelector((state) =>
    historySelectors.selectAll(state.history),
  );

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("All");
  const [selectedItem, setSelectedItem] = useState<QRHistoryItem | null>(null);

  const modalQrRef = useRef<View>(null);
  const { saveQr, shareQr } = useQrExport(modalQrRef);

  const visibleHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return history.filter((item) => {
      const title = item.title ?? item.format;
      const matchesSearch =
        title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.format.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Scanned" && item.type === "scan") ||
        (activeFilter === "Created" && item.type === "create") ||
        (activeFilter === "Favorites" && item.isFavorite);

      return matchesSearch && matchesFilter;
    });
  }, [history, search, activeFilter]);

  async function handleCopy(content: string) {
    await Clipboard.setStringAsync(content);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics optional
    }
    Alert.alert("Copied", "Content copied to clipboard.");
  }

  async function handleShare(content: string) {
    try {
      await Share.share({ message: content });
    } catch {
      // Ignore user dismissal
    }
  }

  function confirmDelete(id: string, title: string) {
    Alert.alert("Delete item?", `Remove "${title}" from history?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => dispatch(removeHistoryItem(id)),
      },
    ]);
  }

  function confirmClearHistory() {
    if (history.length === 0) return;

    Alert.alert(
      "Clear history?",
      "This will remove all locally saved scans and creations.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear all",
          style: "destructive",
          onPress: () => dispatch(clearHistory()),
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-2xl self-center">
          {/* Header with Back Button */}
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
                  QR STUDIO
                </Text>
                <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                  History
                </Text>
              </View>
            </View>

            {history.length > 0 && (
              <Pressable
                onPress={confirmClearHistory}
                accessibilityRole="button"
                className="rounded-xl bg-red-50 px-3 py-2 active:bg-red-100 dark:bg-red-950 dark:active:bg-red-900"
              >
                <Text className="text-xs font-bold text-red-600 dark:text-red-400">
                  Clear All
                </Text>
              </Pressable>
            )}
          </View>

          <Text className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            Locally saved scans and created codes on this device. Tap any card to view the generated QR code.
          </Text>

          {/* Search Box */}
          <View className="mb-4 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 dark:border-slate-800 dark:bg-slate-900">
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search history by content or type..."
              placeholderTextColor="#94A3B8"
              accessibilityLabel="Search history"
              className="min-h-12 flex-1 px-2.5 text-sm text-slate-900 dark:text-white"
            />
            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch("")}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                className="p-1"
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          {/* Filters ScrollView */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-5"
            contentContainerStyle={{ gap: 8 }}
          >
            {filters.map((filter) => {
              const selected = activeFilter === filter;

              return (
                <Pressable
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  className={`rounded-full px-4 py-2 ${selected
                      ? "bg-violet-600"
                      : "bg-slate-100 dark:bg-slate-900"
                    }`}
                >
                  <Text
                    className={`text-xs font-semibold ${selected
                        ? "text-white"
                        : "text-slate-600 dark:text-slate-300"
                      }`}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* History Count Indicator */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-slate-900 dark:text-white">
              {activeFilter} Records
            </Text>
            <Text className="text-xs text-slate-400">
              {visibleHistory.length} of {history.length}
            </Text>
          </View>

          {/* List or Empty State */}
          {visibleHistory.length > 0 ? (
            <View className="gap-3">
              {visibleHistory.map((item) => {
                const title = item.title ?? item.format;
                const isScan = item.type === "scan";

                return (
                  <View
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
                  >
                    {/* Tappable Card Header & Content */}
                    <Pressable
                      onPress={() => setSelectedItem(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`View generated QR for ${title}`}
                      className="flex-row items-start active:opacity-75"
                    >
                      <View
                        className={`mr-3.5 h-11 w-11 items-center justify-center rounded-xl ${isScan
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

                      <View className="min-w-0 flex-1">
                        <View className="flex-row items-center justify-between">
                          <Text
                            numberOfLines={1}
                            className="mr-2 flex-1 text-base font-bold text-slate-900 dark:text-white"
                          >
                            {title}
                          </Text>
                          <Text className="shrink-0 text-[10px] text-slate-400">
                            {formatDate(item.createdAt)}
                          </Text>
                        </View>

                        <Text
                          numberOfLines={2}
                          className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300"
                        >
                          {item.content}
                        </Text>

                        <View className="mt-2.5 flex-row items-center justify-between">
                          <View className="mr-2 flex-1 flex-row items-center gap-1.5">
                            <View className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                              <Text
                                numberOfLines={1}
                                className="text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400"
                              >
                                {item.format}
                              </Text>
                            </View>
                            <Text className="shrink-0 text-[10px] text-slate-400">
                              • {isScan ? "Scanned" : "Created"}
                            </Text>
                          </View>

                          <View className="shrink-0 flex-row items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 dark:bg-violet-950/60">
                            <Ionicons
                              name="qr-code-outline"
                              size={11}
                              color="#7C3AED"
                            />
                            <Text className="text-[10px] font-bold text-violet-700 dark:text-violet-300">
                              Tap to view QR
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Pressable>

                    {/* Action Bar: Balanced Left (View QR) and Right (Action Icon Cluster) */}
                    <View className="mt-3.5 flex-row items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                      <Pressable
                        onPress={() => setSelectedItem(item)}
                        accessibilityRole="button"
                        accessibilityLabel={`View QR ${title}`}
                        className="flex-row items-center rounded-xl bg-violet-600 px-3 py-1.5 active:bg-violet-700"
                      >
                        <Ionicons
                          name="qr-code"
                          size={13}
                          color="#FFFFFF"
                        />
                        <Text className="ml-1.5 text-xs font-bold text-white">
                          View QR
                        </Text>
                      </Pressable>

                      <View className="flex-row items-center gap-1.5">
                        <Pressable
                          onPress={() => void handleCopy(item.content)}
                          accessibilityRole="button"
                          accessibilityLabel={`Copy ${title}`}
                          className="h-8 w-8 items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
                        >
                          <Ionicons
                            name="copy-outline"
                            size={14}
                            color="#64748B"
                          />
                        </Pressable>

                        <Pressable
                          onPress={() => void handleShare(item.content)}
                          accessibilityRole="button"
                          accessibilityLabel={`Share ${title}`}
                          className="h-8 w-8 items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
                        >
                          <Ionicons
                            name="share-social-outline"
                            size={14}
                            color="#64748B"
                          />
                        </Pressable>

                        <Pressable
                          onPress={() => dispatch(toggleFavorite(item.id))}
                          accessibilityRole="button"
                          accessibilityLabel={
                            item.isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          className="h-8 w-8 items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
                        >
                          <Ionicons
                            name={item.isFavorite ? "star" : "star-outline"}
                            size={14}
                            color={item.isFavorite ? "#EAB308" : "#94A3B8"}
                          />
                        </Pressable>

                        <Pressable
                          onPress={() => confirmDelete(item.id, title)}
                          accessibilityRole="button"
                          accessibilityLabel={`Delete ${title}`}
                          className="h-8 w-8 items-center justify-center rounded-xl bg-red-50 active:bg-red-100 dark:bg-red-950 dark:active:bg-red-900"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={14}
                            color="#EF4444"
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="items-center rounded-3xl bg-slate-50 px-6 py-10 dark:bg-slate-900">
              <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950">
                <Ionicons name="file-tray-outline" size={28} color="#7C3AED" />
              </View>

              <Text className="text-base font-bold text-slate-900 dark:text-white">
                {history.length === 0 ? "No history yet" : "No matching items"}
              </Text>

              <Text className="mt-1.5 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                {history.length === 0
                  ? "Scan a QR code or create one and it will automatically appear here."
                  : "Try clearing your search query or choosing another filter."}
              </Text>

              {(search.length > 0 || activeFilter !== "All") && (
                <Pressable
                  onPress={() => {
                    setSearch("");
                    setActiveFilter("All");
                  }}
                  accessibilityRole="button"
                  className="mt-4 rounded-xl bg-violet-600 px-4 py-2.5 active:bg-violet-700"
                >
                  <Text className="text-xs font-bold text-white">
                    Clear Filters
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* QR Preview Modal (Visual QR Code + Given Input) */}
      <Modal
        visible={Boolean(selectedItem)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
        statusBarTranslucent
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/60 px-5 py-6"
          onPress={() => setSelectedItem(null)}
        >
          <Pressable
            className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onPress={(e) => e.stopPropagation()}
          >
            {selectedItem && (
              <>
                {/* Header */}
                <View className="flex-row items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${selectedItem.type === "scan"
                          ? "bg-violet-100 dark:bg-violet-950/80"
                          : "bg-blue-100 dark:bg-blue-950/80"
                        }`}
                    >
                      <Ionicons
                        name={
                          selectedItem.type === "scan"
                            ? "qr-code"
                            : "color-wand"
                        }
                        size={12}
                        color={
                          selectedItem.type === "scan" ? "#7C3AED" : "#2563EB"
                        }
                      />
                      <Text
                        className={`text-[11px] font-bold ${selectedItem.type === "scan"
                            ? "text-violet-700 dark:text-violet-300"
                            : "text-blue-700 dark:text-blue-300"
                          }`}
                      >
                        {selectedItem.type === "scan"
                          ? "Scanned Code"
                          : "Created QR"}
                      </Text>
                    </View>

                    <View className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                      <Text className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">
                        {selectedItem.format}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => setSelectedItem(null)}
                    accessibilityRole="button"
                    accessibilityLabel="Close QR preview"
                    className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
                  >
                    <Ionicons name="close" size={18} color="#64748B" />
                  </Pressable>
                </View>

                {/* Generated QR Code View */}
                <View className="my-4 items-center justify-center">
                  <View
                    ref={modalQrRef}
                    collapsable={false}
                    style={{
                      backgroundColor:
                        selectedItem.backgroundColor || "#FFFFFF",
                    }}
                    className="items-center justify-center rounded-2xl border border-slate-200/80 p-4 shadow-sm dark:border-slate-800"
                  >
                    <QRCode
                      value={selectedItem.content.trim() || " "}
                      size={170}
                      color={selectedItem.foregroundColor || "#111827"}
                      backgroundColor={
                        selectedItem.backgroundColor || "#FFFFFF"
                      }
                      ecl={selectedItem.ecl || "M"}
                    />
                  </View>

                  <Text className="mt-2.5 text-center text-[11px] text-slate-400">
                    {selectedItem.title ?? selectedItem.format} •{" "}
                    {formatDate(selectedItem.createdAt)}
                  </Text>
                </View>

                {/* Input Content Details */}
                <View className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                  <View className="mb-1.5 flex-row items-center justify-between">
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      Given Input / Content
                    </Text>
                    <Pressable
                      onPress={() => void handleCopy(selectedItem.content)}
                      accessibilityRole="button"
                      className="flex-row items-center gap-1 active:opacity-70"
                    >
                      <Ionicons
                        name="copy-outline"
                        size={12}
                        color="#7C3AED"
                      />
                      <Text className="text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                        Copy
                      </Text>
                    </Pressable>
                  </View>

                  <ScrollView
                    style={{ maxHeight: 75 }}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled
                  >
                    <Text
                      selectable
                      className="text-xs leading-5 text-slate-800 dark:text-slate-200"
                    >
                      {selectedItem.content}
                    </Text>
                  </ScrollView>
                </View>

                {/* Primary Action Buttons */}
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => void saveQr()}
                    accessibilityRole="button"
                    className="flex-1 flex-row items-center justify-center rounded-xl bg-violet-600 py-3 shadow-sm shadow-violet-500/20 active:bg-violet-700"
                  >
                    <Ionicons
                      name="download-outline"
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text className="ml-1.5 text-xs font-bold text-white">
                      Save PNG
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => void shareQr()}
                    accessibilityRole="button"
                    className="flex-1 flex-row items-center justify-center rounded-xl bg-slate-100 py-3 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={16}
                      color="#7C3AED"
                    />
                    <Text className="ml-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                      Share QR
                    </Text>
                  </Pressable>
                </View>

                {/* Full Screen Details & AI / Cloud Link */}
                <Pressable
                  onPress={() => {
                    const item = selectedItem;
                    setSelectedItem(null);
                    if (item.type === "create") {
                      router.push({
                        pathname: "/creation/[id]",
                        params: { id: item.id },
                      });
                    } else {
                      router.push({
                        pathname: "/scan-result/[id]",
                        params: { id: item.id },
                      });
                    }
                  }}
                  accessibilityRole="button"
                  className="mt-2.5 flex-row items-center justify-center rounded-xl border border-violet-100 bg-violet-50/70 py-2.5 active:bg-violet-100 dark:border-violet-900/60 dark:bg-violet-950/40"
                >
                  <Ionicons
                    name={
                      selectedItem.type === "create"
                        ? "cloud-upload-outline"
                        : "sparkles"
                    }
                    size={14}
                    color="#7C3AED"
                  />
                  <Text className="ml-1.5 text-xs font-bold text-violet-700 dark:text-violet-300">
                    {selectedItem.type === "create"
                      ? "Cloud Backup & Full Details"
                      : "AI Security Analysis & Details"}
                  </Text>
                </Pressable>

                {/* Secondary Action Row */}
                <View className="mt-2.5 flex-row items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
                  <Pressable
                    onPress={() => {
                      dispatch(toggleFavorite(selectedItem.id));
                      setSelectedItem({
                        ...selectedItem,
                        isFavorite: !selectedItem.isFavorite,
                      });
                    }}
                    accessibilityRole="button"
                    className="flex-row items-center rounded-xl bg-slate-100 px-3 py-2 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
                  >
                    <Ionicons
                      name={
                        selectedItem.isFavorite ? "star" : "star-outline"
                      }
                      size={14}
                      color={selectedItem.isFavorite ? "#EAB308" : "#94A3B8"}
                    />
                    <Text className="ml-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {selectedItem.isFavorite ? "Favorited" : "Favorite"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      const itemToDelete = selectedItem;
                      setSelectedItem(null);
                      confirmDelete(
                        itemToDelete.id,
                        itemToDelete.title ?? itemToDelete.format,
                      );
                    }}
                    accessibilityRole="button"
                    className="flex-row items-center rounded-xl bg-red-50 px-3 py-2 active:bg-red-100 dark:bg-red-950 dark:active:bg-red-900"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={14}
                      color="#EF4444"
                    />
                    <Text className="ml-1 text-xs font-semibold text-red-600 dark:text-red-400">
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
