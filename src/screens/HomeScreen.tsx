import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList } from "react-native";
import IconButton from "../../components/ui/IconButton";

const models = ["GTX600SB", "GTX500", "GTX700", "GTX800", "GTX900"];

const HomeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredModels, setFilteredModels] = useState(models);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text === "") {
      setFilteredModels(models);
    } else {
      setFilteredModels(models.filter(model => model.toLowerCase().includes(text.toLowerCase())));
    }
  };

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <Image source={require("../../assets/icons/printer.png")} style={styles.headerIcon} />
        {}
      <TextInput
        style={styles.searchBar}
        placeholder="Enter model name..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
        <TouchableOpacity>
          <Image source={require("../../assets/icons/info.png")} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>


      {/* Model List */}
      {searchQuery !== "" && (
        <FlatList
          data={filteredModels}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.modelItem} onPress={() => console.log(`Selected: ${item}`)}>
              <Text style={styles.modelText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Menu Items */}
      <IconButton icon={require("../../assets/icons/search.png")} label="Search Error Code" onPress={() => console.log("Search Error Code pressed")} />
      <IconButton icon={require("../../assets/icons/manual.png")} label="User's Manual" onPress={() => console.log("User's Manual pressed")} />
      <IconButton icon={require("../../assets/icons/video.png")} label="Video Manual for GT" onPress={() => console.log("Video Manual pressed")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDEDED",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#283593",
    paddingTop: 30,
    paddingVertical: 15,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  headerIcon: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  searchBar: {
    flex: 1,  
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 10,
    fontSize: 14,
    width: "70%", 
    alignSelf: "center",
  },  
  modelItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modelText: {
    fontSize: 16,
  },
});

export default HomeScreen;
