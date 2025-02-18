import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";

export default function IconButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    marginVertical: 5,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
});
