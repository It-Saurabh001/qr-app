import React from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { cn } from "@/utils/cn";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  inputClassName?: string;
};

export function Input({
  label,
  error,
  helperText,
  containerClassName,
  inputClassName,
  editable = true,
  ...textInputProps
}: InputProps) {
  return (
    <View className={cn("w-full gap-2", containerClassName)}>
      {label ? (
        <Text className="text-sm font-semibold text-ink">{label}</Text>
      ) : null}

      <TextInput
        {...textInputProps}
        editable={editable}
        placeholderTextColor="#94A3B8"
        className={cn(
          "min-h-12 rounded-xl border bg-surface px-4 py-3",
          "text-base text-ink",
          error ? "border-danger" : "border-gray-300",
          !editable && "opacity-60",
          inputClassName,
        )}
        accessibilityLabel={textInputProps.accessibilityLabel ?? label}
        accessibilityState={{ disabled: !editable }}
      />

      {error ? (
        <Text accessibilityRole="alert" className="text-sm text-danger">
          {error}
        </Text>
      ) : helperText ? (
        <Text className="text-sm text-gray-500">{helperText}</Text>
      ) : null}
    </View>
  );
}
