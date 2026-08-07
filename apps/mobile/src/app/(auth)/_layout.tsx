import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/providers/AuthProvider";
import { useCatalog } from "@/providers/CatalogProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { ScreenState } from "@/ui/ScreenState";

function AuthLayout() {
  const { user } = useAuth();
  const { selectedStoreId, storeSelectionLoading } = useCatalog();
  const { t } = useTranslation();

  if (user) {
    if (storeSelectionLoading) {
      return <ScreenState loading title={t("common.loading")} />;
    }

    return selectedStoreId === null ? (
      <Redirect href="/store-select" />
    ) : (
      <Redirect href="/(tabs)" />
    );
  }

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
}

export default AuthLayout;
