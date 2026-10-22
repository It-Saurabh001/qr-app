import { Text, TextInput, View } from "react-native";

export type ContactFormValues = {
  name: string;
  phone: string;
  email: string;
  organization: string;
};

type ContactFormProps = {
  value: ContactFormValues;
  onChange: (value: ContactFormValues) => void;
};

export function ContactForm({ value, onChange }: ContactFormProps) {
  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Full Name
        </Text>

        <TextInput
          value={value.name}
          onChangeText={(name) => onChange({ ...value, name })}
          placeholder="Enter full name"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
          autoCorrect={false}
          accessibilityLabel="Contact full name"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Phone Number
        </Text>

        <TextInput
          value={value.phone}
          onChangeText={(phone) => onChange({ ...value, phone })}
          placeholder="Enter phone number"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          accessibilityLabel="Contact phone number"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Email Address
        </Text>

        <TextInput
          value={value.email}
          onChangeText={(email) => onChange({ ...value, email })}
          placeholder="name@example.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Contact email address"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Organization (Optional)
        </Text>

        <TextInput
          value={value.organization}
          onChangeText={(organization) => onChange({ ...value, organization })}
          placeholder="Company or organization"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
          accessibilityLabel="Contact organization"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>
    </View>
  );
}
