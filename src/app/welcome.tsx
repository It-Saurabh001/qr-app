import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <View className="flex-1 justify-between px-6 py-8 w-full max-w-md self-center">
        {/* Brand */}
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-violet-600">
            <Text className="text-2xl font-bold text-white">⌗</Text>
          </View>

          <View>
            <Text className="text-xl font-bold text-slate-900 dark:text-white">
              QR Studio
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">
              Your QR companion
            </Text>
          </View>
        </View>

        {/* Hero */}
        <View className="items-center">
          <View className="mb-8 h-56 w-56 items-center justify-center rounded-[40px] bg-violet-50 dark:bg-slate-900">
            <View className="h-36 w-36 items-center justify-center rounded-3xl border-4 border-violet-600 bg-white dark:bg-slate-800">
              <Text className="text-7xl font-bold text-violet-600">▦</Text>
            </View>

            <View className="absolute bottom-7 right-5 h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">
              <Text className="text-2xl font-bold text-white">+</Text>
            </View>
          </View>

          <Text className="mb-4 text-center text-4xl font-bold leading-tight text-slate-900 dark:text-white">
            Scan. Create.
            {"\n"}
            Keep it simple.
          </Text>

          <Text className="max-w-sm text-center text-base leading-6 text-slate-500 dark:text-slate-400">
            Scan QR codes, create your own, and keep everything organized in one
            place.
          </Text>

          {/* Single primary action */}
          <View className="mt-8 w-full">
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(auth)/sign-in")}
              className="min-h-14 items-center justify-center rounded-2xl bg-violet-600 px-5 active:bg-violet-700"
            >
              <Text className="text-base font-semibold text-white">
                Get Started
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <Text className="text-center text-xs text-slate-400">
          Simple. Fast. Ready when you are.
        </Text>
      </View>
    </SafeAreaView>
  );
}
