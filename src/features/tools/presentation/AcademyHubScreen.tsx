import { colors, radius, spacing, typography } from "@/core/theme";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { Screen } from "@/core/ui/Screen";
import { useRouter } from "expo-router";
import React from "react";
import { academyTopics } from "./academy-topics";

const TOPIC_ICONS: Record<string, string> = {
  introduction: "📖",
  fermentescibles: "🍺",
  couleur: "🎨",
  houblons: "🌿",
  eau: "💧",
  rendement: "⚙️",
  levures: "🧬",
  carbonatation: "🫧",
  avances: "🔬",
  glossaire: "📚",
};

export function AcademyHubScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Académie brassicole</Text>
          <Text style={styles.headerSubtitle}>
            Base pédagogique et scientifique
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {academyTopics.map((topic) => (
          <Pressable
            key={topic.slug}
            accessibilityRole="button"
            accessibilityLabel={`Ouvrir le thème ${topic.title}`}
            onPress={() =>
              router.push({
                pathname: "/tools/[slug]",
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
                  <Text style={styles.iconText}>
                    {TOPIC_ICONS[topic.slug] || "📚"}
                  </Text>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{topic.title}</Text>
                  <View style={styles.keywordsRow}>
                    {topic.keywords?.slice(0, 3).map((keyword, index) => (
                      <View key={index} style={styles.keywordChip}>
                        <Text style={styles.keywordText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <Text style={styles.chevron}>›</Text>
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
  iconText: {
    fontSize: 24,
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
  keywordsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xxs,
  },
  keywordChip: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  keywordText: {
    fontSize: 10,
    color: colors.neutral.textSecondary,
    fontWeight: typography.weight.medium,
  },
  chevron: {
    fontSize: 24,
    color: colors.neutral.textSecondary,
    fontWeight: typography.weight.bold,
  },
});
