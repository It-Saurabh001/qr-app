import { Text, TextInput, View } from "react-native";

type SmsFormProps = {
  phone: string;
  message: string;
  onPhoneChange: (value: string) => void;
  onMessageChange: (value: string) => void;
};

export function SmsForm({
  phone,
  message,
  onPhoneChange,
  onMessageChange,
}: SmsFormProps) {
  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Phone Number
        </Text>

        <TextInput
          value={phone}
          onChangeText={onPhoneChange}
          placeholder="Enter phone number"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          autoCorrect={false}
          accessibilityLabel="SMS recipient phone number"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Message
        </Text>

        <TextInput
          value={message}
          onChangeText={onMessageChange}
          placeholder="Write your message..."
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          accessibilityLabel="SMS message"
          className="min-h-32 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>
    </View>
  );
}
