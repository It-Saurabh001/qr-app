import { Text, TextInput, View } from "react-native";

export type LocationFormValues = {
  latitude: string;
  longitude: string;
};

type LocationFormProps = {
  value: LocationFormValues;
  onChange: (value: LocationFormValues) => void;
};

export function LocationForm({ value, onChange }: LocationFormProps) {
  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Latitude
        </Text>

        <TextInput
          value={value.latitude}
          onChangeText={(latitude) => onChange({ ...value, latitude })}
          placeholder="e.g. 26.8467"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          accessibilityLabel="Location latitude"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>

      <View className="gap-2">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white">
          Longitude
        </Text>

        <TextInput
          value={value.longitude}
          onChangeText={(longitude) => onChange({ ...value, longitude })}
          placeholder="e.g. 80.9462"
          placeholderTextColor="#9CA3AF"
          keyboardType="decimal-pad"
          accessibilityLabel="Location longitude"
          className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </View>

      <Text className="text-xs text-gray-500 dark:text-gray-400">
        Enter the coordinates of the location you want to share.
      </Text>
    </View>
  );
}
