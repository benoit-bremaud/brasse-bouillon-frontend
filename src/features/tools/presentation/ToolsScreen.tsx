import { colors, radius, spacing, typography } from "@/core/theme";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { Screen } from "@/core/ui/Screen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Outils</Text>
          <Text style={styles.headerSubtitle}>Calculateurs et simulateurs</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {calculatorTopics.map((topic) => (
          <Pressable
            key={topic.slug}
            accessibilityRole="button"
            accessibilityLabel={`Ouvrir ${topic.title}`}
            onPress={() =>
              router.push({
                pathname: "/tools/[slug]/calculator",
                params: { slug: topic.slug },
              })
            }
            style={({ pressed }) => [
              styles.cardPressable,
              pressed && styles.cardPressablePressed,
            ]}
          >
            <Card style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name={CALCULATOR_ICONS[topic.slug] || "calculator"}
                    size={24}
                    color={colors.brand.secondary}
                  />
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{topic.title}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {topic.shortDescription}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.neutral.textSecondary}
                />
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  backArrow: {
    fontSize: 20,
    color: colors.brand.secondary,
    fontWeight: typography.weight.bold,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  content: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  cardPressable: {
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
  },
  cardPressablePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  card: {
    padding: spacing.sm,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xxs,
  },
  cardDescription: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
  },
});
