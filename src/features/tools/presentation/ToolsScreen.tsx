import { colors, radius, spacing, typography } from "@/core/theme";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { academyTopics } from "./academy-topics";

const CALCULATOR_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  fermentescibles: "beer",
  couleur: "color-palette",
  houblons: "leaf",
  eau: "water",
  rendement: "cog",
  levures: "flask",
  carbonatation: "sparkles",
  avances: "analytics",
};

export function ToolsScreen() {
  const router = useRouter();

  // Filter topics that have calculators
  const calculatorTopics = academyTopics.filter((topic) => topic.hasCalculator);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.brand.secondary}
          />
        </Pressable>
        <ListHeader title="My Tools" subtitle="Calculateurs et simulateurs" />
      </View>

      <FlatList
        data={calculatorTopics}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(app)/tools/[slug]/calculator",
                params: { slug: item.slug },
              })
            }
          >
            <Card style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name={CALCULATOR_ICONS[item.slug] || "calculator"}
                    size={24}
                    color={colors.neutral.white}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDescription} numberOfLines={1}>
                    {item.shortDescription}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.neutral.muted}
                />
              </View>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  list: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xxs,
  },
  cardDescription: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
});
