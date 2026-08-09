import { useAuth } from "@/providers/AuthProvider";
import { Link, Redirect, Stack } from "expo-router";
import { CartProvider } from "@/providers/CartProvider";
import { colors, fonts } from "@/config/theme";
import { AppIcon } from "@/ui/AppIcon";
import { useCatalog } from "@/providers/CatalogProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { ScreenState } from "@/ui/ScreenState";

const headerSettingsButton = () => {
  return (
    <Link href="/(tabs)/settings" style={{ marginRight: 8 }}>
      <AppIcon library="Ionicons" name="settings-sharp" size={28} color={colors.surface} />
    </Link>
  );
};

function AuthLayout() {
  const { user } = useAuth();
  const { selectedStoreId, storeSelectionLoading } = useCatalog();
  const { t } = useTranslation();

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (storeSelectionLoading) {
    return <ScreenState loading title={t("common.loading")} />;
  }

  if (selectedStoreId === null) {
    return <Redirect href="/store-select" />;
  }

  return (
    <CartProvider key={selectedStoreId}>
      <Stack screenOptions={{ freezeOnBlur: true }}>
        <Stack.Screen
          name="index"
          options={{
            title: t("tabs.products"),
            headerBackVisible: false,
            headerRight: headerSettingsButton,
            headerTitleAlign: "center",
            headerBackButtonMenuEnabled: false,
            headerTitleStyle: {
              fontFamily: fonts.bold,
            },
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.surface,
          }}
        />
        <Stack.Screen
          name="map"
          options={{
            headerBackVisible: false,
            title: t("tabs.map"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontFamily: fonts.bold,
            },
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.surface,
          }}
        />
        <Stack.Screen
          name="cart"
          options={{
            title: t("tabs.cart"),
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.surface,
          }}
        />

        <Stack.Screen
          name="settings"
          options={{
            title: t("tabs.settings"),
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.surface,
          }}
        />
      </Stack>
    </CartProvider>
  );
}

export default AuthLayout;
