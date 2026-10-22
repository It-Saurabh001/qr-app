import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ONBOARDING_KEY = "@qr_studio/onboarding_completed";

const slides = [
  {
    title: "Scan any QR code",
    description: "Quickly scan QR codes and barcodes using your camera.",
    animation: require("../../assets/animations/qr-scanner.json"),
  },
  {
    title: "Create your own QR",
    description: "Generate QR codes for links, text, Wi-Fi and more.",
    animation: require("../../assets/animations/onboarding-inspection.json"),
  },
  {
    title: "Everything in one place",
    description: "Keep your QR creations organized and easy to access.",
    animation: require("../../assets/animations/qr-scanner.json"),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const currentSlide = slides[currentIndex];
  const isLastSlide = currentIndex === slides.length - 1;

  async function finishOnboarding() {
    if (saving) return;

    setSaving(true);

    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      router.replace("/welcome");
    } catch (error) {
      console.error("Unable to save onboarding status:", error);
    } finally {
      setSaving(false);
    }
  }

  function handleNext() {
    if (isLastSlide) {
      void finishOnboarding();
    } else {
      setCurrentIndex((index) => index + 1);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <View className="flex-1 justify-between px-6 py-5 w-full max-w-md self-center">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-slate-900 dark:text-white">
            QR Studio
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            disabled={saving}
            onPress={() => void finishOnboarding()}
            className="rounded-xl px-4 py-2"
          >
            <Text className="font-semibold text-violet-600">Skip</Text>
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center">
          <LottieView
            key={currentIndex}
            source={currentSlide.animation}
            autoPlay
            loop
            style={{ width: 280, height: 280 }}
          />

          <Text className="mt-6 text-center text-3xl font-bold text-slate-900 dark:text-white">
            {currentSlide.title}
          </Text>

          <Text className="mt-4 max-w-sm text-center text-base leading-6 text-slate-500 dark:text-slate-400">
            {currentSlide.description}
          </Text>
        </View>

        <View className="gap-6">
          <View className="flex-row items-center justify-center gap-2">
            {slides.map((slide, index) => (
              <View
                key={slide.title}
                className={`h-2 rounded-full ${index === currentIndex
                  ? "w-8 bg-violet-600"
                  : "w-2 bg-slate-300 dark:bg-slate-700"
                  }`}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={handleNext}
            className="min-h-14 items-center justify-center rounded-2xl bg-violet-600 px-5 active:bg-violet-700"
          >
            <Text className="text-base font-semibold text-white">
              {saving ? "Please wait..." : isLastSlide ? "Get Started" : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
