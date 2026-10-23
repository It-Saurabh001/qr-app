import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useAppDispatch } from "@/store/hooks";
import { clearAuthError, signInWithGoogle } from "@/store/slices/authSlice";

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <Path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <Path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <Path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </Svg>
  );
}

interface GoogleSignInButtonProps {
  title?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export function GoogleSignInButton({
  title = "Continue with Google",
  disabled = false,
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (disabled || isLoading) return;

    console.log("[GoogleSignInButton] Button clicked. Initiating sign in process...");
    dispatch(clearAuthError());
    setIsLoading(true);

    try {
      await dispatch(signInWithGoogle()).unwrap();
      console.log("[GoogleSignInButton] Sign-in succeeded! Calling onSuccess callback.");
      onSuccess?.();
    } catch (err: any) {
      console.error("[GoogleSignInButton] Sign-in failed with error:", err);
      if (err?.code !== "auth/user-cancelled") {
        onError?.(err?.message || "Google Sign-In failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isButtonDisabled, busy: isLoading }}
      disabled={isButtonDisabled}
      onPress={handlePress}
      className={`min-h-14 flex-row items-center justify-center rounded-2xl border px-5 ${
        isButtonDisabled
          ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
          : "border-slate-300 bg-white active:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:active:bg-slate-800"
      }`}
    >
      {isLoading ? (
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#4285F4" />
          <Text className="ml-3 text-base font-semibold text-slate-700 dark:text-slate-200">
            Connecting Google...
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center">
          <GoogleIcon size={20} />
          <Text className="ml-3 text-base font-semibold text-slate-800 dark:text-white">
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
