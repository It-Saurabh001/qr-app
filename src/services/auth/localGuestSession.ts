import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_SESSION_KEY = "qr-studio.local-guest-session";

export async function saveLocalGuestSession(): Promise<void> {
  try {
    await SecureStore.setItemAsync(GUEST_SESSION_KEY, "active");
  } catch {
    await AsyncStorage.setItem(GUEST_SESSION_KEY, "active").catch(() => {});
  }
}

export async function hasLocalGuestSession(): Promise<boolean> {
  try {
    const value = await SecureStore.getItemAsync(GUEST_SESSION_KEY);
    if (value === "active") return true;
  } catch {
    // SecureStore might fail on web or certain devices
  }

  try {
    const fallback = await AsyncStorage.getItem(GUEST_SESSION_KEY);
    return fallback === "active";
  } catch {
    return false;
  }
}

export async function clearLocalGuestSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(GUEST_SESSION_KEY);
  } catch {
    // Ignore SecureStore error
  }
  await AsyncStorage.removeItem(GUEST_SESSION_KEY).catch(() => {});
}
