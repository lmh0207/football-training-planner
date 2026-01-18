import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

// 커스텀 Paper 테마 (그린 톤)
const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: Colors.light.primary,
        primaryContainer: Colors.light.accent,
        secondary: Colors.light.accent,
        background: Colors.light.background,
        surface: Colors.light.card,
        surfaceVariant: Colors.light.card,
        error: Colors.light.error,
    },
};

const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: Colors.dark.primary,
        primaryContainer: Colors.dark.accent,
        secondary: Colors.dark.accent,
        background: Colors.dark.background,
        surface: Colors.dark.card,
        surfaceVariant: Colors.dark.card,
        error: Colors.dark.error,
    },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
        ...FontAwesome.font,
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
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
    const colorScheme = useColorScheme();
    const paperTheme = colorScheme === "dark" ? darkTheme : lightTheme;

    return (
        <PaperProvider theme={paperTheme}>
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="create"
                        options={{
                            presentation: "modal",
                            title: "훈련 조건 설정",
                        }}
                    />
                    <Stack.Screen
                        name="session/[id]"
                        options={{ title: "훈련 상세" }}
                    />
                </Stack>
            </ThemeProvider>
        </PaperProvider>
    );
}
