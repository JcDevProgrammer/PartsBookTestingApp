import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function SelectModelScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* Left Icon */}
        <Image
          source={require("../../assets/icons/printer.png")}
          style={styles.headerIcon}
        />

        {/* Button na parang search bar */}
        <TouchableOpacity
          onPress={() => router.push("/model-list")}
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>Please Select a Model</Text>
        </TouchableOpacity>

        {/* Right Icon */}
        <TouchableOpacity onPress={() => console.log("Info pressed")}>
          <Image
            source={require("../../assets/icons/info.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View>


      {/* BODY */}
      <View style={styles.body}>
        <Text style={styles.bodyText}>
          No device currently selected, please select device.
        </Text>
      </View>
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
  searchButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: "#333",
    fontSize: 16,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bodyText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginHorizontal: 20,
  },
});
