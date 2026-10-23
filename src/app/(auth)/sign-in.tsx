
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { saveLocalGuestSession } from "@/services/auth/localGuestSession";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearAuthError,
  signIn,
} from "@/store/slices/authSlice";
import { guestSessionStarted } from "@/store/slices/localGuestSlice";

export default function SignInScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { opStatus, error } = useAppSelector((state) => state.auth);
  const isLoading = opStatus === "loading";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const isBusy = isLoading || isGuestLoading;

  const handleSignIn = async () => {
    if (isBusy) return;

    setValidationError("");
    dispatch(clearAuthError());

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setValidationError("Please enter your email and password.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    try {
      await dispatch(
        signIn({
          email: cleanEmail,
          password,
        }),
      ).unwrap();

      handleAuthSuccess();
    } catch {
      // The Redux auth slice stores the sign-in error.
      // Keep this catch to prevent an unhandled rejection.
    }
  };

  const handleAuthSuccess = () => {
    console.log('[Auth] ✅ Sign-in successful, navigating to Home tabs.');
    router.replace("/(tabs)");
  };

  const handleContinueAsGuest = async () => {
    if (isBusy) return;

    setValidationError("");
    dispatch(clearAuthError());
    setIsGuestLoading(true);

    try {
      // Create a local guest session without Firebase authentication.
      await saveLocalGuestSession();

      // Update Redux guest state only after saving succeeds.
      dispatch(guestSessionStarted());

      router.replace("/(tabs)");
    } catch {
      setValidationError(
        "Could not start Guest Mode. Please try again.",
      );
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow justify-center px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md self-center">
            {/* Header */}
            <View className="mb-10">
              <View className="mb-6 h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">
                <Text className="text-3xl font-bold text-white">
                  ⌗
                </Text>
              </View>

              <Text className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
                Welcome back
              </Text>

              <Text className="text-base leading-6 text-slate-500 dark:text-slate-400">
                Sign in to your account or continue as a guest to use
                QR Studio offline.
              </Text>
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Email address
              </Text>

              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setValidationError("");
                  if (error) dispatch(clearAuthError());
                }}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={!isBusy}
                accessibilityLabel="Email address"
                returnKeyType="next"
                className="min-h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </View>

            {/* Password */}
            <View className="mb-3">
              <Text className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Password
              </Text>

              <View className="min-h-14 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 pr-4 dark:border-slate-800 dark:bg-slate-900">
                <TextInput
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setValidationError("");
                    if (error) dispatch(clearAuthError());
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="current-password"
                  editable={!isBusy}
                  accessibilityLabel="Password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                  className="min-h-14 flex-1 px-4 text-base text-slate-900 dark:text-white"
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  disabled={isBusy}
                  onPress={() => setShowPassword((current) => !current)}
                  hitSlop={8}
                >
                  <Text className="font-semibold text-violet-600">
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Forgot password */}
            <View className="mb-6 items-end">
              <Link href="/(auth)/forgot-password" asChild>
                <Pressable disabled={isBusy}>
                  <Text className="text-sm font-semibold text-violet-600">
                    Forgot password?
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Errors */}
            {!!validationError && (
              <View
                accessibilityRole="alert"
                className="mb-4 rounded-xl bg-red-50 p-3 dark:bg-red-950"
              >
                <Text className="text-sm text-red-600 dark:text-red-300">
                  {validationError}
                </Text>
              </View>
            )}

            {!!error && !validationError && (
              <View
                accessibilityRole="alert"
                className="mb-4 rounded-xl bg-red-50 p-3 dark:bg-red-950"
              >
                <Text className="text-sm text-red-600 dark:text-red-300">
                  {error.message}
                </Text>
              </View>
            )}

            {/* Sign in */}
            <Pressable
              accessibilityRole="button"
              disabled={isBusy}
              onPress={handleSignIn}
              className={`min-h-14 flex-row items-center justify-center rounded-2xl px-5 ${isBusy
                ? "bg-violet-400"
                : "bg-violet-600 active:bg-violet-700"
                }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Sign In
                </Text>
              )}
            </Pressable>

            {/* Sign up */}
            <View className="mt-5 flex-row items-center justify-center">
              <Text className="text-sm text-slate-500 dark:text-slate-400">
                {"Don't have an account? "}
              </Text>

              <Link href="/(auth)/sign-up" asChild>
                <Pressable disabled={isBusy}>
                  <Text className="text-sm font-semibold text-violet-600">
                    Create Account
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Divider */}
            <View className="my-6 flex-row items-center">
              <View className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

              <Text className="mx-4 text-xs font-medium text-slate-400">
                OR
              </Text>

              <View className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </View>

            {/* Google Sign In for online users */}
            <GoogleSignInButton
              title="Continue with Google"
              disabled={isBusy}
              onSuccess={handleAuthSuccess}
              onError={setValidationError}
            />

            {/* Offline Guest Divider */}
            <View className="my-6 flex-row items-center">
              <View className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

              <Text className="mx-4 text-xs font-medium text-slate-400">
                OR CONTINUE OFFLINE
              </Text>

              <View className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </View>

            {/* Offline guest mode */}
            <Pressable
              accessibilityRole="button"
              disabled={isBusy}
              onPress={handleContinueAsGuest}
              className={`min-h-14 flex-row items-center justify-center rounded-2xl border px-5 ${isBusy
                ? "border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                : "border-slate-300 bg-white active:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:active:bg-slate-900"
                }`}
            >
              {isGuestLoading ? (
                <>
                  <ActivityIndicator color="#7C3AED" />
                  <Text className="ml-3 text-base font-semibold text-violet-600">
                    Starting Guest Mode...
                  </Text>
                </>
              ) : (
                <Text className="text-base font-semibold text-slate-800 dark:text-white">
                  Continue as Guest
                </Text>
              )}
            </Pressable>

            <Text className="mt-4 text-center text-xs leading-5 text-slate-400">
              Guest Mode works offline. Your guest session and local QR
              history are stored on this device.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
