// app/(tabs)/user-manual/index.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../../src/config/firebaseConfig";

export default function UserManualScreen() {
  const router = useRouter();

  const categories = [
    { id: "1", title: "Catalogue" },
    { id: "2", title: "Error code" },
    { id: "3", title: "Instruction manual" },
    { id: "4", title: "Notification" },
    { id: "5", title: "Parts book" },
  ];

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchUserManuals();
  }, []);

  const fetchUserManuals = async () => {
    try {
      const folderRef = ref(storage, "UserManuals/");
      const result = await listAll(folderRef);

      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const fileName = itemRef.name; // e.g. "S-7300A_InstructionManual.pdf"

          // Basic parse to determine category
          let category = "Uncategorized";
          if (fileName.includes("Catalogue")) category = "Catalogue";
          if (fileName.includes("Error")) category = "Error code";
          if (fileName.includes("Instruction")) category = "Instruction manual";
          if (fileName.includes("Notification")) category = "Notification";
          if (fileName.includes("Parts")) category = "Parts book";

          return {
            id: itemRef.fullPath, // unique
            category,
            name: fileName,
            url,
          };
        })
      );

      setDocuments(files);
    } catch (error) {
      console.error("Error fetching user manuals:", error);
    }
  };

  const handleOpenDocument = (pdfUrl) => {
    // Navigate to the PDF Viewer route with the PDF URL
    router.push({
      pathname: "/pdf-viewer",
      params: { url: pdfUrl },
    });
  };

  const renderDocumentItem = ({ item }) => (
    <View style={styles.documentItem}>
      <Text style={styles.categoryTitle}>{item.category}</Text>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => handleOpenDocument(item.url)}
      >
        <Image
          source={{
            uri: "https://img.icons8.com/ios-filled/50/000000/download.png",
          }}
          style={styles.downloadIcon}
        />
        <Text style={styles.documentText}>{item.name}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>User's Manual</Text>
      </View>

      {/* CONTENT: sidebar + documents */}
      <View style={styles.content}>
        {/* STATIC CATEGORIES (left side) */}
        <View style={styles.sidebar}>
          <FlatList
            data={categories}
            keyExtractor={(cat) => cat.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.sidebarItem}>
                <Text style={styles.sidebarText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* DOCUMENTS LIST (right side) */}
        <View style={styles.documents}>
          <FlatList
            data={documents}
            keyExtractor={(doc) => doc.id}
            renderItem={renderDocumentItem}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEDED" },
  header: {
    backgroundColor: "#283593",
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  content: { flex: 1, flexDirection: "row" },

  sidebar: {
    width: "30%",
    backgroundColor: "#d9d9d9",
    padding: 10,
  },
  sidebarItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#b3b3b3",
  },
  sidebarText: { fontSize: 16, fontWeight: "bold", color: "#333" },

  documents: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
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
