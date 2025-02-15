import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

interface IconButtonProps {
  icon: any;
  label: string;
  onPress: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
});

export default IconButton;
