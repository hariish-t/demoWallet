import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import SendScreen from "./src/screens/SendScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Wallet" component={HomeScreen} />
        <Stack.Screen name="Send" component={SendScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
