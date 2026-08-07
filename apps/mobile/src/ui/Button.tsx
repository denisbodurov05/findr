import { ReactNode } from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors, fonts, radius, spacing } from "@/config/theme";

interface ButtonProps {
  label?: string;
  accessibilityLabel?: string;
  onPress?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  variant?: "primary" | "danger" | "ghost";
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  accessibilityLabel,
  onPress,
  icon,
  disabled,
  variant = "primary",
  style,
}: ButtonProps) {
  const iconOnly = !label && Boolean(icon);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        iconOnly && styles.iconOnly,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {label ? (
          <Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>{label}</Text>
        ) : null}
        {icon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radius.md,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: colors.border,
    borderWidth: 1,
  },
  iconOnly: {
    minWidth: 46,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  label: {
    color: colors.surface,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  ghostLabel: {
    color: colors.primary,
  },
});
