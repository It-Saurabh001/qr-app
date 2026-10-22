import { Pressable, Text, View } from "react-native";
import type { AppTheme } from "@/store/slices/settingsSlice";
import { setTheme } from "@/store/slices/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const options: { label: string; value: AppTheme }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export function ThemeSelector() {
  const dispatch = useAppDispatch();
  const selectedTheme = useAppSelector((state) => state.settings.theme);

  return (
    <View className="gap-3">
      <Text className="text-lg font-semibold text-black dark:text-white">
        Appearance
      </Text>

      <View className="flex-row gap-2">
        {options.map((option) => {
          const selected = selectedTheme === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => dispatch(setTheme(option.value))}
              className={`flex-1 items-center rounded-xl border p-3 ${
                selected
                  ? "border-blue-600 bg-blue-100 dark:bg-blue-950"
                  : "border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-900"
              }`}
            >
              <Text className="font-medium text-black dark:text-white">
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
