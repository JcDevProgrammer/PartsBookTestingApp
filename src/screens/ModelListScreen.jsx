import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig"; // Adjust if needed

export default function ModelListScreen() {
  const router = useRouter();

  // Holds all folders with their files
  const [folderData, setFolderData] = useState([]);
  const [loadingRoot, setLoadingRoot] = useState(true);

  // Search bar state
  const [searchQuery, setSearchQuery] = useState("");

  // Track expanded folder by folderName
  const [expandedFolder, setExpandedFolder] = useState(null);

  useEffect(() => {
    fetchAllFilesConcurrently();
  }, []);

  /**
   * BFS helper (maxDepth=1)
   * Kukunin lahat ng files (walang filter) mula sa top-level subfolder + 1 level of subfolders
   */
  async function bfsListAll(folderRef, maxDepth = 1) {
    let queue = [{ prefixRef: folderRef, depth: 0 }];
    let visited = new Set();
    let allItems = [];

    while (queue.length > 0) {
      const { prefixRef, depth } = queue.shift();
      if (visited.has(prefixRef.fullPath)) continue;
      visited.add(prefixRef.fullPath);

      const result = await listAll(prefixRef);

      // Add all files
      for (let itemRef of result.items) {
        const url = await getDownloadURL(itemRef);
        allItems.push({
          name: itemRef.name,
          path: itemRef.fullPath,
          url,
        });
      }

      // If you want to go deeper, push subfolders if depth < maxDepth
      if (depth < maxDepth) {
        for (let prefix of result.prefixes) {
          queue.push({ prefixRef: prefix, depth: depth + 1 });
        }
      }
    }

    return allItems;
  }

  // Kunin lahat ng top-level folders sa root. For each folder, BFS -> kukunin lahat ng PDF files
  async function fetchAllFilesConcurrently() {
    try {
      setLoadingRoot(true);
      const rootRef = ref(storage, "");
      const rootResult = await listAll(rootRef);

      const folderPromises = rootResult.prefixes.map(async (subfolderRef) => {
        const folderName = subfolderRef.name;

        // BFS: Kukunin lahat ng files (walang filter)
        const allFiles = await bfsListAll(subfolderRef, 1);

        // OPTIONAL FILTER: kung gusto mong i-filter base sa folderName, i-uncomment:
        // const filteredFiles = allFiles.filter(file =>
        //   file.name.toLowerCase().includes(folderName.toLowerCase())
        // );

        // For now, WALANG filter para lumabas lahat
        return {
          folderName,
          files: allFiles, // or use filteredFiles kung gusto mong i-filter
        };
      });

      const subfolderData = await Promise.all(folderPromises);
      setFolderData(subfolderData);
    } catch (error) {
      console.error("Error fetching files concurrently:", error);
    } finally {
      setLoadingRoot(false);
    }
  }

  // Filter logic for the search bar
  const filteredFolderData = folderData
    .map((folder) => {
      const folderMatch = folder.folderName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchingFiles = folder.files.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (folderMatch) {
        return folder;
      } else if (matchingFiles.length > 0) {
        return { ...folder, files: matchingFiles };
      } else {
        return null;
      }
    })
    .filter((folder) => folder !== null);

  const toggleFolder = (folderName) => {
    setExpandedFolder((prev) => (prev === folderName ? null : folderName));
  };

  // Navigate to select-folder screen (or do something else)
  const handleOpenFile = (url) => {
    router.push({
      pathname: "/select-folder",
      params: { fileUrl: url },
    });
  };

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
          placeholder="Search folder or file..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* MAIN CONTENT */}
      {loadingRoot ? (
        <ActivityIndicator
          size="large"
          color="#283593"
          style={{ marginTop: 20 }}
        />
      ) : filteredFolderData.length > 0 ? (
        <FlatList
          data={filteredFolderData}
          keyExtractor={(item) => item.folderName}
          renderItem={({ item: folder }) => {
            const isExpanded = expandedFolder === folder.folderName;
            return (
              <View style={styles.folderContainer}>
                {/* Folder Header */}
                <TouchableOpacity
                  style={styles.folderRow}
                  onPress={() => toggleFolder(folder.folderName)}
                >
                  <View style={styles.folderHeader}>
                    <Text style={styles.folderTitle}>{folder.folderName}</Text>
                    <Text style={styles.folderCount}>
                      ({folder.files.length} items)
                    </Text>
                  </View>
                  <Image
                    source={require("../../assets/icons/arrow.png")}
                    style={[
                      styles.arrowIcon,
                      isExpanded && { transform: [{ rotate: "180deg" }] },
                    ]}
                  />
                </TouchableOpacity>

                {/* Files List */}
                {isExpanded && (
                  <View style={styles.fileList}>
                    {folder.files.map((file, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.fileItem}
                        onPress={() => handleOpenFile(file.url)}
                      >
                        <Text style={styles.fileName}>{file.name}</Text>
                        <Text style={styles.filePath}>{file.path}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.noMatchContainer}>
          <Text style={styles.noMatchText}>No folders/files match.</Text>
        </View>
      )}
    </View>
  );
}

// EXACT LAYOUT from your snippet
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEDED" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#283593",
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  headerIcon: { width: 25, height: 25, tintColor: "#fff" },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: { padding: 10, backgroundColor: "#EDEDED" },
  searchBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
  },
  folderContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  folderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  folderHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  folderTitle: { fontSize: 16, color: "#333", fontWeight: "bold" },
  folderCount: { fontSize: 14, color: "#666", marginLeft: 5 },
  arrowIcon: { width: 20, height: 20, tintColor: "#333" },
  fileList: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  fileItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  fileName: {
    fontSize: 16,
    color: "#283593",
    fontWeight: "600",
  },
  filePath: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  noMatchContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  noMatchText: {
    fontSize: 16,
    color: "#666",
  },
});
