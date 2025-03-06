// app/language-setting/index.jsx
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

export default function LanguageSettingScreen() {
  const languages = [
    "English",
    "日本語",
    "简体中文",
    "Español",
    "Français",
    "Deutsch",
    "Italiano",
    "Tiếng Việt",
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={languages}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.langItem}>
            <Text style={styles.langText}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEDED" },
  langItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  langText: { fontSize: 16, color: "#333" },
});
