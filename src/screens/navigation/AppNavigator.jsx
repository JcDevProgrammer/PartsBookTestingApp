import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

// Import ng mga screen components
import SelectModelScreen from "../SelectModelScreen";
import HomeScreen from "../HomeScreen";
import UserManualScreen from "../UserManualScreen";
import ModelListScreen from "../ModelListScreen";
import VideoManualScreen from "../VideoManualScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SelectModel">
        {/* Main screen kung saan pipili ang user ng model */}
        <Stack.Screen
          name="SelectModel"
          component={SelectModelScreen}
          options={{ headerShown: false }}
        />

        {/* Home Screen */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Home" }}
        />

        {/* User Manual Screen */}
        <Stack.Screen
          name="UserManual"
          component={UserManualScreen}
          options={{ title: "User Manual" }}
        />

        {/* Model List Screen na may search bar */}
        <Stack.Screen
          name="ModelList"
          component={ModelListScreen}
          options={{ title: "Select a Model" }}
        />

        {/* Video Manual Screen */}
        <Stack.Screen
          name="VideoManual"
          component={VideoManualScreen}
          options={{ title: "Video Manual" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
