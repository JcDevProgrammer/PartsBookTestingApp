import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Linking,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../../src/screens/config/firebaseConfig";

export default function ModelListScreen() {
  const router = useRouter();

  // Store a list of subfolders (prefixes) at the root of the bucket
  const [folders, setFolders] = useState([]);
  // Track which folder is currently expanded
  const [expandedFolder, setExpandedFolder] = useState(null);
  // For storing each folder's files: { [folderName]: [ { name, url } ] }
  const [folderFiles, setFolderFiles] = useState({});
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingFolder, setLoadingFolder] = useState(null);

  // Search bar state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // On mount, list subfolders in the root of your bucket
    fetchRoot();
  }, []);

  // List the root of the bucket
  const fetchRoot = async () => {
    try {
      setLoading(true);
      const rootRef = ref(storage, ""); // root
      const result = await listAll(rootRef);
      // result.prefixes => subfolders
      // result.items => files at root
      const folderNames = result.prefixes.map((prefixRef) => prefixRef.name);
      setFolders(folderNames);
    } catch (err) {
      console.error("Error listing root of bucket:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all files in a specific subfolder
  const fetchFilesInFolder = async (folderName) => {
    try {
      setLoadingFolder(folderName);
      // e.g., "BROTHER HSM/"
      const folderRef = ref(storage, folderName + "/");
      const result = await listAll(folderRef);

      const filePromises = result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return { name: itemRef.name, url };
      });
      const files = await Promise.all(filePromises);

      setFolderFiles((prev) => ({ ...prev, [folderName]: files }));
    } catch (err) {
      console.error("Error fetching files for folder", folderName, err);
    } finally {
      setLoadingFolder(null);
    }
  };

  // Toggle expand/collapse for a folder
  const handleToggleFolder = (folderName) => {
    if (expandedFolder === folderName) {
      // Collapse
      setExpandedFolder(null);
    } else {
      // Expand
      setExpandedFolder(folderName);
      // If we haven't fetched files for this folder yet, do so
      if (!folderFiles[folderName]) {
        fetchFilesInFolder(folderName);
      }
    }
  };

  // Open file URL (PDF, etc.) in default viewer
  const handleOpenPDF = (url) => {
    Linking.openURL(url);
  };

  // Filter the folders by search query
  const filteredFolders = folders.filter((folderName) =>
    folderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/icons/back.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a model</Text>
        <TouchableOpacity onPress={() => console.log("Info pressed")}>
          <Image
            source={require("../../assets/icons/info.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search folders..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* MAIN CONTENT: List of subfolders */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#283593"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={filteredFolders}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isExpanded = expandedFolder === item;
            const files = folderFiles[item] || [];

            return (
              <View style={styles.itemContainer}>
                {/* Folder Row */}
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={() => handleToggleFolder(item)}
                >
                  <Text style={styles.itemText}>{item}</Text>
                  <Image
                    source={require("../../assets/icons/arrow.png")}
                    style={[
                      styles.arrowIcon,
                      isExpanded && { transform: [{ rotate: "180deg" }] },
                    ]}
                  />
                </TouchableOpacity>

                {/* If expanded, show files */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {loadingFolder === item ? (
                      <ActivityIndicator size="small" color="#283593" />
                    ) : files.length > 0 ? (
                      files.map((file, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.pdfItem}
                          onPress={() => handleOpenPDF(file.url)}
                        >
                          <Text style={styles.pdfText}>{file.name}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.expandedText}>No manuals found.</Text>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDEDED",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#283593",
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  headerIcon: {
    width: 25,
    height: 25,
    tintColor: "#fff",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    padding: 10,
    backgroundColor: "#EDEDED",
  },
  searchBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 14,
  },
  itemContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: "#333",
  },
  expandedContent: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  expandedText: {
    fontSize: 14,
    color: "#666",
  },
  pdfItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  pdfText: {
    fontSize: 16,
    color: "#283593",
  },
});
