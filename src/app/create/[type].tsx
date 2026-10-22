import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const fieldMap: Record<
  string,
  { key: string; label: string; placeholder: string; multiline?: boolean }[]
> = {
  url: [
    { key: "url", label: "Website URL", placeholder: "https://example.com" },
  ],
  text: [
    {
      key: "text",
      label: "Your text",
      placeholder: "Enter the text to encode",
      multiline: true,
    },
  ],
  wifi: [
    { key: "ssid", label: "Network name (SSID)", placeholder: "Wi-Fi name" },
    { key: "password", label: "Password", placeholder: "Wi-Fi password" },
  ],
  contact: [
    { key: "name", label: "Full name", placeholder: "Your name" },
    { key: "phone", label: "Phone number", placeholder: "+91 98765 43210" },
    { key: "email", label: "Email address", placeholder: "you@example.com" },
  ],
  email: [
    {
      key: "email",
      label: "Recipient email",
      placeholder: "hello@example.com",
    },
    { key: "subject", label: "Subject", placeholder: "Email subject" },
  ],
  phone: [
    { key: "phone", label: "Phone number", placeholder: "+91 98765 43210" },
  ],
  sms: [
    { key: "phone", label: "Phone number", placeholder: "+91 98765 43210" },
    {
      key: "message",
      label: "Message",
      placeholder: "Your message",
      multiline: true,
    },
  ],
  location: [
    { key: "latitude", label: "Latitude", placeholder: "26.8467" },
    { key: "longitude", label: "Longitude", placeholder: "80.9462" },
  ],
};

const typeLabels: Record<string, string> = {
  url: "Website URL",
  text: "Plain Text",
  wifi: "Wi-Fi",
  contact: "Contact",
  email: "Email",
  phone: "Phone",
  sms: "SMS",
  location: "Location",
};

export default function CreateDetailsScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const selectedType = (type ?? "text").toLowerCase();
  const fields = fieldMap[selectedType] ?? fieldMap.text;
  const title = typeLabels[selectedType] ?? "QR Details";

  const [values, setValues] = useState<Record<string, string>>({});

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const canContinue = fields.every((field) => values[field.key]?.trim());

  const continueToPreview = () => {
    if (!canContinue) return;

    const payload = fields
      .map((field) => `${field.label}: ${values[field.key].trim()}`)
      .join("\n");

    router.push({
      pathname: "/create-preview",
      params: { type: selectedType, value: payload },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900"
          >
            <Text className="text-2xl text-slate-900 dark:text-white">‹</Text>
          </Pressable>

          <View className="flex-1">
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              Create {title} QR
            </Text>
            <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter the information for your code
            </Text>
          </View>
        </View>

        <View className="mb-6 rounded-3xl bg-violet-50 p-5 dark:bg-violet-950">
          <Text className="text-sm font-semibold text-violet-700 dark:text-violet-300">
            SELECTED QR TYPE
          </Text>
          <Text className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </Text>
          <Text className="mt-2 leading-5 text-slate-600 dark:text-slate-300">
            Your information will be used to prepare a QR code preview.
          </Text>
        </View>

        {fields.map((field) => (
          <View key={field.key} className="mb-5">
            <Text className="mb-2 font-semibold text-slate-800 dark:text-slate-200">
              {field.label}
            </Text>
            <TextInput
              value={values[field.key] ?? ""}
              onChangeText={(value) => updateValue(field.key, value)}
              placeholder={field.placeholder}
              placeholderTextColor="#94A3B8"
              autoCapitalize={
                field.key === "url" || field.key === "email"
                  ? "none"
                  : "sentences"
              }
              keyboardType={
                field.key === "email"
                  ? "email-address"
                  : field.key === "phone"
                    ? "phone-pad"
                    : field.key === "latitude" || field.key === "longitude"
                      ? "decimal-pad"
                      : "default"
              }
              multiline={field.multiline}
              textAlignVertical={field.multiline ? "top" : "center"}
              accessibilityLabel={field.label}
              className={`rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white ${
                field.multiline ? "min-h-28" : ""
              }`}
            />
          </View>
        ))}

        <Pressable
          onPress={continueToPreview}
          disabled={!canContinue}
          accessibilityRole="button"
          className={`mt-3 items-center rounded-2xl py-4 ${
            canContinue ? "bg-violet-600" : "bg-violet-300 dark:bg-violet-900"
          }`}
        >
          <Text className="font-bold text-white">Continue to Preview →</Text>
        </Pressable>

        <Text className="mt-4 text-center text-xs leading-5 text-slate-400">
          Preview and QR generation are not connected yet.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
