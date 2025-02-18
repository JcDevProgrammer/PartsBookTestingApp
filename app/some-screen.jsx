// app/some-screen.jsx
import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SomeScreen() {
  // Halimbawa: kung papasahan mo ng ?id=123
  const { id } = useLocalSearchParams();
  const router = useRouter(); // kung gusto mong mag-navigate

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Param id: {id}</Text>

      {/* Halimbawa, mag-navigate sa ibang screen */}
      <Button
        title="Go to Another Screen"
        onPress={() => {
          router.push("/another-screen?foo=456");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  text: {
    fontSize: 18,
    color: "#333",
  },
});
