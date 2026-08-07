import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider } from "@/providers/AuthProvider";
import { CatalogProvider } from "@/providers/CatalogProvider";
import { I18nProvider } from "@/providers/I18nProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
    JosefineSansBold: require("../../assets/fonts/JosefinSans-Bold.ttf"),
    JosefineSansSemiBold: require("../../assets/fonts/JosefinSans-SemiBold.ttf"),
    JosefineSansRegular: require("../../assets/fonts/JosefinSans-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <AuthProvider>
          <CatalogProvider>
            <Stack>
              <Stack.Screen name="store-select" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
          </CatalogProvider>
        </AuthProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
