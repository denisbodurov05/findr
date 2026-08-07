import { Redirect } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useCatalog } from "@/providers/CatalogProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { ScreenState } from "@/ui/ScreenState";

const Index = () => {
  const { user, loading } = useAuth();
  const { selectedStoreId, storeSelectionLoading } = useCatalog();
  const { t } = useTranslation();

  if (loading || (user && storeSelectionLoading)) {
    return <ScreenState loading title={t("common.loading")} />;
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return selectedStoreId === null ? <Redirect href="/store-select" /> : <Redirect href="/(tabs)" />;
};

export default Index;
