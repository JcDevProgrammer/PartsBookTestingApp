// app/information/index.jsx
import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function InformationScreen() {
  const router = useRouter();

  const infoItems = [
    { id: "1", title: "Tutorial" },
    { id: "2", title: "Version" },
    { id: "3", title: "License" },
    { id: "4", title: "Clear cache" },
    { id: "5", title: "Pre-load" },
    { id: "6", title: "End user license agreement" },
    { id: "7", title: "Privacy Policy" },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={infoItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEDED", padding: 20 },
  item: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  itemText: { fontSize: 16, color: "#333" },
});
