import React from "react";
import { StatusBar } from "react-native";
import AppNavigator from "./navigation/AppNavigator"; // ✅ Ensure this is correct

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </>
  );
};

export default App;
