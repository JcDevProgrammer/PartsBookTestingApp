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

  // Recursively fetch all files from every subfolder using BFS
  const fetchAllFilesConcurrently = async () => {
    try {
      setLoadingRoot(true);
      const rootRef = ref(storage, "");
      const rootResult = await listAll(rootRef);

      // Process root-level files
      const rootFiles = await Promise.all(
        rootResult.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { name: itemRef.name, path: itemRef.fullPath, url };
        })
      );

      // Process subfolders in parallel
      const folderPromises = rootResult.prefixes.map(async (subfolderRef) => {
        const folderName = subfolderRef.name;
        const folderRef = ref(storage, folderName + "/");
        const folderResult = await listAll(folderRef);
        const files = await Promise.all(
          folderResult.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return { name: itemRef.name, path: itemRef.fullPath, url };
          })
        );
        return { folderName, files };
      });
      const subfolderData = await Promise.all(folderPromises);

      // If there are files in the root, add them as a "Root" folder
      if (rootFiles.length > 0) {
        subfolderData.push({ folderName: "Root", files: rootFiles });
      }

      // Define the sample manual file
      const sampleManual = {
        name: "Sample Manual.pdf",
        path: "BROTHER HSM/3034D.PDF",
        url: "https://firebasestorage.googleapis.com/v0/b/fir-domanapp-719a0.appspot.com/o/BROTHER%20HSM%2F3034D.PDF?alt=media&token=your-sample-token",
      };

      // Add the sample manual file into the "BROTHER HSM" folder if it exists,
      // or create that folder if not present.
      let foundBrotherHSM = false;
      subfolderData.forEach((folder) => {
        if (folder.folderName === "BROTHER HSM") {
          if (!folder.files.some((file) => file.name === "Sample Manual.pdf")) {
            folder.files.push(sampleManual);
          }
          foundBrotherHSM = true;
        }
      });
      if (!foundBrotherHSM) {
        subfolderData.push({
          folderName: "BROTHER HSM",
          files: [sampleManual],
        });
      }

      setFolderData(subfolderData);
    } catch (error) {
      console.error("Error fetching files concurrently:", error);
    } finally {
      setLoadingRoot(false);
    }
  };

  // Filtering logic: if folder name matches, keep all its files; otherwise, keep only files that match.
  const filteredFolderData = folderData
    .map((folder) => {
      const folderMatch = folder.folderName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchingFiles = folder.files.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (folderMatch) {
        return { ...folder };
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

  const handleOpenFile = (url) => {
    Linking.openURL(url);
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
