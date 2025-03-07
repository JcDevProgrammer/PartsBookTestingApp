// app/home/index.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* HEADER BAR */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/icons/back.png")} // Adjust path/icon if needed
            style={styles.headerIcon}
          />
        </TouchableOpacity>

        {/* Title in the Middle */}
        <Text style={styles.headerTitle}>Home</Text>

        {/* Right-Side Placeholder for Balanced Spacing */}
        <View style={{ width: 25, height: 25 }} />
      </View>

      {/* BODY CONTENT */}
      <View style={styles.body}>
        <Text style={styles.text}>Welcome to the Home Page!</Text>
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
    paddingBottom: 20,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  headerIcon: {
    width: 25,
    height: 25,
    tintColor: "#fff", // Make the back icon white
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});
