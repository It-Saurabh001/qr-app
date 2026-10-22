import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

type ColorSwatchProps = {
  color: string;
  selected: boolean;
  onPress: () => void;
  label?: string;
};

export function ColorSwatch({
  color,
  selected,
  onPress,
  label = color,
}: ColorSwatchProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Select color ${label}`}
      accessibilityState={{ selected }}
      className="h-11 w-11 items-center justify-center rounded-full"
      style={{
        borderWidth: selected ? 2 : 0,
        borderColor: color,
      }}
    >
      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{
          backgroundColor: color,
          borderWidth: color.toLowerCase() === "#ffffff" ? 1 : 0,
          borderColor: "#D1D5DB",
        }}
      >
        {selected && (
          <Ionicons
            name="checkmark"
            size={17}
            color={
              ["#ffffff", "#fef08a", "#fde68a"].includes(color.toLowerCase())
                ? "#111827"
                : "#FFFFFF"
            }
          />
        )}
      </View>
    </Pressable>
  );
}
