import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import WelcomeScreen from "./welcome";

const ONBOARDING_KEY = "@qr_studio/onboarding_completed";

export default function IndexScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((completed) => {
        if (!isMounted) return;
        if (completed !== "true") {
          router.replace("/onboarding");
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        if (isMounted) setChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-950">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return <WelcomeScreen />;
}

