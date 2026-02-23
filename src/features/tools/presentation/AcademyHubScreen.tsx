import { colors, radius, spacing, typography } from "@/core/theme";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { academyTopics } from "./academy-topics";

const TOPIC_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  introduction: "book",
  fermentescibles: "beer",
  couleur: "color-palette",
  houblons: "leaf",
  eau: "water",
  rendement: "cog",
  levures: "flask",
  carbonatation: "football",
  avances: "analytics",
  glossaire: "library",
};

export function AcademyHubScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <ListHeader
          title="My Academy"
          subtitle="Base pédagogique et scientifique"
        />
      </View>

      <FlatList
        data={academyTopics}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(app)/tools/[slug]",
                params: { slug: item.slug },
              })
            }
          >
            <Card style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name={TOPIC_ICONS[item.slug] || "book"}
                    size={24}
                    color={colors.neutral.white}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={styles.keywordsRow}>
                    {item.keywords?.slice(0, 3).map((keyword, index) => (
                      <View key={index} style={styles.keywordChip}>
                        <Text style={styles.keywordText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
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
});
