import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { clearLocalGuestSession } from "@/services/auth/localGuestSession";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signOut } from "@/store/slices/authSlice";
import { guestSessionEnded } from "@/store/slices/localGuestSlice";
import {
  setAutoSaveScans,
  setSoundOnScan,
  setTheme,
  setVibrateOnScan,
  type AppTheme,
} from "@/store/slices/settingsSlice";

type SettingToggleProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
};

const themeOptions: {
  label: string;
  value: AppTheme;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
    { label: "System", value: "system", icon: "phone-portrait-outline" },
    { label: "Light", value: "light", icon: "sunny-outline" },
    { label: "Dark", value: "dark", icon: "moon-outline" },
  ];

function SettingToggle({
  icon,
  title,
  description,
  value,
  onToggle,
}: SettingToggleProps) {
  return (
    <View className="min-h-16 flex-row items-center justify-between py-3.5">
      <View className="mr-3 flex-1 flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          <Ionicons name={icon} size={20} color="#7C3AED" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-slate-900 dark:text-white">
            {title}
          </Text>
          <Text className="mt-0.5 text-xs leading-4 text-slate-500 dark:text-slate-400">
            {description}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onToggle}
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityState={{ checked: value }}
        className={`h-7 w-12 justify-center rounded-full px-1 ${value ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-700"
          }`}
      >
        <View
          className={`h-5 w-5 rounded-full bg-white shadow-sm ${value ? "self-end" : "self-start"
            }`}
        />
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { theme, autoSaveScans, vibrateOnScan, soundOnScan } = useAppSelector(
    (state) => state.settings,
  );
  const { user, status } = useAppSelector((state) => state.auth);
  const guestActive = useAppSelector((state) => state.localGuest.active);

  const isAuthenticated = status === "authenticated" && Boolean(user);
  const [autoOpenLinks, setAutoOpenLinks] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of QR Studio?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(signOut()).unwrap();
            } catch (err) {
              console.error("Sign out error:", err);
            }
            await clearLocalGuestSession();
            dispatch(guestSessionEnded());
            router.replace("/(auth)/sign-in");
          },
        },
      ],
    );
  };

  const handleExitGuest = () => {
    Alert.alert(
      "Exit Guest Mode",
      "You will return to the sign-in screen. Your local history remains saved on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Exit",
          style: "destructive",
          onPress: async () => {
            await clearLocalGuestSession();
            dispatch(guestSessionEnded());
            router.replace("/(auth)/sign-in");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-2xl self-center">
          {/* Header with Back Button */}
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
                QR STUDIO
              </Text>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                Preferences
              </Text>
            </View>
          </View>

          {/* Account Card */}
          <View className="mb-6 rounded-3xl bg-violet-50/70 p-5 dark:bg-violet-950/50">
            <View className="flex-row items-center">
              <View className="mr-3.5 h-12 w-12 items-center justify-center rounded-2xl bg-violet-200 dark:bg-violet-900">
                <Ionicons
                  name={isAuthenticated ? "person" : "phone-portrait-outline"}
                  size={24}
                  color="#7C3AED"
                />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-bold text-slate-900 dark:text-white">
                    {isAuthenticated
                      ? user?.displayName || "Signed In User"
                      : "Guest Account"}
                  </Text>
                  <View
                    className={`rounded-full px-2 py-0.5 ${isAuthenticated
                        ? "bg-emerald-100 dark:bg-emerald-900"
                        : "bg-amber-100 dark:bg-amber-900"
                      }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${isAuthenticated
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-amber-700 dark:text-amber-300"
                        }`}
                    >
                      {isAuthenticated ? "ONLINE" : "OFFLINE GUEST"}
                    </Text>
                  </View>
                </View>

                <Text className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                  {isAuthenticated
                    ? user?.email || "Connected with Firebase"
                    : "Data stored locally • Ready for offline use"}
                </Text>
              </View>
            </View>

            {isAuthenticated ? (
              <View className="mt-4 gap-2">
                <Pressable
                  onPress={() => router.push("/account/profile")}
                  accessibilityRole="button"
                  className="min-h-11 flex-row items-center justify-between rounded-2xl bg-white px-4 py-2.5 active:bg-violet-100 dark:bg-slate-900 dark:active:bg-slate-800"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="cloud-done-outline" size={16} color="#7C3AED" />
                    <Text className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Manage Cloud & Account Settings
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="#7C3AED" />
                </Pressable>

                <Pressable
                  onPress={handleSignOut}
                  accessibilityRole="button"
                  className="min-h-11 flex-row items-center justify-center rounded-2xl bg-white px-4 py-2.5 active:bg-violet-100 dark:bg-slate-900 dark:active:bg-slate-800"
                >
                  <Ionicons name="log-out-outline" size={16} color="#E11D48" />
                  <Text className="ml-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                    Sign Out
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="mt-4 flex-row gap-2">
                <Pressable
                  onPress={() => router.push("/(auth)/sign-in")}
                  accessibilityRole="button"
                  className="min-h-11 flex-1 items-center justify-center rounded-2xl bg-violet-600 px-4 py-2.5 active:bg-violet-700"
                >
                  <Text className="text-xs font-bold text-white">
                    Sign In / Register
                  </Text>
                </Pressable>

                {guestActive ? (
                  <Pressable
                    onPress={handleExitGuest}
                    accessibilityRole="button"
                    className="min-h-11 items-center justify-center rounded-2xl bg-white px-4 py-2.5 active:bg-slate-100 dark:bg-slate-900 dark:active:bg-slate-800"
                  >
                    <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Exit Guest
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </View>

          {/* Cloud & AI Features Quick Section */}
          <View className="mb-6 rounded-3xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <Text className="mb-1 text-base font-bold text-slate-900 dark:text-white">
              Online Cloud Features
            </Text>
            <Text className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Cloud synchronization, Cloudinary CDN hosting & Gemini AI tools.
            </Text>

            <Pressable
              onPress={() => router.push("/create/smart")}
              accessibilityRole="button"
              className="flex-row items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950">
                  <Ionicons name="sparkles" size={18} color="#7C3AED" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900 dark:text-white">
                    Smart AI Creator
                  </Text>
                  <Text className="text-xs text-slate-400">
                    Natural-language prompt to QR code
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </Pressable>

            <Pressable
              onPress={() => router.push("/migrate")}
              accessibilityRole="button"
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
                  <Ionicons name="cloud-upload-outline" size={18} color="#2563EB" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900 dark:text-white">
                    Cloud Data Migration
                  </Text>
                  <Text className="text-xs text-slate-400">
                    Sync local scans & creations to Firestore
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </Pressable>
          </View>

          {/* Appearance Section */}
          <View className="mb-6 rounded-3xl border border-slate-100 p-5 dark:border-slate-800">
            <Text className="mb-1 text-base font-bold text-slate-900 dark:text-white">
              Appearance
            </Text>
            <Text className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Select your color theme.
            </Text>

            <View className="flex-row rounded-2xl bg-slate-100 p-1 dark:bg-slate-900">
              {themeOptions.map((option) => {
                const selected = theme === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => dispatch(setTheme(option.value))}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={`min-h-10 flex-1 flex-row items-center justify-center rounded-xl py-2 ${selected ? "bg-violet-600" : "bg-transparent"
                      }`}
                  >
                    <Ionicons
                      name={option.icon}
                      size={14}
                      color={selected ? "#FFFFFF" : "#64748B"}
                    />
                    <Text
                      className={`ml-1.5 text-xs font-semibold ${selected
                          ? "text-white"
                          : "text-slate-600 dark:text-slate-300"
                        }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Scanning Options */}
          <View className="mb-6 rounded-3xl border border-slate-100 p-5 dark:border-slate-800">
            <Text className="mb-1 text-base font-bold text-slate-900 dark:text-white">
              Scanning Feedback
            </Text>
            <Text className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              Manage camera scanner behavior on your mobile device.
            </Text>

            <SettingToggle
              icon="bookmark-outline"
              title="Auto-save scans"
              description="Automatically save scanned codes to local history."
              value={autoSaveScans}
              onToggle={() => dispatch(setAutoSaveScans(!autoSaveScans))}
            />

            <View className="h-px bg-slate-100 dark:bg-slate-800" />

            <SettingToggle
              icon="radio-outline"
              title="Vibrate on scan"
              description="Haptic vibration when a barcode or QR is recognized."
              value={vibrateOnScan}
              onToggle={() => dispatch(setVibrateOnScan(!vibrateOnScan))}
            />

            <View className="h-px bg-slate-100 dark:bg-slate-800" />

            <SettingToggle
              icon="volume-high-outline"
              title="Sound on scan"
              description="Play sound notification upon code detection."
              value={soundOnScan}
              onToggle={() => dispatch(setSoundOnScan(!soundOnScan))}
            />

            <View className="h-px bg-slate-100 dark:bg-slate-800" />

            <SettingToggle
              icon="open-outline"
              title="Auto-open links"
              description="Prompt before opening external web URLs."
              value={autoOpenLinks}
              onToggle={() => setAutoOpenLinks((value) => !value)}
            />
          </View>

          {/* Device & Offline Info */}
          <View className="flex-row items-start rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#7C3AED"
              style={{ marginTop: 2, marginRight: 10 }}
            />
            <Text className="flex-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Preferences and QR history remain safely persisted on this device.
              No cloud sync or tracking is enabled during guest mode.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

