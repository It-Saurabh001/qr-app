import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

import { useAppSelector } from "@/store/hooks";

export function useProtectedRoute() {
  const router = useRouter();
  const segments = useSegments();

  const status = useAppSelector((state) => state.auth.status);
  const guestActive = useAppSelector((state) => state.localGuest.active);
  const guestInitialized = useAppSelector(
    (state) => state.localGuest.initialized,
  );

  useEffect(() => {
    if (status === "initializing" || !guestInitialized) {
      return;
    }

    const currentSegment = segments[0] as string | undefined;
    const inAuthGroup = currentSegment === "(auth)";
    const inTabsGroup = currentSegment === "(tabs)";
    const onEntryScreen =
      !currentSegment ||
      currentSegment === "index" ||
      currentSegment === "welcome" ||
      currentSegment === "onboarding";

    // 1. Authenticated user: Redirect away from auth or entry screens to Home tabs
    if (status === "authenticated" && (inAuthGroup || onEntryScreen)) {
      router.replace("/(tabs)");
      return;
    }

    // 2. Active Offline Guest: Restore directly to Home tabs if opening on entry screens
    if (guestActive && onEntryScreen) {
      router.replace("/(tabs)");
      return;
    }

    const isProtectedGroup =
      inTabsGroup ||
      currentSegment === "account" ||
      currentSegment === "migrate";

    // 3. Unauthenticated and no guest session: Protect tab, account & migration screens
    if (status !== "authenticated" && !guestActive && isProtectedGroup) {
      router.replace("/(auth)/sign-in");
      return;
    }
  }, [status, guestActive, guestInitialized, segments, router]);
}
