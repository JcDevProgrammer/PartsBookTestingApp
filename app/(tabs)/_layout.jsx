// app/(tabs)/_layout.jsx
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="user-manual" options={{ title: "User Manual" }} />
      <Tabs.Screen name="video-manual" options={{ title: "Video Manual" }} />
    </Tabs>
  );
}
