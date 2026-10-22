import { Text, TextInput, View } from "react-native";

type EmailFormProps = {
  email: string;
  subject: string;
  message: string;
  onEmailChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onMessageChange: (value: string) => void;
};

export function EmailForm({
  email,
  subject,
  message,
  onEmailChange,
  onSubjectChange,
  onMessageChange,
}: EmailFormProps) {
  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Recipient Email
        </Text>

        <TextInput
          value={email}
          onChangeText={onEmailChange}
          placeholder="name@example.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Recipient email address"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Subject
        </Text>

        <TextInput
          value={subject}
          onChangeText={onSubjectChange}
          placeholder="Enter email subject"
          placeholderTextColor="#9CA3AF"
          accessibilityLabel="Email subject"
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
          accessibilityLabel="Email message"
          className="min-h-32 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>

      <Text className="text-xs text-gray-500 dark:text-gray-400">
        Enter the email details that should be prefilled when someone scans your
        QR code.
      </Text>
    </View>
  );
}
