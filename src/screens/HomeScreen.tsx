import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import IconButton from "../../components/ui/IconButton";

const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require("../assets/icons/printer.png")}
          style={styles.headerIcon}
        />
        <Text style={styles.headerTitle}>GTX600SB</Text>
        <TouchableOpacity>
          <Image
            source={require("../assets/icons/info.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <IconButton
        icon={require("../assets/icons/search.png")}
        label="Search Error Code"
        onPress={() => console.log("Search Error Code pressed")}
      />
      <IconButton
        icon={require("../assets/icons/manual.png")}
        label="User's Manual"
        onPress={() => console.log("User's Manual pressed")}
      />
      <IconButton
        icon={require("../assets/icons/video.png")}
        label="Video Manual for GT"
        onPress={() => console.log("Video Manual pressed")}
      />
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
});

export default HomeScreen;
