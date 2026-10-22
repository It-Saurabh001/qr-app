import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = Omit<PressableProps, "children"> & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textClassName?: string;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "bg-surface",
  outline: "border border-primary bg-transparent",
  ghost: "bg-transparent",
  danger: "bg-danger",
};

const variantTextClasses: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-ink",
  outline: "text-primary",
  ghost: "text-primary",
  danger: "text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3",
  md: "min-h-11 px-4",
  lg: "min-h-14 px-6",
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  textClassName,
  className,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      disabled={isDisabled}
      {...pressableProps}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-xl",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        isDisabled && "opacity-50",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? "#FFFFFF"
              : "#64748B"
          }
        />
      ) : (
        <>
          {leftIcon}
          <Text
            className={cn(
              "font-semibold",
              variantTextClasses[variant],
              textSizeClasses[size],
              textClassName,
            )}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}
