import React from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-6 py-10">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Text className="text-3xl">⌕</Text>
      </View>

      <Text className="text-center text-lg font-bold text-ink">{title}</Text>

      <Text className="mt-2 max-w-xs text-center text-sm leading-5 text-gray-500">
        {description}
      </Text>

      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} className="mt-5" />
      ) : null}
    </View>
  );
}
