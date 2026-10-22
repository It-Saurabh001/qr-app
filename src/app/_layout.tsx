import "../../global.css";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { useProtectedRoute } from "@/features/auth/useProtectedRoute";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { store, persistor } from "@/store";
import { useThemeSync } from "@/features/settings/useThemeSync";
import { useAuthListener } from "@/features/auth/useAuthListener";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hasLocalGuestSession } from "@/services/auth/localGuestSession";
import { guestSessionRestored } from "@/store/slices/localGuestSlice";

void SplashScreen.preventAutoHideAsync();

function AppLayout() {
  const theme = useAppSelector((state) => state.settings.theme);
  const systemColorScheme = useSystemColorScheme();
  const dispatch = useAppDispatch();

  // Sync saved Redux theme with NativeWind.
  useThemeSync();

  // Keep Redux auth state synchronized with Firebase.
  useAuthListener();
  useProtectedRoute();

  const guestInitialized = useAppSelector(
    (state) => state.localGuest.initialized,
  );

  useEffect(() => {
    let mounted = true;

    hasLocalGuestSession()
      .then((active) => {
        if (mounted) {
          dispatch(guestSessionRestored(active));
        }
      })
      .catch(() => {
        if (mounted) {
          dispatch(guestSessionRestored(false));
        }
      });

    return () => {
      mounted = false;
    };
  }, [dispatch]);
  // Hide the native splash after persisted state has loaded.
  const authStatus = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    if (authStatus !== "initializing" && guestInitialized) {
      void SplashScreen.hideAsync();
    }
  }, [authStatus, guestInitialized]);

  const effectiveTheme = theme === "system" ? systemColorScheme : theme;

  return (
    <ThemeProvider value={effectiveTheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <AnimatedSplashOverlay />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppLayout />
      </PersistGate>
    </Provider>
  );
}
