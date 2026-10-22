import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, Pressable, StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const colors = Colors[isDark ? "dark" : "light"];
  const insets = useSafeAreaInsets();

  const bottomPadding = insets.bottom > 0 ? insets.bottom : 8;
  const barHeight = Platform.select({
    ios: 62 + insets.bottom,
    android: 66 + (insets.bottom > 0 ? insets.bottom : 0),
    default: 66,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: isDark ? "#94A3B8" : "#64748B",
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: barHeight,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Middle Scan QR Button (Elevated Circle) */}
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarLabel: () => null,
          tabBarButton: ({ ref, style, onPress, onLongPress, accessibilityState, testID }) => {
            const focused = accessibilityState?.selected;

            return (
              <Pressable
                onPress={onPress}
                onLongPress={onLongPress}
                testID={testID}
                accessibilityRole="button"
                accessibilityLabel="Scan QR code"
                accessibilityState={accessibilityState}
                style={[
                  style as any,
                  {
                    top: -18,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: "#7C3AED",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 4,
                    borderColor: colors.background,
                    elevation: 8,
                    shadowColor: "#7C3AED",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.45,
                    shadowRadius: 10,
                    transform: [{ scale: focused ? 1.05 : 1 }],
                  }}
                >
                  <Ionicons name="qr-code" size={30} color="#FFFFFF" />
                </View>
              </Pressable>
            );
          },
        }}
      />

      {/* 3. Create QR Tab */}
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden from bottom bar, accessible via navigation */}
      <Tabs.Screen
        name="history"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
