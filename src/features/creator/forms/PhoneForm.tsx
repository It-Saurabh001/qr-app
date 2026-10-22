import { Text, TextInput, View } from "react-native";

type PhoneFormProps = {
  value: string;
  onChange: (value: string) => void;
};

export function PhoneForm({ value, onChange }: PhoneFormProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-gray-900 dark:text-white">
        Phone Number
      </Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Enter phone number"
        placeholderTextColor="#9CA3AF"
        keyboardType="phone-pad"
        autoCorrect={false}
        accessibilityLabel="Phone number to encode"
        className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />

      <Text className="text-xs text-gray-500 dark:text-gray-400">
        Include the country code when needed, for example +91.
      </Text>
    </View>
  );
}
