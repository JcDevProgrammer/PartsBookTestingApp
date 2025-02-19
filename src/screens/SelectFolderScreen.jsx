// src/screens/SelectFolderScreen.jsx
import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import IconButton from "../../components/ui/IconButton";

export default function SelectFolderScreen() {
  const router = useRouter();

  // Dummy models list
  const [models] = useState(["GT-100", "GT-200", "GT-300", "ABC-1000", "XYZ-123"]);
  const [searchText, setSearchText] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const filteredModels = models.filter(model =>
    model.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleModelPress = (model) => {
    setSearchText(model);
    setSelectedModel(model);
  };

  return (
    <View style={styles.container}>
      {/* Header with Search Bar */}
      <View style={styles.header}>
        <Image source={require("../../assets/icons/printer.png")} style={styles.headerIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Enter model name..."
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            setSelectedModel("");
          }}
        />
        <Image source={require("../../assets/icons/info.png")} style={styles.headerIcon} />
      </View>

      {/* List of filtered models */}
      {searchText.length > 0 && !selectedModel && (
        <FlatList
          data={filteredModels}
          keyExtractor={(item) => item}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleModelPress(item)}>
              <Text style={styles.listItem}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Navigation Buttons */}
      <IconButton
        icon={require("../../assets/icons/search.png")}
        label="Search Error Code"
        onPress={() => console.log("Search Error Code pressed")}
      />
      <IconButton
        icon={require("../../assets/icons/manual.png")}
        label="User's Manual"
        onPress={() => router.push("/user-manual")}
      />
      <IconButton
        icon={require("../../assets/icons/video.png")}
        label="Video Manual for GT"
        onPress={() => router.push("/video-manual")}
      />
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
    justifyContent: "space-between"
  },
  headerIcon: { width: 25, height: 25, tintColor: "#fff" },
  searchBar: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 10,
    fontSize: 16
  },
  list: { marginHorizontal: 10, backgroundColor: "#fff", borderRadius: 8 },
  listItem: { padding: 10, borderBottomColor: "#ccc", borderBottomWidth: 1 }
});
