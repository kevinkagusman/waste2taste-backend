import { Stack } from "expo-router";
import { StatusBar } from "react-native";

import { AuthProvider } from "@/context/AuthContext";
import { PantryProvider } from "@/context/PantryContext";
import { colors } from "@/data/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PantryProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.red} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.yellow },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="add-ingredients" />
          <Stack.Screen name="scan" />
          <Stack.Screen name="recipe/[id]" />
        </Stack>
      </PantryProvider>
    </AuthProvider>
  );
}
