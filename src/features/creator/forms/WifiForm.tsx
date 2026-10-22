import { Text, TextInput, View } from "react-native";

export type WifiFormValues = {
  networkName: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
};

type WifiFormProps = {
  value: WifiFormValues;
  onChange: (value: WifiFormValues) => void;
};

export function WifiForm({ value, onChange }: WifiFormProps) {
  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Network Name (SSID)
        </Text>

        <TextInput
          value={value.networkName}
          onChangeText={(networkName) => onChange({ ...value, networkName })}
          placeholder="Enter Wi-Fi network name"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Wi-Fi network name"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Password
        </Text>

        <TextInput
          value={value.password}
          onChangeText={(password) => onChange({ ...value, password })}
          placeholder="Enter Wi-Fi password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Wi-Fi password"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Security
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {(["WPA", "WEP", "nopass"] as const).map((security) => {
            const selected = value.security === security;
            const label = security === "nopass" ? "None" : security;

            return (
              <Text
                key={security}
                onPress={() => onChange({ ...value, security })}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={`rounded-xl border px-4 py-3 font-semibold ${
                  selected
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                }`}
              >
                {label}
              </Text>
            );
          })}
        </View>
      </View>

      <Text className="text-xs text-gray-500 dark:text-gray-400">
        Choose the network security type. Select None for an open network.
      </Text>
    </View>
  );
}
