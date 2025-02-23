import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../../src/config/firebaseConfig"; // Adjust if needed

export default function UserManualScreen() {
  const router = useRouter();

  const { model } = useLocalSearchParams();
  const selectedModel = model ? model : "";

  const sidebarCategories = [
    { id: "1", title: "Catalogue" },
    { id: "2", title: "Error code" },
    { id: "3", title: "Instruction manual" },
    { id: "4", title: "Notification" },
    { id: "5", title: "Parts book" },
  ];

  // Display order on the right side
  const categoryOrder = [
    "Catalogue",
    "Error code",
    "Instruction manual",
    "Notification",
    "Parts book",
  ];

  // Grouped docs
  const [groupedDocs, setGroupedDocs] = useState({
    Catalogue: [],
    "Error code": [],
    "Instruction manual": [],
    Notification: [],
    "Parts book": [],
    Uncategorized: [],
  });
  const [loading, setLoading] = useState(false);

  const forcedBrotherISM = {
    Catalogue: [
      {
        category: "Catalogue",
        name: "[Catalogue] BROTHER ISM 3034.pdf",
        url: "https://firebasestorage.googleapis.com/v0/b/fir-domanapp-719a0.appspot.com/o/BROTHER%20ISM%2F3034_catalogue.pdf?alt=media",
      },
    ],
    "Error code": [
      {
        category: "Error code",
        name: "BROTHER ISM Error code",
        url: "https://firebasestorage.googleapis.com/v0/b/fir-domanapp-719a0.appspot.com/o/BROTHER%20ISM%2Ferror_code.pdf?alt=media",
      },
    ],
    "Instruction manual": [
      {
        category: "Instruction manual",
        name: "BROTHER ISM Instruction manual",
        url: "https://firebasestorage.googleapis.com/v0/b/fir-domanapp-719a0.appspot.com/o/BROTHER%20ISM%2Finstruction.pdf?alt=media",
      },
    ],
    Notification: [
      {
        category: "Notification",
        name: "BROTHER ISM Notification (V1.0)",
        url: "https://firebasestorage.googleapis.com/v0/b/fir-domanapp-719a0.appspot.com/o/BROTHER%20ISM%2Fnotification.pdf?alt=media",
      },
    ],
    "Parts book": [
      {
        category: "Parts book",
        name: "BROTHER ISM Parts book",
        url: "https://firebasestorage.googleapis.com/v0/b/fir-domanapp-719a0.appspot.com/o/BROTHER%20ISM%2Fparts_book.pdf?alt=media",
      },
    ],
    Uncategorized: [],
  };

  // BFS (unlimited subfolders) from model + "/"
  async function bfsListAllUnlimited(folderRef, modelName) {
    let queue = [folderRef];
    let visited = new Set();
    let allItems = [];

    while (queue.length > 0) {
      const currentRef = queue.shift();
      if (visited.has(currentRef.fullPath)) continue;
      visited.add(currentRef.fullPath);

      const result = await listAll(currentRef);

      for (let itemRef of result.items) {
        const fileName = itemRef.name.toLowerCase();
        // Filter by model name
        if (modelName && !fileName.includes(modelName.toLowerCase())) {
          continue;
        }
        const url = await getDownloadURL(itemRef);
        allItems.push({
          fileName: itemRef.name,
          url,
          fullPath: itemRef.fullPath,
        });
      }

      // unlimited subfolders
      for (let prefixRef of result.prefixes) {
        queue.push(prefixRef);
      }
    }

    return allItems;
  }

  useEffect(() => {
    fetchUserManuals(selectedModel);
  }, [selectedModel]);

  const fetchUserManuals = async (modelName) => {
    try {
      setLoading(true);
      // BFS from subfolder "modelName + /"
      const folderRef = ref(storage, modelName + "/");
      const allDocs = await bfsListAllUnlimited(folderRef, modelName);

      // If BFS returns 0 items, forcibly add PDF items for BROTHER ISM
      // or do nothing for other models
      if (allDocs.length === 0) {
        if (modelName === "BROTHER ISM") {
          setGroupedDocs(forcedBrotherISM);
        } else {
          // no forced items
          setGroupedDocs({
            Catalogue: [],
            "Error code": [],
            "Instruction manual": [],
            Notification: [],
            "Parts book": [],
            Uncategorized: [],
          });
        }
        setLoading(false);
        return;
      }

      // Otherwise, group them by category
      const grouped = {
        Catalogue: [],
        "Error code": [],
        "Instruction manual": [],
        Notification: [],
        "Parts book": [],
        Uncategorized: [],
      };

      // Categorize
      allDocs.forEach((doc) => {
        const lower = doc.fileName.toLowerCase();
        let category = "Uncategorized";
        let displayName = doc.fileName;

        if (lower.includes("catalogue")) {
          category = "Catalogue";
          displayName = "[Catalogue] " + doc.fileName;
        } else if (lower.includes("error")) {
          category = "Error code";
          displayName = doc.fileName + " (Error)";
        } else if (lower.includes("instruction")) {
          category = "Instruction manual";
          displayName = doc.fileName + " (Instruction)";
        } else if (lower.includes("notification")) {
          category = "Notification";
          displayName = doc.fileName + " (Notification)";
        } else if (lower.includes("parts")) {
          category = "Parts book";
          displayName = doc.fileName + " (Parts)";
        }

        grouped[category].push({
          category,
          name: displayName,
          url: doc.url,
        });
      });

      setGroupedDocs(grouped);
    } catch (error) {
      console.error("Error BFS listing user manuals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = (pdfUrl) => {
    if (Platform.OS === "web") {
      window.open(pdfUrl, "_blank");
    } else {
      router.push({ pathname: "/pdf-viewer", params: { url: pdfUrl } });
    }
  };

  // Render a single PDF row
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

  // Right side
  const renderRightSide = () => {
    return categoryOrder.map((cat) => {
      const docsForThisCat = groupedDocs[cat] || [];
      return (
        <View key={cat} style={styles.categoryBlock}>
          <Text style={styles.categoryTitle}>{cat}</Text>
          {/* Wala tayong "Walang laman" text. Kung 0 items, empty lang. */}
          {docsForThisCat.map((doc, idx) => renderDocItem(doc, idx))}
        </View>
      );
    });
  };

  // Left sidebar
  const renderSidebar = () => (
    <FlatList
      data={[
        { id: "1", title: "Catalogue" },
        { id: "2", title: "Error code" },
        { id: "3", title: "Instruction manual" },
        { id: "4", title: "Notification" },
        { id: "5", title: "Parts book" },
      ]}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.sidebarItem}>
          <Text style={styles.sidebarText}>{item.title}</Text>
        </View>
      )}
    />
  );

  // Header
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
        <TouchableOpacity onPress={() => console.log("Search pressed")}>
          <Image
            source={require("../../assets/icons/search.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => fetchUserManuals(selectedModel)}>
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

// EXACT LAYOUT from your snippet
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
  sidebar: { width: "30%", backgroundColor: "#d9d9d9", padding: 10 },
  sidebarItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#b3b3b3",
  },
  sidebarText: { fontSize: 16, fontWeight: "bold", color: "#333" },
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
});
