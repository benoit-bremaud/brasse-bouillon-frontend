import { colors, radius, spacing, typography } from "@/core/theme";
import { Pressable, StyleSheet, Text } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import React from "react";

type Props = {
  onPress: () => void;
  label?: string;
  accessibilityLabel?: string;
};

export function HeaderBackButton({
  onPress,
  label = "Back",
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Ionicons name="chevron-back" size={18} color={colors.brand.secondary} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.background,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
