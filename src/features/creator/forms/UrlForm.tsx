import { Text, TextInput, View } from "react-native";

type UrlFormProps = {
  value: string;
  onChange: (value: string) => void;
};

export function UrlForm({ value, onChange }: UrlFormProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-gray-900 dark:text-white">
        Website URL
      </Text>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="https://example.com"
        placeholderTextColor="#9CA3AF"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="url"
        accessibilityLabel="Website URL"
        className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />

      <Text className="text-xs text-gray-500 dark:text-gray-400">
        Enter the website address you want to share.
      </Text>
    </View>
  );
}
