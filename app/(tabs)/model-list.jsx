import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";

export default function ModelListScreen() {
  const router = useRouter();

  const [models] = useState([
    { id: "1", title: "Garment Printer" },
    { id: "2", title: "Industrial Sewing Machines" },
    { id: "3", title: "How to use App" },
    { id: "4", title: "Industrial Printers" },
  ]);

  const [expanded, setExpanded] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = models.filter((model) =>
    model.title.toLowerCase().includes(searchQuery.toLowerCase())
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
          placeholder="Search models..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {}
      <FlatList
        data={filteredModels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isExpanded = expanded === item.id;
          return (
            <View style={styles.itemContainer}>
              {/* Row */}
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => setExpanded(isExpanded ? null : item.id)}
              >
                <Text style={styles.itemText}>{item.title}</Text>
                <Image
                  source={require("../../assets/icons/arrow.png")}
                  style={[
                    styles.arrowIcon,
                    isExpanded && { transform: [{ rotate: "180deg" }] },
                  ]}
                />
              </TouchableOpacity>

              {/* Expanded Info */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <Text style={styles.expandedText}>
                    Some info about {item.title}.
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />
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
    paddingBottom: 15,
  },
  expandedText: {
    fontSize: 14,
    color: "#666",
  },
});
