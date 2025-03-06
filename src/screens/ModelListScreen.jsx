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
  Alert,
  Platform,
  Modal,
} from "react-native";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig"; // <-- Adjust mo path
import { WebView } from "react-native-webview";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ModelListScreen() {
  const router = useRouter();

  // Folder & file states
  const [topFolders, setTopFolders] = useState([]);
  const [loadingRoot, setLoadingRoot] = useState(true);
  const [subfolderData, setSubfolderData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolder, setExpandedFolder] = useState(null);

  // The currently selected PDF's URL
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);

  // PDF editing modal
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Online/offline
  const [isOnline, setIsOnline] = useState(true);

  // For the "info" dropdown menu
  const [showInfoMenu, setShowInfoMenu] = useState(false);

  useEffect(() => {
    // Makinig sa NetInfo
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(!!online);
    });
    // Pag-mount, fetch folders kung online
    if (isOnline) {
      fetchTopLevelFolders();
    } else {
      loadCachedData();
    }
    return () => {
      unsubscribe();
    };
  }, [isOnline]);

  // ---------------------
  // FETCH FOLDERS (BFS)
  // ---------------------
  async function fetchTopLevelFolders() {
    try {
      setLoadingRoot(true);
      const rootRef = ref(storage, "");
      const rootResult = await listAll(rootRef);
      const folderNames = rootResult.prefixes.map((folderRef) => folderRef.name);
      setTopFolders(folderNames);
      // I-cache
      await AsyncStorage.setItem("@cachedFolders", JSON.stringify(folderNames));
    } catch (error) {
      console.error("Error fetching top-level folders:", error);
    } finally {
      setLoadingRoot(false);
    }
  }

  async function loadCachedData() {
    try {
      setLoadingRoot(true);
      const cachedFolders = await AsyncStorage.getItem("@cachedFolders");
      if (cachedFolders) {
        setTopFolders(JSON.parse(cachedFolders));
      }
    } catch (error) {
      console.error("Error loading cached folders:", error);
    } finally {
      setLoadingRoot(false);
    }
  }

  async function fetchFolderRecursively(prefixRef, depth = 0, maxDepth = 1) {
    try {
      const result = await listAll(prefixRef);
      const filePromises = result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url,
        };
      });
      const files = await Promise.all(filePromises);

      if (depth < maxDepth) {
        const subfolderPromises = result.prefixes.map((subRef) =>
          fetchFolderRecursively(subRef, depth + 1, maxDepth)
        );
        const subfolderFilesArrays = await Promise.all(subfolderPromises);
        return files.concat(...subfolderFilesArrays);
      }
      return files;
    } catch (error) {
      console.error("Error in fetchFolderRecursively:", error);
      return [];
    }
  }

  async function fetchSubfolderContents(folderName) {
    if (!isOnline) {
      Alert.alert("Offline", "No internet. Can't fetch new data.");
      return;
    }
    try {
      setSubfolderData((prev) => ({
        ...prev,
        [folderName]: { ...prev[folderName], loading: true },
      }));
      const folderRef = ref(storage, folderName + "/");
      const files = await fetchFolderRecursively(folderRef);
      setSubfolderData((prev) => ({
        ...prev,
        [folderName]: {
          files,
          loading: false,
          loaded: true,
        },
      }));
      // I-cache
      await AsyncStorage.setItem(
        `@cachedSubfolder_${folderName}`,
        JSON.stringify(files)
      );
    } catch (error) {
      console.error("Error fetching subfolder contents:", error);
      setSubfolderData((prev) => ({
        ...prev,
        [folderName]: { ...prev[folderName], loading: false },
      }));
    }
  }

  async function loadCachedSubfolder(folderName) {
    try {
      const cached = await AsyncStorage.getItem(`@cachedSubfolder_${folderName}`);
      if (cached) {
        const files = JSON.parse(cached);
        setSubfolderData((prev) => ({
          ...prev,
          [folderName]: {
            files,
            loading: false,
            loaded: true,
          },
        }));
      } else {
        Alert.alert("Offline", "No cached data for this folder.");
      }
    } catch (err) {
      console.error("Error loading cached subfolder:", err);
    }
  }

  const handleToggleFolder = async (folderName) => {
    if (expandedFolder === folderName) {
      setExpandedFolder(null);
      return;
    }
    setExpandedFolder(folderName);

    const currentData = subfolderData[folderName];
    if (!currentData || !currentData.loaded) {
      if (isOnline) {
        fetchSubfolderContents(folderName);
      } else {
        await loadCachedSubfolder(folderName);
      }
    }
  };

  // ---------------------
  //  OPEN PDF
  // ---------------------
  const handleOpenFile = (url) => {
    if (!isOnline) {
      Alert.alert("Offline", "Cannot view PDF offline (needs internet).");
      return;
    }
    setSelectedFileUrl(url);
  };

  // ---------------------
  //  PRINT
  // ---------------------
  const handlePrint = async () => {
    if (!selectedFileUrl) return;
    try {
      if (Platform.OS === "web") {
        const printWindow = window.open(selectedFileUrl, "_blank");
        printWindow?.print();
      } else {
        await Print.printAsync({ uri: selectedFileUrl });
      }
    } catch (error) {
      console.error("Print error:", error);
      Alert.alert("Print Error", "Failed to print the PDF.");
    }
  };

  // ---------------------
  //  EDIT (Placeholder)
  // ---------------------
  const handleEdit = () => {
    setEditModalVisible(true);
  };
  const handleSaveEdit = () => {
    Alert.alert("Success", "PDF edited and saved successfully!");
    setEditModalVisible(false);
  };
  const handleCancelEdit = () => {
    Alert.alert("Cancelled", "PDF editing cancelled.");
    setEditModalVisible(false);
  };

  // ---------------
  //  INFO MENU
  // ---------------
  const toggleInfoMenu = () => {
    setShowInfoMenu(!showInfoMenu);
  };
  const goToHome = () => {
    setShowInfoMenu(false);
    router.push("/home");
  };
  const goToInformation = () => {
    setShowInfoMenu(false);
    router.push("/information");
  };
  const goToUserSetting = () => {
    setShowInfoMenu(false);
    router.push("/user-setting");
  };

  // ---------------
  //  PDF Viewer
  // ---------------
  let viewerUri = selectedFileUrl;
  if (Platform.OS === "android" && selectedFileUrl) {
    // Kung ayaw mo ng Google Docs fallback, TANGGALIN mo 'to
    viewerUri = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
      selectedFileUrl
    )}`;
  }

  if (selectedFileUrl) {
    return (
      <View style={styles.viewerContainer}>
        {/* Viewer Header */}
        <View style={styles.viewerHeader}>
          <TouchableOpacity onPress={() => setSelectedFileUrl(null)}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.viewerIcon}
            />
          </TouchableOpacity>
          <Text style={styles.viewerTitle}>PDF Viewer</Text>
          <View style={styles.viewerActions}>
            <TouchableOpacity onPress={handlePrint}>
              <Image
                source={require("../../assets/icons/printer.png")}
                style={styles.viewerIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEdit}>
              <Image
                source={require("../../assets/icons/edit.png")}
                style={styles.viewerIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {Platform.OS === "web" ? (
          <View style={{ flex: 1 }}>
            <iframe
              key={selectedFileUrl}
              src={selectedFileUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
              title="PDF Viewer"
            />
          </View>
        ) : (
          <WebView
            key={selectedFileUrl}
            source={{ uri: viewerUri }}
            style={{ flex: 1 }}
            startInLoadingState
            renderLoading={() => (
              <ActivityIndicator size="large" color="#283593" style={{ marginTop: 20 }} />
            )}
            javaScriptEnabled
            scalesPageToFit
          />
        )}

        {/* Edit PDF Modal */}
        <Modal
          transparent={true}
          visible={editModalVisible}
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit PDF</Text>
              <Text style={styles.modalText}>(PDF editing UI goes here)</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalButton} onPress={handleSaveEdit}>
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ---------------
  //  MAIN SCREEN
  // ---------------
  const filteredData = topFolders.reduce((acc, folderName) => {
    const folderMatch = folderName.toLowerCase().includes(searchQuery.toLowerCase());
    const subData = subfolderData[folderName] || {};
    const filteredFiles =
      subData.files && searchQuery
        ? subData.files.filter(
            (file) =>
              file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              file.path.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : subData.files || [];

    if (folderMatch || filteredFiles.length > 0 || !searchQuery) {
      acc.push({
        folderName,
        files: filteredFiles,
        loading: subData.loading,
      });
    }
    return acc;
  }, []);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* Left Icon */}
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/icons/back.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.headerTitle}>Please select a model</Text>

        {/* Info Icon */}
        <TouchableOpacity onPress={toggleInfoMenu}>
          <Image
            source={require("../../assets/icons/info.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View>

      {/* INFO MENU (dropdown) */}
      {showInfoMenu && (
        <View style={styles.infoMenu}>
          <TouchableOpacity style={styles.infoMenuItem} onPress={goToHome}>
            <Text style={styles.infoMenuText}>Home Page</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoMenuItem} onPress={goToInformation}>
            <Text style={styles.infoMenuText}>Information</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoMenuItem} onPress={goToUserSetting}>
            <Text style={styles.infoMenuText}>User Setting</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        {!isOnline && (
          <Text style={{ color: "red", marginBottom: 5 }}>
            Offline mode. Showing cached data (if available).
          </Text>
        )}
        <TextInput
          style={styles.searchBar}
          placeholder="Search folder or PDF Name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* BODY: List of folders/files */}
      {loadingRoot ? (
        <ActivityIndicator size="large" color="#283593" style={{ marginTop: 20 }} />
      ) : filteredData.length > 0 ? (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.folderName}
          renderItem={({ item }) => {
            const isExpanded = expandedFolder === item.folderName;
            return (
              <View style={styles.folderContainer}>
                <TouchableOpacity
                  style={styles.folderRow}
                  onPress={() => handleToggleFolder(item.folderName)}
                >
                  <View style={styles.folderHeader}>
                    <Text style={styles.folderTitle}>{item.folderName}</Text>
                    {item.files && item.files.length > 0 && (
                      <Text style={styles.folderCount}>
                        ({item.files.length} items)
                      </Text>
                    )}
                  </View>
                  <Image
                    source={require("../../assets/icons/arrow.png")}
                    style={[styles.arrowIcon, isExpanded && { transform: [{ rotate: "180deg" }] }]}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.fileList}>
                    {item.loading ? (
                      <ActivityIndicator size="small" color="#283593" />
                    ) : item.files && item.files.length > 0 ? (
                      item.files.map((file, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.fileItem}
                          onPress={() => handleOpenFile(file.url)}
                        >
                          <Text style={styles.fileName}>{file.name}</Text>
                          <Text style={styles.filePath}>{file.path}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text style={styles.noFilesText}>No files found.</Text>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.noMatchContainer}>
          {isOnline ? (
            <Text style={styles.noMatchText}>No folders or PDFs match your search.</Text>
          ) : (
            <Text style={styles.noMatchText}>No offline data available.</Text>
          )}
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
    paddingBottom: 20,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  headerIcon: { width: 25, height: 25, tintColor: "#fff" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  // Info Menu
  infoMenu: {
    position: "absolute",
    top: 70,
    right: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    zIndex: 999,
  },
  infoMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  infoMenuText: {
    fontSize: 16,
    color: "#333",
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
  folderHeader: { flexDirection: "row", alignItems: "center" },
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
  fileName: { fontSize: 16, color: "#283593", fontWeight: "600" },
  filePath: { fontSize: 12, color: "#666", marginTop: 2 },
  noFilesText: { fontSize: 14, color: "#666", fontStyle: "italic" },
  noMatchContainer: { marginTop: 40, alignItems: "center" },
  noMatchText: { fontSize: 16, color: "#666" },

  // PDF Viewer
  viewerContainer: { flex: 1, backgroundColor: "#EDEDED" },
  viewerHeader: {
    flexDirection: "row",
    backgroundColor: "#283593",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 10,
  },
  viewerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  viewerActions: { flexDirection: "row" },
  viewerIcon: { width: 25, height: 25, tintColor: "#fff", marginHorizontal: 8 },

  // PDF Editing Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, marginBottom: 20 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#283593",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalCancelButton: { backgroundColor: "#666" },
  modalButtonText: { color: "#fff", fontSize: 16 },
});
