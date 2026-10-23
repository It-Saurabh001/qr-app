import { useRouter } from "expo-router";
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

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthError, signUp } from "@/store/slices/authSlice";

export default function SignUpScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { opStatus, error } = useAppSelector((state) => state.auth);
  const isLoading = opStatus === "loading";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSignUp = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    setValidationError("");
    dispatch(clearAuthError());

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setValidationError("Please fill in all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setValidationError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    try {
      await dispatch(
        signUp({
          name: cleanName,
          email: cleanEmail,
          password,
        }),
      ).unwrap();

      handleAuthSuccess();
    } catch {
      // Redux stores the friendly Firebase error message.
    }
  };

  const handleAuthSuccess = () => {
    console.log('[Auth] ✅ Sign-up successful, navigating to Home tabs.');
    router.replace("/(tabs)");
  };

  const clearMessages = () => {
    setValidationError("");
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
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-6 py-6 w-full max-w-md self-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              className="mb-7 h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900"
            >
              <Text className="text-2xl text-slate-800 dark:text-white">‹</Text>
            </Pressable>

            <View className="mb-7">
              <View className="mb-5 h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">
                <Text className="text-3xl font-bold text-white">⌗</Text>
              </View>

              <Text className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">
                Create account
              </Text>

              <Text className="text-base leading-6 text-slate-500 dark:text-slate-400">
                Join QR Studio to organize your scans and created QR codes.
              </Text>
            </View>

            <View className="gap-4">
              <View>
                <Text className="mb-2 font-semibold text-slate-800 dark:text-slate-200">
                  Full name
                </Text>

                <TextInput
                  accessibilityLabel="Full name"
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    clearMessages();
                  }}
                  placeholder="Enter your name"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoComplete="name"
                  editable={!isLoading}
                  returnKeyType="next"
                  className="min-h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </View>

              <View>
                <Text className="mb-2 font-semibold text-slate-800 dark:text-slate-200">
                  Email address
                </Text>

                <TextInput
                  accessibilityLabel="Email address"
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
                  returnKeyType="next"
                  className="min-h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </View>

              <View>
                <Text className="mb-2 font-semibold text-slate-800 dark:text-slate-200">
                  Password
                </Text>

                <View className="min-h-14 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-900">
                  <TextInput
                    accessibilityLabel="Password"
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      clearMessages();
                    }}
                    placeholder="Create a password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    editable={!isLoading}
                    returnKeyType="next"
                    className="flex-1 py-3 text-base text-slate-900 dark:text-white"
                  />

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text className="font-semibold text-violet-600">
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View>
                <Text className="mb-2 font-semibold text-slate-800 dark:text-slate-200">
                  Confirm password
                </Text>

                <View className="min-h-14 flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-900">
                  <TextInput
                    accessibilityLabel="Confirm password"
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      clearMessages();
                    }}
                    placeholder="Enter password again"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                    className="flex-1 py-3 text-base text-slate-900 dark:text-white"
                  />

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text className="font-semibold text-violet-600">
                      {showConfirmPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {(validationError || error) && (
                <Text
                  accessibilityRole="alert"
                  className="text-sm leading-5 text-red-600 dark:text-red-400"
                >
                  {validationError || error?.message}
                </Text>
              )}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isLoading, busy: isLoading }}
                disabled={isLoading}
                onPress={handleSignUp}
                className={`mt-3 min-h-14 items-center justify-center rounded-2xl bg-violet-600 active:bg-violet-700 ${isLoading ? "opacity-60" : ""
                  }`}
              >
                <Text className="text-base font-semibold text-white">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </Pressable>

              {/* Divider */}
              <View className="my-3 flex-row items-center">
                <View className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <Text className="mx-4 text-xs font-medium text-slate-400">
                  OR
                </Text>
                <View className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </View>

              {/* Google Sign In */}
              <GoogleSignInButton
                title="Sign up with Google"
                disabled={isLoading}
                onSuccess={handleAuthSuccess}
                onError={setValidationError}
              />
            </View>

            <View className="mt-7 flex-row justify-center">
              <Text className="text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
              </Text>

              <Pressable
                accessibilityRole="link"
                onPress={() => router.replace("/(auth)/sign-in")}
              >
                <Text className="font-semibold text-violet-600">Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
