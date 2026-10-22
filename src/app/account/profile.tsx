import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { clearLocalGuestSession } from "@/services/auth/localGuestSession";
import { deleteUserAccount } from "@/services/firebase/accountService";
import { syncGuestHistoryToCloud } from "@/services/firebase/historyService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signOut } from "@/store/slices/authSlice";
import { historySelectors } from "@/store/slices/historySlice";
import { guestSessionEnded } from "@/store/slices/localGuestSlice";

export default function AccountProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const history = useAppSelector((state) =>
    historySelectors.selectAll(state.history),
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyUid = async () => {
    if (user?.uid) {
      await Clipboard.setStringAsync(user.uid);
      Alert.alert("Copied", "User ID copied to clipboard.");
    }
  };

  const handleForceSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await syncGuestHistoryToCloud(user.uid, history);
      Alert.alert(
        "Cloud Sync Complete",
        "Your QR codes and scan records are up-to-date in Firestore.",
      );
    } catch (err) {
      console.error("Sync error:", err);
      Alert.alert("Sync Failed", "Could not complete cloud synchronization.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Do you want to retain your local data on this device after signing out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear & Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(signOut()).unwrap();
            } catch {
              // ignore
            }
            await clearLocalGuestSession();
            dispatch(guestSessionEnded());
            router.replace("/(auth)/sign-in");
          },
        },
        {
          text: "Keep Local Data",
          onPress: async () => {
            try {
              await dispatch(signOut()).unwrap();
            } catch {
              // ignore
            }
            router.replace("/(auth)/sign-in");
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account Permanently?",
      "WARNING: This action is permanent and cannot be undone. All your Firestore records, Cloudinary assets, and Firebase account will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteUserAccount();
              await clearLocalGuestSession();
              dispatch(guestSessionEnded());
              router.replace("/(auth)/sign-in");
              Alert.alert("Account Deleted", "Your account and data have been removed.");
            } catch (err) {
              console.error("Delete account error:", err);
              Alert.alert(
                "Error",
                "Could not delete account. If you haven't signed in recently, please re-authenticate and try again.",
              );
            } finally {
              setIsDeleting(false);
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
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-2xl self-center">
          {/* Header */}
          <View className="mb-6 flex-row items-center gap-3">
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
                CLOUD ACCOUNT
              </Text>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                Account & Cloud
              </Text>
            </View>
          </View>

          {/* User Profile Card */}
          <View className="mb-6 items-center rounded-3xl border border-violet-100 bg-violet-50/70 p-6 dark:border-violet-900/60 dark:bg-violet-950/40">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-violet-600 shadow-md shadow-violet-500/25">
              <Text className="text-3xl font-extrabold text-white">
                {(user?.displayName || user?.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.displayName || "Signed In User"}
            </Text>

            <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user?.email || "Firebase Authentication"}
            </Text>

            <View className="mt-3 flex-row items-center gap-2">
              <View className="rounded-full bg-emerald-100 px-3 py-1 dark:bg-emerald-950">
                <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  ONLINE • SECURE
                </Text>
              </View>

              <Pressable
                onPress={handleCopyUid}
                className="flex-row items-center gap-1 rounded-full bg-white px-3 py-1 shadow-xs dark:bg-slate-900"
              >
                <Ionicons name="finger-print-outline" size={13} color="#7C3AED" />
                <Text className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  UID: {user?.uid ? `${user.uid.slice(0, 8)}...` : "None"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Cloud Storage & Quotas */}
          <View className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <Text className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Cloud Infrastructure
            </Text>

            <View className="gap-3.5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950">
                    <Ionicons name="cloud-done-outline" size={18} color="#7C3AED" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">
                      Firestore Database
                    </Text>
                    <Text className="text-[11px] text-slate-400">
                      Real-time cloud database
                    </Text>
                  </View>
                </View>
                <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Active
                </Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-slate-800" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                    <Ionicons name="images-outline" size={18} color="#2563EB" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">
                      Cloudinary Hosting
                    </Text>
                    <Text className="text-[11px] text-slate-400">
                      High-speed CDN image assets
                    </Text>
                  </View>
                </View>
                <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Ready
                </Text>
              </View>

              <View className="h-px bg-slate-100 dark:bg-slate-800" />

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950">
                    <Ionicons name="sparkles" size={18} color="#D97706" />
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">
                      Gemini 2.5 AI
                    </Text>
                    <Text className="text-[11px] text-slate-400">
                      Smart creator & threat analysis
                    </Text>
                  </View>
                </View>
                <Text className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  50 / 50 Left
                </Text>
              </View>
            </View>
          </View>

          {/* Cloud Operations */}
          <View className="mb-6 gap-3">
            <Pressable
              onPress={handleForceSync}
              disabled={isSyncing}
              accessibilityRole="button"
              className="flex-row items-center justify-center rounded-2xl bg-violet-600 py-4 shadow-lg shadow-violet-500/25 active:bg-violet-700"
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="sync" size={18} color="#FFFFFF" />
                  <Text className="ml-2 font-bold text-white">
                    Sync Cloud Data Now
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push("/migrate")}
              accessibilityRole="button"
              className="flex-row items-center justify-center rounded-2xl border border-slate-200 bg-white py-3.5 active:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:active:bg-slate-800"
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#7C3AED" />
              <Text className="ml-2 font-bold text-slate-900 dark:text-white">
                Migrate Local Guest Records
              </Text>
            </Pressable>
          </View>

          {/* Account Lifecycle */}
          <View className="rounded-3xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <Text className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Account Management
            </Text>

            <Pressable
              onPress={handleSignOut}
              accessibilityRole="button"
              className="mb-3 flex-row items-center justify-center rounded-2xl bg-slate-100 py-3.5 active:bg-slate-200 dark:bg-slate-800 dark:active:bg-slate-700"
            >
              <Ionicons name="log-out-outline" size={18} color="#64748B" />
              <Text className="ml-2 font-bold text-slate-800 dark:text-slate-200">
                Sign Out of QR Studio
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              accessibilityRole="button"
              className="flex-row items-center justify-center rounded-2xl bg-red-50 py-3.5 active:bg-red-100 dark:bg-red-950/60 dark:active:bg-red-900"
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text className="ml-2 font-bold text-red-600 dark:text-red-400">
                    Delete Account Permanently
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
