import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, radius, shadows, spacing } from "@/config/theme";
import type { TranslationKey } from "@/i18n/translations";
import { useCart } from "@/providers/CartProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { AppIcon } from "@/ui/AppIcon";
import { Button } from "@/ui/Button";
import { ScreenState } from "@/ui/ScreenState";

export function CartScreen() {
  const { cart, removeProduct } = useCart();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      {cart.length === 0 ? (
        <ScreenState title={t("cart.emptyTitle")} message={t("cart.emptyMessage")} />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.list,
            { paddingBottom: styles.list.paddingBottom + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {cart.map((product) => (
            <View key={product.productId} style={styles.productRow}>
              {(() => {
                const productName = product.nameKey
                  ? t(product.nameKey as TranslationKey)
                  : product.name;

                return (
                  <>
                    <View style={styles.productInfo}>
                      {product.imageUri ? (
                        <Image source={{ uri: product.imageUri }} style={styles.image} />
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <AppIcon library="Feather" name="package" size={26} color={colors.mutedText} />
                        </View>
                      )}
                      <View style={styles.textBlock}>
                        <Text numberOfLines={2} style={styles.productName}>
                          {productName}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      accessibilityLabel={t("cart.removeProduct", { name: productName })}
                      hitSlop={12}
                      onPress={() => removeProduct(product.productId)}
                      style={styles.deleteButton}
                    >
                      <AppIcon library="FontAwesome" name="trash" size={22} color={colors.danger} />
                    </Pressable>
                  </>
                );
              })()}
            </View>
          ))}
        </ScrollView>
      )}

      {cart.length > 0 ? (
        <Button
          label={t("cart.findRoute")}
          onPress={() => router.navigate("/(tabs)/map")}
          icon={<AppIcon library="FontAwesome" name="map" size={24} color={colors.surface} />}
          style={[styles.routeButton, { bottom: spacing.lg + insets.bottom }]}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 112,
  },
  productRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    minHeight: 80,
    padding: spacing.md,
    ...shadows.sm,
  },
  productInfo: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
  },
  image: {
    backgroundColor: colors.mutedSurface,
    borderRadius: radius.sm,
    height: 52,
    width: 52,
  },
  imagePlaceholder: {
    alignItems: "center",
    backgroundColor: colors.mutedSurface,
    borderRadius: radius.sm,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  textBlock: {
    flex: 1,
  },
  productName: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 17,
  },
  deleteButton: {
    paddingLeft: spacing.md,
  },
  routeButton: {
    bottom: spacing.lg,
    left: spacing.lg,
    minHeight: 54,
    position: "absolute",
    right: spacing.lg,
    ...shadows.sm,
  },
});
