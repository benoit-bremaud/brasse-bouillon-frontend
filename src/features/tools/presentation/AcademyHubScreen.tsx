import { colors, radius, spacing, typography } from "@/core/theme";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { useRouter } from "expo-router";
import React from "react";
import { academyTopics } from "./academy-topics";

export function AcademyHubScreen() {
  const router = useRouter();

  return (
    <Screen>
      <ListHeader
        title="Académie brassicole"
        subtitle="Base pédagogique, scientifique et historique du brassage"
      />

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
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{topic.title}</Text>
                <Image
                  source={topic.mascotImage}
                  style={styles.mascot}
                  resizeMode="cover"
                  accessibilityRole="image"
                  accessibilityLabel={topic.mascotAlt}
                />
              </View>

              <View style={styles.keywordsRow}>
                {topic.keywords?.map((keyword, index) => (
                  <View key={index} style={styles.keywordChip}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>

              {topic.status === "ready" && (
                <View style={styles.readyBadge}>
                  <Text style={styles.readyText}>✓ Disponible</Text>
                </View>
              )}
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  cardPressable: {
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
  },
  cardPressablePressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  card: {
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
  },
  mascot: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.semantic.info,
  },
  cardTitle: {
    color: colors.neutral.textPrimary,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xxs,
    flex: 1,
    paddingRight: spacing.xs,
  },
  keywordsRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  keywordChip: {
    backgroundColor: colors.brand.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  keywordText: {
    fontSize: typography.size.caption,
    color: colors.brand.secondary,
    fontWeight: typography.weight.medium,
  },
  readyBadge: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.semantic.success,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  readyText: {
    fontSize: typography.size.caption,
    color: colors.neutral.white,
    fontWeight: typography.weight.bold,
  },
});
