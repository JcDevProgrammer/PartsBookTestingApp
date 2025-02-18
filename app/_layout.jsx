import { Stack } from "expo-router";
import React from "react";

// Optional: If you have a custom color scheme hook or theming, import it here
// import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* This wraps all routes in app/: index, model-list, (tabs), +not-found, etc. */}
    </Stack>
  );
}
