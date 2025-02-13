import { View, Text, StyleSheet } from "react-native";

export default function VideoManualScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Manual for GT</Text>
      <Text>Here is the video manual content...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
