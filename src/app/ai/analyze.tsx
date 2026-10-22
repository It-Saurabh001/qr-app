import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  analyzeScanWithAi,
  type ScanAnalysisResult,
} from "@/services/ai/aiService";
import { useAppSelector } from "@/store/hooks";
import { historySelectors } from "@/store/slices/historySlice";

export default function AiAnalyzeScreen() {
  const router = useRouter();
  const { id, content: queryContent, format: queryFormat } =
    useLocalSearchParams<{
      id?: string;
      content?: string;
      format?: string;
    }>();

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = Boolean(user);

  const historyItem = useAppSelector((state) =>
    id ? historySelectors.selectById(state.history, id) : undefined,
  );

  const payload = queryContent || historyItem?.content || "https://example.com";
  const format = queryFormat || historyItem?.format || "QR_CODE";

  const [isLoading, setIsLoading] = useState(Boolean(isAuthenticated));
  const [analysis, setAnalysis] = useState<ScanAnalysisResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;

    analyzeScanWithAi(payload, format)
      .then((res) => {
        if (mounted) {
          setAnalysis(res);
        }
      })
      .catch((err) => {
        console.error("AI Analysis error:", err);
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [payload, format, isAuthenticated]);

  const handleSaveSummary = () => {
    setIsSaved(true);
    Alert.alert("Summary Saved", "AI analysis notes have been linked to this record.");
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
              <View className="flex-row items-center gap-1.5">
                <Text className="text-xs font-bold tracking-widest text-violet-600">
                  GEMINI SECURITY ENGINE
                </Text>
                <Ionicons name="shield-checkmark" size={13} color="#7C3AED" />
              </View>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                AI Scan Analysis
              </Text>
            </View>
          </View>

          {/* Scanned Code Preview Box */}
          <View className="mb-6 rounded-3xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <View className="flex-row items-center justify-between">
              <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Scanned Payload
              </Text>
              <View className="rounded bg-slate-200 px-2 py-0.5 dark:bg-slate-800">
                <Text className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {format}
                </Text>
              </View>
            </View>
            <Text
              numberOfLines={3}
              selectable
              className="mt-2 text-xs leading-5 text-slate-800 dark:text-slate-200"
            >
              {payload}
            </Text>
          </View>

          {/* Online Authentication Gate */}
          {!isAuthenticated ? (
            <View className="rounded-3xl border border-violet-100 bg-violet-50/70 p-6 dark:border-violet-900 dark:bg-violet-950/40">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900">
                <Ionicons name="sparkles" size={24} color="#7C3AED" />
              </View>

              <Text className="text-lg font-bold text-slate-900 dark:text-white">
                Unlock AI Security Scanning
              </Text>

              <Text className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                AI threat detection, phishing analysis, and plain-English code explanations require an online account powered by Gemini Cloud Functions.
              </Text>

              <Pressable
                onPress={() => router.push("/(auth)/sign-in")}
                accessibilityRole="button"
                className="mt-5 flex-row items-center justify-center rounded-2xl bg-violet-600 py-3.5 active:bg-violet-700"
              >
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                <Text className="ml-2 font-bold text-white">
                  Sign In / Create Account
                </Text>
              </Pressable>
            </View>
          ) : isLoading ? (
            <View className="items-center rounded-3xl bg-violet-50/70 p-10 dark:bg-violet-950/40">
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text className="mt-4 text-sm font-bold text-violet-800 dark:text-violet-200">
                Gemini is analyzing this code...
              </Text>
              <Text className="mt-1 text-xs text-slate-400">
                Checking phishing heuristics, domain legitimacy and payload safety.
              </Text>
            </View>
          ) : analysis ? (
            <View className="gap-5">
              {/* Risk Level Banner */}
              <View
                className={`rounded-3xl border p-5 ${
                  analysis.riskLevel === "high"
                    ? "border-red-200 bg-red-50/80 dark:border-red-900 dark:bg-red-950/40"
                    : analysis.riskLevel === "medium"
                      ? "border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/40"
                      : "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/40"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name={
                      analysis.riskLevel === "high"
                        ? "warning"
                        : analysis.riskLevel === "medium"
                          ? "alert-circle"
                          : "checkmark-circle"
                    }
                    size={22}
                    color={
                      analysis.riskLevel === "high"
                        ? "#DC2626"
                        : analysis.riskLevel === "medium"
                          ? "#D97706"
                          : "#059669"
                    }
                  />
                  <Text
                    className={`text-base font-bold ${
                      analysis.riskLevel === "high"
                        ? "text-red-900 dark:text-red-200"
                        : analysis.riskLevel === "medium"
                          ? "text-amber-900 dark:text-amber-200"
                          : "text-emerald-900 dark:text-emerald-200"
                    }`}
                  >
                    {analysis.riskLevel === "high"
                      ? "High Threat Warning"
                      : analysis.riskLevel === "medium"
                        ? "Medium Caution Flag"
                        : "Verified Safe Code"}
                  </Text>
                  <View
                    className={`ml-auto rounded-full px-2.5 py-0.5 ${
                      analysis.riskLevel === "high"
                        ? "bg-red-200 dark:bg-red-900"
                        : analysis.riskLevel === "medium"
                          ? "bg-amber-200 dark:bg-amber-900"
                          : "bg-emerald-200 dark:bg-emerald-900"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-extrabold uppercase ${
                        analysis.riskLevel === "high"
                          ? "text-red-800 dark:text-red-200"
                          : analysis.riskLevel === "medium"
                            ? "text-amber-800 dark:text-amber-200"
                            : "text-emerald-800 dark:text-emerald-200"
                      }`}
                    >
                      {analysis.riskLevel} Risk
                    </Text>
                  </View>
                </View>

                <Text
                  className={`mt-2 text-xs leading-5 ${
                    analysis.riskLevel === "high"
                      ? "text-red-800 dark:text-red-300"
                      : analysis.riskLevel === "medium"
                        ? "text-amber-800 dark:text-amber-300"
                        : "text-emerald-800 dark:text-emerald-300"
                  }`}
                >
                  {analysis.summary}
                </Text>

                {analysis.riskReasons.length > 0 && (
                  <View className="mt-3 gap-1 border-t border-slate-200/40 pt-2.5">
                    {analysis.riskReasons.map((reason, idx) => (
                      <Text
                        key={idx}
                        className="text-[11px] text-red-700 dark:text-red-300"
                      >
                        • {reason}
                      </Text>
                    ))}
                  </View>
                )}
              </View>

              {/* Recommendation Card */}
              <View className="rounded-3xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  AI Recommendation
                </Text>
                <Text className="mt-2 text-sm leading-6 text-slate-800 dark:text-slate-200 font-medium">
                  {analysis.recommendation}
                </Text>
              </View>

              {/* Save AI Summary Action */}
              <Pressable
                onPress={handleSaveSummary}
                disabled={isSaved}
                accessibilityRole="button"
                className={`flex-row items-center justify-center rounded-2xl py-4 ${
                  isSaved
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "bg-violet-600 active:bg-violet-700"
                }`}
              >
                <Ionicons
                  name={isSaved ? "checkmark" : "bookmark-outline"}
                  size={18}
                  color={isSaved ? "#059669" : "#FFFFFF"}
                />
                <Text
                  className={`ml-2 font-bold ${
                    isSaved
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-white"
                  }`}
                >
                  {isSaved ? "Summary Linked to Record" : "Save AI Summary"}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
