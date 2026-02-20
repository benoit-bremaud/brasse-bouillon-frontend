import { colors } from "@/core/theme";
import { Stack } from "expo-router";

export default function ToolsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.neutral.white,
        },
        headerTintColor: colors.neutral.textPrimary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Outils",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[slug]/index"
        options={{
          title: "Académie",
        }}
      />
      <Stack.Screen
        name="[slug]/calculator"
        options={{
          title: "Calculateur",
        }}
      />
      <Stack.Screen
        name="[slug]/learn"
        options={{
          title: "Cours",
        }}
      />
    </Stack>
  );
}
