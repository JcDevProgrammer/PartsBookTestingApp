// app/language-setting/index.jsx
import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

export default function LanguageSettingScreen() {
  const router = useRouter();

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
      {/* HEADER */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/icons/back.png")} // Adjust path if needed
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        {/* Header Title */}
        <Text style={styles.headerTitle}>Language Setting</Text>
        {/* Right side placeholder */}
        <View style={{ width: 25, height: 25 }} />
      </View>

      {/* LANGUAGE LIST */}
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
  container: { 
    flex: 1, 
    backgroundColor: "#EDEDED" 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#283593",
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  headerIcon: { 
    width: 25, 
    height: 25, 
    tintColor: "#fff" 
  },
  headerTitle: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  langItem: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: "#ccc" 
  },
  langText: { 
    fontSize: 16, 
    color: "#333" 
  },
});
