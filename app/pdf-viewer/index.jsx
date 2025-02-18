// app/pdf-viewer/index.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

export default function PdfViewerScreen() {
  const { url } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <WebView source={{ uri: url }} style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
});
