import { Text, TextInput, View } from "react-native";

type TextFormProps = {
  value: string;
  onChange: (value: string) => void;
};

export function TextForm({ value, onChange }: TextFormProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-gray-900 dark:text-white">
        Your Text
      </Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Enter the text you want to share..."
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        accessibilityLabel="Text to encode in QR code"
        className="min-h-32 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />

      <Text className="text-xs text-gray-500 dark:text-gray-400">
        Add a message, note, or any other plain text.
      </Text>
    </View>
  );
}
