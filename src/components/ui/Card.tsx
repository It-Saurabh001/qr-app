import React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/utils/cn";

type CardProps = ViewProps & {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
};

export function Card({
  children,
  className,
  padded = true,
  ...viewProps
}: CardProps) {
  return (
    <View
      {...viewProps}
      className={cn(
        "rounded-2xl border border-gray-200 bg-surface",
        padded && "p-4",
        className,
      )}
    >
      {children}
    </View>
  );
}
