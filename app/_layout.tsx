import { Airbridge } from "airbridge-react-native-sdk";
import { Stack } from "expo-router";
import React, { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    if (Airbridge && (Airbridge as any).init) {
      (Airbridge as any).init("pawshop", "93486d07d7a44d47a70d509441d23c79");
    } else {
      console.log("Airbridge is not available");
    }
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="items/add" options={{ presentation: "modal" }} />
      <Stack.Screen name="items/[id]" options={{ presentation: "modal" }} />
    </Stack>
  );
}
