import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";

export default function UserManualScreen() {
  const categories = [
    { id: "1", title: "Catalogue" },
    { id: "2", title: "Error code" },
    { id: "3", title: "Instruction manual" },
    { id: "4", title: "Notification" },
    { id: "5", title: "Parts book" },
  ];

  const documents = [
    { id: "1", category: "Catalogue", name: "[Catalogue] S-7300A" },
    { id: "2", category: "Error code", name: "S-7300A Error code" },
    {
      id: "3",
      category: "Instruction manual",
      name: "S-7300A Instruction manual",
    },
    { id: "4", category: "Notification", name: "Notification Version 1.2.0" },
    { id: "5", category: "Parts book", name: "S-7300A Parts book" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>User's Manual</Text>
      </View>

      <View style={styles.content}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.sidebarItem}>
                <Text style={styles.sidebarText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Documents */}
        <View style={styles.documents}>
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.documentItem}>
                <Text style={styles.categoryTitle}>{item.category}</Text>
                <TouchableOpacity style={styles.downloadButton}>
                  <Image
                    source={require("../../assets/icons/download.png")}
                    style={styles.downloadIcon}
                  />
                  <Text style={styles.documentText}>{item.name}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEDED" },
  header: { backgroundColor: "#283593", padding: 15, alignItems: "center" },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  content: { flex: 1, flexDirection: "row" },
  sidebar: { width: "30%", backgroundColor: "#d9d9d9", padding: 10 },
  sidebarItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#b3b3b3",
  },
  sidebarText: { fontSize: 16, fontWeight: "bold", color: "#333" },

  documents: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  documentItem: { marginBottom: 15 },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 5,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  downloadIcon: { width: 20, height: 20, marginRight: 10 },
  documentText: { fontSize: 16, color: "#333" },
});
