import { Redirect, router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts, radius, shadows, spacing } from "@/config/theme";
import type { TranslationKey } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import { useCatalog } from "@/providers/CatalogProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { AppIcon } from "@/ui/AppIcon";
import { BrandLogo } from "@/ui/BrandLogo";
import { Button } from "@/ui/Button";
import { ScreenState } from "@/ui/ScreenState";
import type { StoreSummary } from "@findr/types";

export function StoreSelectScreen() {
  const { user } = useAuth();
  const {
    reloadStores,
    selectStore,
    selectedStoreId,
    storeSelectionLoading,
    stores,
    storesError,
    storesLoading,
  } = useCatalog();
  const { t } = useTranslation();

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (storeSelectionLoading) {
    return <ScreenState loading title={t("common.loading")} />;
  }

  if (selectedStoreId !== null) {
    return <Redirect href="/(tabs)" />;
  }

  function handleSelectStore(storeId: number) {
    selectStore(storeId);
    router.replace("/(tabs)");
  }

  const showLoading = storesLoading || (!storesError && stores.length === 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <BrandLogo />
          <Text style={styles.title}>{t("storeSelect.title")}</Text>
          <Text style={styles.subtitle}>{t("storeSelect.subtitle")}</Text>
        </View>

        {showLoading ? <ScreenState loading title={t("common.loading")} /> : null}

        {storesError ? (
          <View style={styles.errorBlock}>
            <Text style={styles.errorText}>{t("settings.storeLoadError")}</Text>
            <Button label={t("storeSelect.retry")} variant="ghost" onPress={reloadStores} />
          </View>
        ) : null}

        {!showLoading && !storesError ? (
          <View style={styles.storeList}>
            {stores.map((store) => (
              <StoreOption key={store.id} store={store} onPress={handleSelectStore} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function StoreOption({
  onPress,
  store,
}: {
  onPress: (storeId: number) => void;
  store: StoreSummary;
}) {
  const { t } = useTranslation();
  const name = translateStoreText(store.nameKey, store.name, t);
  const description = translateStoreText(store.descriptionKey, store.description, t);
  const address = translateStoreText(store.addressKey, store.address, t);

  return (
    <Pressable
      onPress={() => onPress(store.id)}
      style={({ pressed }) => [styles.storeCard, pressed && styles.storeCardPressed]}
    >
      <View style={styles.storeIcon}>
        <AppIcon library="Feather" name="map-pin" size={24} color={colors.primary} />
      </View>
      <View style={styles.storeText}>
        <Text style={styles.storeName}>{name}</Text>
        <Text style={styles.storeDescription}>{description}</Text>
        <Text style={styles.storeAddress}>{address}</Text>
      </View>
      <AppIcon library="Feather" name="arrow-right" size={22} color={colors.primary} />
    </Pressable>
  );
}

function translateStoreText(
  key: string | undefined,
  fallback: string,
  t: (key: TranslationKey) => string
) {
  return key ? t(key as TranslationKey) : fallback;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.xl,
    justifyContent: "center",
    padding: spacing.xl,
  },
  header: {
    alignItems: "center",
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 28,
    textAlign: "center",
  },
  subtitle: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  storeList: {
    gap: spacing.md,
  },
  storeCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 88,
    padding: spacing.md,
    ...shadows.sm,
  },
  storeCardPressed: {
    borderColor: colors.primary,
    transform: [{ scale: 0.99 }],
  },
  storeIcon: {
    alignItems: "center",
    backgroundColor: colors.mutedSurface,
    borderRadius: radius.md,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  storeText: {
    flex: 1,
    gap: spacing.xs,
  },
  storeName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  storeDescription: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  storeAddress: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  errorBlock: {
    gap: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    textAlign: "center",
  },
});
