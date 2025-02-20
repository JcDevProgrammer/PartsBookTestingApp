// app/(tabs)/user-manual/index.jsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";

// For Expo Router v2 to get route parameters:
import { useLocalSearchParams, useRouter } from "expo-router";

// Firebase imports
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../../src/config/firebaseConfig"; // Adjust path if needed

export default function UserManualScreen() {
  const router = useRouter();
  // Retrieve the selected model from route parameters.
  // If no model is selected, show all files (using an empty string).
  const { model } = useLocalSearchParams();
  const selectedModel = model ? model : "";

  // Static list for left sidebar
  const sidebarCategories = [
    { id: "1", title: "Catalogue" },
    { id: "2", title: "Error code" },
    { id: "3", title: "Instruction manual" },
    { id: "4", title: "Notification" },
    { id: "5", title: "Parts book" },
  ];

  // Define the order for right side display
  const categoryOrder = [
    "Catalogue",
    "Error code",
    "Instruction manual",
    "Notification",
    "Parts book",
  ];

  // State to store grouped documents and loading status
  const [groupedDocs, setGroupedDocs] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserManuals();
  }, [selectedModel]);

  const fetchUserManuals = async () => {
    try {
      setLoading(true);
      const folderRef = ref(storage, "UserManuals/");
      const result = await listAll(folderRef);

      // Process each file: get its download URL and build an object.
      // Only include files that match the selected model (if one is provided).
      const allDocs = await Promise.all(
        result.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          const fileName = itemRef.name; // e.g. "S-7300A_Catalogue.pdf"
          if (selectedModel && !fileName.toLowerCase().includes(selectedModel.toLowerCase()))
            return null;

          let category = "Uncategorized";
          let displayName = fileName; // fallback

          if (fileName.toLowerCase().includes("catalogue")) {
            category = "Catalogue";
            displayName = `[Catalogue] ${selectedModel || fileName.split("_")[0]}`;
          } else if (fileName.toLowerCase().includes("error")) {
            category = "Error code";
            displayName = `${selectedModel || fileName.split("_")[0]} Error code`;
          } else if (fileName.toLowerCase().includes("instruction")) {
            category = "Instruction manual";
            displayName = `${selectedModel || fileName.split("_")[0]} Instruction manual`;
          } else if (fileName.toLowerCase().includes("notification")) {
            category = "Notification";
            displayName = "Notification Version 1.2.0";
          } else if (fileName.toLowerCase().includes("parts")) {
            category = "Parts book";
            displayName = `${selectedModel || fileName.split("_")[0]} Parts book`;
          }

          return { category, name: displayName, url };
        })
      );

      // Filter out any null values (files that didn't match the selected model)
      const filteredDocs = allDocs.filter((doc) => doc !== null);

      // If no matching documents are found, use fallback sample manuals.
      if (filteredDocs.length === 0) {
        const fallbackGrouped = {
          Catalogue: [
            {
              category: "Catalogue",
              name: `[Catalogue] ${selectedModel || ""}`,
              url: "https://example.com/sample-catalogue.pdf",
            },
          ],
          "Error code": [
            {
              category: "Error code",
              name: `${selectedModel || ""} Error code`,
              url: "https://example.com/sample-error.pdf",
            },
          ],
          "Instruction manual": [
            {
              category: "Instruction manual",
              name: `${selectedModel || ""} Instruction manual`,
              url: "https://example.com/sample-instruction.pdf",
            },
          ],
          Notification: [
            {
              category: "Notification",
              name: "Notification Version 1.2.0",
              url: "https://example.com/sample-notification.pdf",
            },
          ],
          "Parts book": [
            {
              category: "Parts book",
              name: `${selectedModel || ""} Parts book`,
              url: "https://example.com/sample-parts.pdf",
            },
          ],
          Uncategorized: [],
        };
        setGroupedDocs(fallbackGrouped);
        return;
      }

      // Group the fetched documents by category
      const grouped = {
        Catalogue: [],
        "Error code": [],
        "Instruction manual": [],
        Notification: [],
        "Parts book": [],
        Uncategorized: [],
      };

      filteredDocs.forEach((doc) => {
        if (grouped[doc.category]) {
          grouped[doc.category].push(doc);
        } else {
          grouped.Uncategorized.push(doc);
        }
      });

      setGroupedDocs(grouped);
    } catch (error) {
      console.error("Error fetching user manuals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for tapping a document (to open or download the PDF)
  const handleOpenDocument = (pdfUrl) => {
    console.log("Tapped PDF:", pdfUrl);
    // Example: Navigate to your PDF viewer screen:
    // router.push({ pathname: "/pdf-viewer", params: { url: pdfUrl } });
  };

  // Render a single document row (download icon and document name)
  const renderDocItem = (doc, index) => (
    <View key={index} style={styles.documentItem}>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => handleOpenDocument(doc.url)}
      >
        <Image
          source={require("../../assets/icons/download.png")}
          style={styles.downloadIcon}
        />
        <Text style={styles.documentText}>{doc.name}</Text>
      </TouchableOpacity>
    </View>
  );

  // Render the right side: for each category (in defined order), display the heading and its documents.
  const renderRightSide = () => {
    return categoryOrder.map((cat) => {
      const docsForThisCat = groupedDocs[cat] || [];
      return (
        <View key={cat} style={styles.categoryBlock}>
          <Text style={styles.categoryTitle}>{cat}</Text>
          {docsForThisCat.length > 0 ? (
            docsForThisCat.map((doc, index) => renderDocItem(doc, index))
          ) : (
            <Text style={styles.noDocsText}>Walang laman</Text>
          )}
        </View>
      );
    });
  };

  // Render the left sidebar from the static sidebarCategories list.
  const renderSidebar = () => (
    <FlatList
      data={sidebarCategories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.sidebarItem}>
          <Text style={styles.sidebarText}>{item.title}</Text>
        </View>
      )}
    />
  );

  // Render header with a white back button, title, search icon (placeholder), and refresh icon.
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Image
          source={require("../../assets/icons/back.png")}
          style={styles.headerBackIcon}
        />
      </TouchableOpacity>
      <Text style={styles.headerText}>User's Manual</Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity
          onPress={() => {
            console.log("Search pressed");
            // Add search functionality if needed.
          }}
        >
          <Image
            source={require("../../assets/icons/search.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={fetchUserManuals}>
          <Image
            source={require("../../assets/icons/refresh.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#283593" />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.sidebar}>{renderSidebar()}</View>
          <View style={styles.documents}>{renderRightSide()}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEDED" },
  header: {
    backgroundColor: "#283593",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBackIcon: {
    width: 25,
    height: 25,
    tintColor: "#fff",
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  headerIcons: { flexDirection: "row" },
  headerIcon: { width: 25, height: 25, tintColor: "#fff", marginLeft: 15 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flex: 1, flexDirection: "row" },
  /* LEFT SIDEBAR */
  sidebar: { width: "30%", backgroundColor: "#d9d9d9", padding: 10 },
  sidebarItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#b3b3b3",
  },
  sidebarText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  /* RIGHT SIDE */
  documents: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  categoryBlock: { marginBottom: 20 },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 5,
  },
  documentItem: { marginBottom: 10 },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
  },
  downloadIcon: { width: 20, height: 20, marginRight: 10 },
  documentText: { fontSize: 16, color: "#333" },
  noDocsText: { fontSize: 14, color: "#999", fontStyle: "italic" },
});
