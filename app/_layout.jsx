import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 
        This automatically wraps all routes in app/: 
        index, select-folder, model-list, (tabs), +not-found, etc. 
      */}
    </Stack>
  );
}
