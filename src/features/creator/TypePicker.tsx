import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

export type CreatorType =
  "url" | "text" | "wifi" | "contact" | "email" | "phone" | "sms" | "location";

type TypeOption = {
  id: CreatorType;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const TYPE_OPTIONS: TypeOption[] = [
  { id: "url", label: "URL", icon: "link-outline" },
  { id: "text", label: "Text", icon: "text-outline" },
  { id: "wifi", label: "Wi-Fi", icon: "wifi-outline" },
  { id: "contact", label: "Contact", icon: "person-outline" },
  { id: "email", label: "Email", icon: "mail-outline" },
  { id: "phone", label: "Phone", icon: "call-outline" },
  { id: "sms", label: "SMS", icon: "chatbubble-outline" },
  { id: "location", label: "Location", icon: "location-outline" },
];

type TypePickerProps = {
  selectedType: CreatorType;
  onSelect: (type: CreatorType) => void;
};

export function TypePicker({ selectedType, onSelect }: TypePickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
    >
      {TYPE_OPTIONS.map((option) => {
        const selected = selectedType === option.id;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(option.id)}
            className={`items-center justify-center rounded-2xl border px-4 py-3 ${
              selected
                ? "border-violet-600 bg-violet-600"
                : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
            }`}
          >
            <View className="mb-1">
              <Ionicons
                name={option.icon}
                size={22}
                color={selected ? "#FFFFFF" : "#8B5CF6"}
              />
            </View>

            <Text
              className={`text-xs font-semibold ${
                selected ? "text-white" : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
