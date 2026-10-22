import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, resetPassword } from "@/store/slices/authSlice";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { opStatus, error } = useAppSelector((state) => state.auth);
  const isLoading = opStatus === "loading";

  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleResetPassword = async () => {
    const cleanEmail = email.trim();

    setValidationError("");
    setSuccessMessage("");
    dispatch(clearAuthError());

    if (!cleanEmail) {
      setValidationError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    try {
      await dispatch(resetPassword({ email: cleanEmail })).unwrap();

      setSuccessMessage(
        "If an account exists for this email, a password reset email has been requested. Please check your inbox.",
      );
    } catch {
      // Redux stores the friendly Firebase error message.
    }
  };

  const clearMessages = () => {
    setValidationError("");
    setSuccessMessage("");
    dispatch(clearAuthError());
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 20,
          }}
        >
          <View className="w-full max-w-md self-center flex-1">
            <Pressable
              onPress={() => router.back()}
              className="mb-10 h-11 w-11 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text className="text-2xl text-slate-900 dark:text-white">‹</Text>
            </Pressable>

            <View className="mb-8 h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950">
              <Text className="text-3xl">🔐</Text>
            </View>

            <Text className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">
              Forgot password?
            </Text>

            <Text className="mb-8 text-base leading-6 text-slate-500 dark:text-slate-400">
              No worries! Enter the email address linked to your account. We’ll
              help you reset your password.
            </Text>

            <Text className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Email address
            </Text>

            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                clearMessages();
              }}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isLoading}
              returnKeyType="send"
              onSubmitEditing={handleResetPassword}
              accessibilityLabel="Email address"
              className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />

            {(validationError || error || successMessage) && (
              <Text
                accessibilityRole="alert"
                className={`mb-5 text-sm leading-5 ${successMessage
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                  }`}
              >
                {successMessage || validationError || error?.message}
              </Text>
            )}

            <Pressable
              onPress={handleResetPassword}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading, busy: isLoading }}
              className={`items-center rounded-2xl bg-violet-600 py-4 active:bg-violet-700 ${isLoading ? "opacity-60" : ""
                }`}
            >
              <Text className="text-base font-bold text-white">
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Text>
            </Pressable>

            <View className="mt-8 flex-row justify-center">
              <Text className="text-slate-500 dark:text-slate-400">
                Remember your password?{" "}
              </Text>

              <Link href="/(auth)/sign-in" asChild>
                <Pressable accessibilityRole="link">
                  <Text className="font-bold text-violet-600">Sign In</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
