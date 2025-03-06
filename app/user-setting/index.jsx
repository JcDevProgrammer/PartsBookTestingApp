// app/user-setting/index.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function UserSettingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingItem} onPress={() => router.push("/language-setting")}>
        <Text style={styles.settingText}>Language Setting</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEDED", padding: 20 },
  settingItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  settingText: { fontSize: 16, color: "#333" },
});
