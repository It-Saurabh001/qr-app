import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppDispatch } from "@/store/hooks";
import { addHistoryItem } from "@/store/slices/historySlice";

import {
  buildContact,
  buildEmail,
  buildLocation,
  buildPhone,
  buildSms,
  buildText,
  buildUrl,
  buildWifi,
} from "@/services/qr/builders";

import { TypePicker, type CreatorType } from "@/features/creator/TypePicker";

import { TextForm } from "@/features/creator/forms/TextForm";
import { UrlForm } from "@/features/creator/forms/UrlForm";

import {
  WifiForm,
  type WifiFormValues,
} from "@/features/creator/forms/WifiForm";

import {
  ContactForm,
  type ContactFormValues,
} from "@/features/creator/forms/ContactForm";

import { EmailForm } from "@/features/creator/forms/EmailForm";
import { PhoneForm } from "@/features/creator/forms/PhoneForm";
import { SmsForm } from "@/features/creator/forms/SmsForm";

import {
  LocationForm,
  type LocationFormValues,
} from "@/features/creator/forms/LocationForm";

import { QrPreview } from "@/features/creator/QrPreview";
import { StyleControls } from "@/features/creator/StyleControls";
import { useQrExport } from "@/features/creator/useQrExport";

export default function CreateScreen() {
  const router = useRouter();
  const qrRef = useRef<View>(null);
  const dispatch = useAppDispatch();
  const { saveQr, shareQr } = useQrExport(qrRef);

  const [selectedType, setSelectedType] = useState<CreatorType>("url");

  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  const [wifi, setWifi] = useState<WifiFormValues>({
    networkName: "",
    password: "",
    security: "WPA",
    hidden: false,
  });

  const [contact, setContact] = useState<ContactFormValues>({
    name: "",
    phone: "",
    email: "",
    organization: "",
  });

  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const [phone, setPhone] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  const [location, setLocation] = useState<LocationFormValues>({
    latitude: "",
    longitude: "",
  });

  const [foregroundColor, setForegroundColor] = useState("#111827");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [ecl, setEcl] = useState<"L" | "M" | "Q" | "H">("M");

  const previewValue = {
    url: buildUrl(url),
    text: buildText(text),
    wifi: buildWifi(wifi),
    contact: buildContact(contact),
    email: buildEmail({
      email,
      subject,
      message: emailMessage,
    }),
    phone: buildPhone(phone),
    sms: buildSms({
      phone: smsPhone,
      message: smsMessage,
    }),
    location: buildLocation(location),
  }[selectedType];

  function saveToHistory() {
    const content = previewValue.trim();

    if (!content) {
      Alert.alert("Content required", "Enter valid content before saving.");
      return;
    }

    const now = new Date();

    dispatch(
      addHistoryItem({
        id: `create-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        content,
        format: selectedType.toUpperCase(),
        type: "create",
        title: `${selectedType.toUpperCase()} QR`,
        isFavorite: false,
        createdAt: now.toISOString(),
        foregroundColor,
        backgroundColor,
        ecl,
      }),
    );

    Alert.alert("Saved", "Your QR code has been added to history.");
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
      <StatusBar style="auto" />

      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 100,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-2xl self-center">
          <Text className="text-sm font-medium text-violet-600">QR STUDIO</Text>

          <Text className="mb-2 mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            Create QR
          </Text>

          <Text className="mb-6 text-base leading-6 text-slate-500 dark:text-slate-400">
            Turn a link, message, or contact into a shareable QR code.
          </Text>

          {/* Smart AI Creator Banner */}
          <Pressable
            onPress={() => router.push("/create/smart")}
            accessibilityRole="button"
            className="mb-6 flex-row items-center justify-between rounded-3xl border border-violet-200 bg-violet-50/80 p-4 active:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/40"
          >
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 shadow-sm shadow-violet-500/30">
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
              </View>
              <View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-sm font-bold text-slate-900 dark:text-white">
                    Smart AI Creator
                  </Text>
                  <View className="rounded-full bg-violet-200 px-2 py-0.5 dark:bg-violet-900">
                    <Text className="text-[9px] font-extrabold uppercase text-violet-800 dark:text-violet-200">
                      GEMINI
                    </Text>
                  </View>
                </View>
                <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Type in natural English to auto-build QR codes
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#7C3AED" />
          </Pressable>

          <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
            Choose QR type
          </Text>

          <TypePicker selectedType={selectedType} onSelect={setSelectedType} />

          <View className="my-6 gap-4">
            <Text className="text-base font-bold text-slate-900 dark:text-white">
              Enter your content
            </Text>

            {selectedType === "url" && <UrlForm value={url} onChange={setUrl} />}

            {selectedType === "text" && (
              <TextForm value={text} onChange={setText} />
            )}

            {selectedType === "wifi" && (
              <WifiForm value={wifi} onChange={setWifi} />
            )}

            {selectedType === "contact" && (
              <ContactForm value={contact} onChange={setContact} />
            )}

            {selectedType === "email" && (
              <EmailForm
                email={email}
                subject={subject}
                message={emailMessage}
                onEmailChange={setEmail}
                onSubjectChange={setSubject}
                onMessageChange={setEmailMessage}
              />
            )}

            {selectedType === "phone" && (
              <PhoneForm value={phone} onChange={setPhone} />
            )}

            {selectedType === "sms" && (
              <SmsForm
                phone={smsPhone}
                message={smsMessage}
                onPhoneChange={setSmsPhone}
                onMessageChange={setSmsMessage}
              />
            )}

            {selectedType === "location" && (
              <LocationForm value={location} onChange={setLocation} />
            )}
          </View>

          <View className="mb-6">
            <QrPreview
              value={previewValue}
              foregroundColor={foregroundColor}
              backgroundColor={backgroundColor}
              ecl={ecl}
              qrRef={qrRef}
            />

            <View className="mt-4 gap-3">
              <View className="flex-row gap-3">
                <Pressable
                  onPress={saveQr}
                  disabled={!previewValue.trim()}
                  accessibilityRole="button"
                  accessibilityLabel="Save QR code as PNG"
                  className="min-h-12 flex-1 items-center justify-center rounded-xl bg-violet-600 px-2 py-3 disabled:opacity-40"
                >
                  <Text className="text-center text-sm font-semibold text-white">
                    Save PNG
                  </Text>
                </Pressable>

                <Pressable
                  onPress={shareQr}
                  disabled={!previewValue.trim()}
                  accessibilityRole="button"
                  accessibilityLabel="Share QR code"
                  className="min-h-12 flex-1 items-center justify-center rounded-xl bg-slate-800 px-2 py-3 disabled:opacity-40"
                >
                  <Text className="text-center text-sm font-semibold text-white">
                    Share QR
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={saveToHistory}
                disabled={!previewValue.trim()}
                accessibilityRole="button"
                accessibilityLabel="Save QR code to history"
                className="min-h-12 w-full items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 disabled:opacity-40 dark:border-violet-900 dark:bg-violet-950"
              >
                <Text className="text-center text-sm font-semibold text-violet-700 dark:text-violet-200">
                  Save to History
                </Text>
              </Pressable>
            </View>
          </View>

          <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
            Customize Colors
          </Text>

          <View className="mb-6">
            <StyleControls
              foregroundColor={foregroundColor}
              backgroundColor={backgroundColor}
              onForegroundChange={setForegroundColor}
              onBackgroundChange={setBackgroundColor}
            />
          </View>

          <Text className="mb-3 text-base font-bold text-slate-900 dark:text-white">
            Error Correction Level
          </Text>

          <View className="mb-6 flex-row gap-2">
            {(
              [
                { level: "L", label: "Low (7%)" },
                { level: "M", label: "Med (15%)" },
                { level: "Q", label: "Quar (25%)" },
                { level: "H", label: "High (30%)" },
              ] as const
            ).map((item) => {
              const active = ecl === item.level;
              return (
                <Pressable
                  key={item.level}
                  onPress={() => setEcl(item.level)}
                  accessibilityRole="button"
                  accessibilityLabel={`Error correction ${item.label}`}
                  className={`min-h-11 flex-1 items-center justify-center rounded-xl py-2.5 ${active
                    ? "bg-violet-600"
                    : "bg-slate-100 dark:bg-slate-900"
                    }`}
                >
                  <Text
                    className={`text-xs font-semibold ${active
                      ? "text-white"
                      : "text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    {item.level}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-center text-xs text-slate-400">
            Create a QR code, save it as a PNG, or share it with another app.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
