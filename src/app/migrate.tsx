import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { syncGuestHistoryToCloud } from "@/services/firebase/historyService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  historySelectors,
  mergeHistoryItems,
} from "@/store/slices/historySlice";

export default function MigrateScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const history = useAppSelector((state) =>
    historySelectors.selectAll(state.history),
  );

  const scannedCount = useMemo(
    () => history.filter((i) => i.type === "scan").length,
    [history],
  );
  const createdCount = useMemo(
    () => history.filter((i) => i.type === "create").length,
    [history],
  );

  const [status, setStatus] = useState<
    "idle" | "migrating" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [migratedCount, setMigratedCount] = useState(0);

  const handleStartMigration = async () => {
    console.log(`[Migration] 📍 Screen: "Migrate Guest History"`);
    console.log(
      `[Migration] 🔘 Button "Migrate All to Cloud" pressed by user: ${user?.uid || "unauthenticated"}`,
    );

    if (!user) {
      console.warn("[Migration] ⚠️ Migration aborted: User not signed in.");
      Alert.alert("Account required", "Please sign in before migrating data.");
      router.replace("/(auth)/sign-in");
      return;
    }

    if (history.length === 0) {
      console.log("[Migration] ℹ️ No local records found to migrate. Routing to Home.");
      router.replace("/(tabs)");
      return;
    }

    setStatus("migrating");
    setErrorMessage("");
    console.log(`[Migration] ⏳ Migrating ${history.length} items to cloud...`);

    try {
      const syncedDocs = await syncGuestHistoryToCloud(user.uid, history);
      dispatch(mergeHistoryItems(syncedDocs));
      setMigratedCount(syncedDocs.length || history.length);
      setStatus("success");
      console.log(`[Migration] ✅ Migration successful (${syncedDocs.length} cloud records synced).`);
    } catch (err: unknown) {
      console.error(
        "[Migration] ❌ Migration failed:",
        err instanceof Error ? err.message : err,
      );
      const msg =
        err instanceof Error
          ? err.message
          : "Could not upload records to cloud. Please check your internet connection and try again.";
      setErrorMessage(msg);
      setStatus("error");
    }
  };

  const handleFinish = () => {
    console.log('[Migration] 🔘 Button "Finish / Continue" pressed');
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 48,
          flexGrow: 1,
          justifyContent: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-md self-center">
          {/* Header Icon */}
          <View className="mb-6 items-center">
            <View
              className={`h-20 w-20 items-center justify-center rounded-3xl ${
                status === "success"
                  ? "bg-emerald-100 dark:bg-emerald-950"
                  : "bg-violet-100 dark:bg-violet-950"
              }`}
            >
              <Ionicons
                name={
                  status === "success"
                    ? "checkmark-circle"
                    : status === "error"
                      ? "cloud-offline-outline"
                      : "cloud-upload-outline"
                }
                size={40}
                color={status === "success" ? "#059669" : "#7C3AED"}
              />
            </View>

            <Text className="mt-5 text-center text-2xl font-bold text-slate-900 dark:text-white">
              {status === "success"
                ? "Data Migration Complete!"
                : status === "migrating"
                  ? "Syncing to Your Cloud..."
                  : "Migrate Guest History"}
            </Text>

            <Text className="mt-2 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
              {status === "success"
                ? `Successfully synced ${migratedCount} items to your secure cloud account.`
                : "Back up your local scans and creations to your online account so you never lose them."}
            </Text>
          </View>

          {/* Account Target Card */}
          <View className="mb-5 rounded-3xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-violet-600">
                <Text className="text-base font-bold text-white">
                  {(user?.displayName || user?.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>

              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="text-sm font-bold text-slate-900 dark:text-white"
                >
                  {user?.displayName || "Signed In User"}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-xs text-slate-500 dark:text-slate-400"
                >
                  {user?.email || "Cloud Connected"}
                </Text>
              </View>

              <View className="rounded-full bg-emerald-100 px-2.5 py-0.5 dark:bg-emerald-950">
                <Text className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  ONLINE
                </Text>
              </View>
            </View>
          </View>

          {/* Local Data Summary Breakdown */}
          <View className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Local Records to Sync
            </Text>

            <View className="flex-row items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center gap-2">
                <Ionicons name="qr-code-outline" size={16} color="#7C3AED" />
                <Text className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Scanned Codes
                </Text>
              </View>
              <Text className="text-sm font-bold text-slate-900 dark:text-white">
                {scannedCount} items
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <View className="flex-row items-center gap-2">
                <Ionicons name="color-wand-outline" size={16} color="#2563EB" />
                <Text className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Created QR Codes
                </Text>
              </View>
              <Text className="text-sm font-bold text-slate-900 dark:text-white">
                {createdCount} items
              </Text>
            </View>

            <View className="flex-row items-center justify-between pt-3">
              <Text className="text-sm font-bold text-slate-900 dark:text-white">
                Total Local Records
              </Text>
              <Text className="text-base font-extrabold text-violet-600">
                {history.length} items
              </Text>
            </View>
          </View>

          {/* Error Banner */}
          {status === "error" && (
            <View className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950">
              <View className="flex-row items-center gap-2">
                <Ionicons name="alert-circle" size={18} color="#E11D48" />
                <Text className="text-xs font-bold text-rose-800 dark:text-rose-200">
                  Migration Incomplete
                </Text>
              </View>
              <Text className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                {errorMessage}
              </Text>
              <Text className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                Don&apos;t worry: your local history has been completely preserved on this device.
              </Text>
            </View>
          )}

          {/* Actions */}
          {status === "idle" && (
            <View className="gap-3">
              <Pressable
                onPress={handleStartMigration}
                accessibilityRole="button"
                className="flex-row items-center justify-center rounded-2xl bg-violet-600 py-4 shadow-lg shadow-violet-500/30 active:bg-violet-700"
              >
                <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                <Text className="ml-2 font-bold text-white">
                  Migrate All to Cloud
                </Text>
              </Pressable>

              <Pressable
                onPress={handleFinish}
                accessibilityRole="button"
                className="items-center justify-center rounded-2xl border border-slate-200 py-3.5 active:bg-slate-50 dark:border-slate-800 dark:active:bg-slate-900"
              >
                <Text className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Not Now / Skip for Later
                </Text>
              </Pressable>
            </View>
          )}

          {status === "migrating" && (
            <View className="items-center rounded-2xl bg-violet-50 p-6 dark:bg-violet-950/40">
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text className="mt-3 text-sm font-bold text-violet-800 dark:text-violet-200">
                Validating & Syncing {history.length} records...
              </Text>
              <Text className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
                Please keep the app open while we secure your data in the cloud.
              </Text>
            </View>
          )}

          {status === "success" && (
            <Pressable
              onPress={handleFinish}
              accessibilityRole="button"
              className="flex-row items-center justify-center rounded-2xl bg-emerald-600 py-4 shadow-lg shadow-emerald-500/30 active:bg-emerald-700"
            >
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              <Text className="ml-2 font-bold text-white">
                Continue to QR Studio
              </Text>
            </Pressable>
          )}

          {status === "error" && (
            <View className="gap-3">
              <Pressable
                onPress={handleStartMigration}
                accessibilityRole="button"
                className="flex-row items-center justify-center rounded-2xl bg-violet-600 py-4 active:bg-violet-700"
              >
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text className="ml-2 font-bold text-white">
                  Retry Cloud Migration
                </Text>
              </Pressable>

              <Pressable
                onPress={handleFinish}
                accessibilityRole="button"
                className="items-center justify-center rounded-2xl border border-slate-200 py-3.5 dark:border-slate-800"
              >
                <Text className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Skip for Now
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
