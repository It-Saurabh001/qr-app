import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  smartCreateWithAi,
  type SmartCreateResult,
} from "@/services/ai/aiService";
import { useAppSelector } from "@/store/hooks";

const examplePrompts = [
  "Join coffee shop Wi-Fi named 'CafeDelight' with pass 'Brewed2026'",
  "Email invoice query to billing@techfirm.com with subject Invoice #104",
  "Call support line at +1 800 555 0199 for quick customer assistance",
  "Visit developer documentation at https://docs.expo.dev",
];

export default function SmartCreateScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = Boolean(user);

  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartCreateResult | null>(null);

  const handleGenerate = async () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) {
      Alert.alert("Prompt required", "Please describe what kind of QR code you want to create.");
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        "Online Account Required",
        "Smart AI generation uses Google Gemini Cloud Functions and requires an authenticated account. Would you like to sign in?",
        [
          { text: "Continue as Guest", style: "cancel" },
          {
            text: "Sign In",
            onPress: () => router.push("/(auth)/sign-in"),
          },
        ],
      );
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const generated = await smartCreateWithAi(cleanPrompt);
      setResult(generated);
    } catch (err) {
      console.error("AI Smart Create error:", err);
      Alert.alert("Generation Failed", "Could not process this prompt. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToCreator = () => {
    if (!result) return;
    router.replace("/(tabs)/create");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
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
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-xs font-bold tracking-widest text-violet-600">
                    GEMINI AI STUDIO
                  </Text>
                  <Ionicons name="sparkles" size={13} color="#7C3AED" />
                </View>
                <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                  Smart Create
                </Text>
              </View>
            </View>

            {/* Online Status / AI Quota Pill */}
            <View className="mb-5 flex-row items-center justify-between rounded-2xl bg-violet-50/80 p-3.5 dark:bg-violet-950/40">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={isAuthenticated ? "flash" : "lock-closed-outline"}
                  size={16}
                  color="#7C3AED"
                />
                <Text className="text-xs font-bold text-violet-800 dark:text-violet-200">
                  {isAuthenticated
                    ? "Gemini 2.5 Flash Connected"
                    : "Account Required for Cloud AI"}
                </Text>
              </View>

              <View className="rounded-full bg-violet-200 px-2 py-0.5 dark:bg-violet-900">
                <Text className="text-[10px] font-bold text-violet-800 dark:text-violet-200">
                  {isAuthenticated ? "50/50 QUOTA" : "GUEST MODE"}
                </Text>
              </View>
            </View>

            <Text className="mb-2 text-sm text-slate-600 dark:text-slate-300">
              Describe what you want to create in natural language. Gemini AI will automatically parse the configuration and build your QR code.
            </Text>

            {/* Prompt Input Box */}
            <View className="my-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <TextInput
                value={prompt}
                onChangeText={setPrompt}
                placeholder="e.g. Set up a Wi-Fi QR code for office guest network with password..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                style={{ textAlignVertical: "top", minHeight: 90 }}
                className="text-sm leading-6 text-slate-900 dark:text-white"
              />

              <View className="mt-2 flex-row items-center justify-between border-t border-slate-200/60 pt-2 dark:border-slate-800">
                <Text className="text-[11px] text-slate-400">
                  {prompt.length} characters
                </Text>

                {prompt.length > 0 && (
                  <Pressable onPress={() => setPrompt("")}>
                    <Text className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                      Clear
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Inspiration Chips */}
            <Text className="mb-2 mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Try an Example Prompt
            </Text>

            <View className="mb-6 flex-row flex-wrap gap-2">
              {examplePrompts.map((item, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setPrompt(item)}
                  accessibilityRole="button"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 active:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:active:bg-slate-800"
                >
                  <Text className="text-xs text-slate-700 dark:text-slate-300">
                    💡 {item.slice(0, 36)}...
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Generate Action Button */}
            <Pressable
              onPress={handleGenerate}
              disabled={isLoading}
              accessibilityRole="button"
              className="flex-row items-center justify-center rounded-2xl bg-violet-600 py-4 shadow-lg shadow-violet-500/25 active:bg-violet-700"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  <Text className="ml-2 font-bold text-white">
                    Generate with Gemini
                  </Text>
                </>
              )}
            </Pressable>

            {/* AI Result Card */}
            {result && (
              <View className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900 dark:bg-emerald-950/40">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  <Text className="text-base font-bold text-slate-900 dark:text-white">
                    {result.title}
                  </Text>
                  <View className="rounded-full bg-emerald-200 px-2 py-0.5 dark:bg-emerald-900">
                    <Text className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-200">
                      {result.type}
                    </Text>
                  </View>
                </View>

                <Text className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  {result.explanation}
                </Text>

                <View className="my-3 rounded-2xl bg-white p-3 dark:bg-slate-900">
                  <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Generated QR Payload
                  </Text>
                  <Text
                    selectable
                    numberOfLines={3}
                    className="mt-1 text-xs text-slate-800 dark:text-slate-200 font-mono"
                  >
                    {result.payload}
                  </Text>
                </View>

                <Pressable
                  onPress={handleApplyToCreator}
                  accessibilityRole="button"
                  className="flex-row items-center justify-center rounded-xl bg-emerald-600 py-3 active:bg-emerald-700"
                >
                  <Ionicons name="color-wand-outline" size={16} color="#FFFFFF" />
                  <Text className="ml-2 text-xs font-bold text-white">
                    Open in QR Designer
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
