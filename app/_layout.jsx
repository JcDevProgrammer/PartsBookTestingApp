import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import SplashScreen from "./SplashScreen";

export default function RootLayout() {
  const [isSplashVisible, setIsSplashVisible] = useState(Platform.OS !== "web");

  useEffect(() => {
    if (Platform.OS !== "web") {
      const timer = setTimeout(() => {
        setIsSplashVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return <Stack screenOptions={{ headerShown: false }}>{}</Stack>;
}
