import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Home route = app/index.tsx */}
      <Stack.Screen name="index" />

      {/* Modal route = app/modal.tsx */}
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
