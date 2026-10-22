import React from "react";
import { Text, View } from "react-native";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  className?: string;
};

const badgeClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100",
  success: "bg-success/15",
  warning: "bg-warning/15",
  danger: "bg-danger/15",
};

const textClasses: Record<BadgeVariant, string> = {
  default: "text-gray-700",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export function Badge({ label, variant = "default", className }: BadgeProps) {
  return (
    <View
      className={cn(
        "self-start rounded-full px-3 py-1",
        badgeClasses[variant],
        className,
      )}
    >
      <Text className={cn("text-xs font-semibold", textClasses[variant])}>
        {label}
      </Text>
    </View>
  );
}
