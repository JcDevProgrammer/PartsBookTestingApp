import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../HomeScreen";
import UserManualScreen from "../UserManualScreen"; // ✅ Ensure this is imported

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="UserManual" component={UserManualScreen} /> {/* ✅ Ensure this is correctly defined */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
