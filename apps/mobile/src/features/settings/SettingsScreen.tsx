import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts, radius, shadows, spacing } from "@/config/theme";
import type { TranslationKey } from "@/i18n/translations";
import { useAuth } from "@/providers/AuthProvider";
import { useCatalog } from "@/providers/CatalogProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { AppIcon } from "@/ui/AppIcon";

export function SettingsScreen() {
  const { user, signOut } = useAuth();
  const {
    selectedStoreId,
    selectStore,
    stores,
    storesError,
    storesLoading,
  } = useCatalog();
  const { language, languages, setLanguage, t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.account")}</Text>
          <View style={styles.accountRow}>
            <View style={styles.avatar}>
              <AppIcon library="FontAwesome" name="user" size={32} color={colors.primary} />
            </View>
            <View style={styles.accountText}>
              <Text style={styles.nameText}>{user?.username}</Text>
              <Text style={styles.emailText}>{user?.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.language")}</Text>
          <View style={styles.languageGroup}>
            {languages.map((option) => {
              const selected = option.code === language;

              return (
                <Pressable
                  key={option.code}
                  onPress={() => setLanguage(option.code)}
                  style={[styles.languageButton, selected && styles.languageButtonSelected]}
                >
                  <Text style={[styles.languageText, selected && styles.languageTextSelected]}>
                    {t(option.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.store")}</Text>
          <View style={styles.storeGroup}>
            {storesLoading ? (
              <Text style={styles.storeNoticeText}>{t("common.loading")}</Text>
            ) : null}

            {storesError ? (
              <Text style={styles.storeNoticeText}>{t("settings.storeLoadError")}</Text>
            ) : null}

            {!storesLoading && !storesError
              ? stores.map((store) => {
                  const selected = store.id === selectedStoreId;
                  const name = translateStoreText(store.nameKey, store.name, t);
                  const address = translateStoreText(store.addressKey, store.address, t);

                  return (
                    <Pressable
                      key={store.id}
                      onPress={() => selectStore(store.id)}
                      style={[styles.storeButton, selected && styles.storeButtonSelected]}
                    >
                      <View style={styles.storeIcon}>
                        <AppIcon
                          library="Feather"
                          name="map-pin"
                          size={22}
                          color={selected ? colors.surface : colors.primary}
                        />
                      </View>
                      <View style={styles.storeText}>
                        <Text style={[styles.storeName, selected && styles.storeNameSelected]}>
                          {name}
                        </Text>
                        <Text style={[styles.storeAddress, selected && styles.storeAddressSelected]}>
                          {address}
                        </Text>
                      </View>
                      {selected ? (
                        <AppIcon
                          library="Ionicons"
                          name="checkmark-circle"
                          size={24}
                          color={colors.surface}
                        />
                      ) : null}
                    </Pressable>
                  );
                })
              : null}
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={signOut}>
          <AppIcon library="Ionicons" name="exit-outline" size={28} color={colors.danger} />
          <Text style={styles.logoutText}>{t("settings.signOut")}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  screen: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.mutedText,
    fontFamily: fonts.bold,
    fontSize: 13,
    textTransform: "uppercase",
  },
  accountRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.mutedSurface,
    borderRadius: radius.md,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  accountText: {
    flex: 1,
  },
  nameText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  emailText: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  languageGroup: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
    ...shadows.sm,
  },
  languageButton: {
    alignItems: "center",
    borderRadius: radius.sm,
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  languageButtonSelected: {
    backgroundColor: colors.primary,
  },
  languageText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  languageTextSelected: {
    color: colors.surface,
  },
  storeGroup: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.sm,
    ...shadows.sm,
  },
  storeButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  storeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  storeIcon: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  storeText: {
    flex: 1,
    gap: spacing.xs,
  },
  storeName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  storeNameSelected: {
    color: colors.surface,
  },
  storeAddress: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  storeAddressSelected: {
    color: colors.surface,
  },
  storeNoticeText: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 14,
    padding: spacing.sm,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    width: "100%",
  },
  logoutText: {
    color: colors.danger,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
});
