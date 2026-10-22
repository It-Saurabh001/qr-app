import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found", headerShown: false }} />
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6 dark:bg-slate-950">
        <StatusBar style="auto" />

        <View className="w-full max-w-sm items-center">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-violet-100 dark:bg-violet-950">
            <Ionicons name="compass-outline" size={44} color="#7C3AED" />
          </View>

          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            Page Not Found
          </Text>

          <Text className="mt-2 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
            This screen doesn&apos;t exist or the link you followed may have expired.
          </Text>

          <Link
            href="/(tabs)"
            className="mt-6 w-full rounded-2xl bg-violet-600 py-3.5 text-center font-bold text-white shadow-lg shadow-violet-500/25 active:bg-violet-700"
          >
            Return to Home
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}
