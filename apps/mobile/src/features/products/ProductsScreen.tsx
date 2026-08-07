import { Link } from "expo-router";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, radius, shadows, spacing } from "@/config/theme";
import { ProductCard } from "@/features/products/ProductCard";
import { useProducts } from "@/features/products/useProducts";
import type { TranslationKey } from "@/i18n/translations";
import { useCart } from "@/providers/CartProvider";
import { useTranslation } from "@/providers/I18nProvider";
import type { Product } from "@/types/domain";
import { AppIcon } from "@/ui/AppIcon";
import { Button } from "@/ui/Button";
import { ScreenState } from "@/ui/ScreenState";
import { TextField } from "@/ui/TextField";

interface ProductSection {
  title: string;
  data: Product[][];
}

export function ProductsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { productsByCategory, query, setQuery, loading, error, reload } = useProducts();
  const { addProduct, isInCart, cartCount } = useCart();
  const sections = Object.entries(productsByCategory).map<ProductSection>(
    ([category, products]) => ({
      title: category.startsWith("categories.") ? t(category as TranslationKey) : category,
      data: chunkProducts(products),
    })
  );

  if (loading) {
    return <ScreenState loading title={t("common.loading")} />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
        <ScreenState title={error} message={t("common.retryLater")} />
        <View style={styles.retryButton}>
          <Button label={t("storeSelect.retry")} variant="ghost" onPress={reload} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <View style={styles.searchContainer}>
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder={t("products.searchPlaceholder")}
          left={<AppIcon library="FontAwesome" name="search" size={22} color={colors.text} />}
          returnKeyType="search"
        />
      </View>

      <SectionList
        style={styles.scrollView}
        sections={sections}
        keyExtractor={(row, index) => `${row.map((product) => product.productId).join("-")}-${index}`}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            {item.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                selected={isInCart(product.productId)}
                onAdd={addProduct}
              />
            ))}
            {item.length === 1 ? <View style={styles.productRowFiller} /> : null}
          </View>
        )}
        ListEmptyComponent={<ScreenState title={t("products.empty")} />}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: styles.scrollContent.paddingBottom + insets.bottom },
        ]}
        initialNumToRender={4}
        maxToRenderPerBatch={5}
        removeClippedSubviews
        stickySectionHeadersEnabled={false}
        updateCellsBatchingPeriod={60}
        windowSize={5}
      />

      <Link asChild href="/(tabs)/cart">
        <Pressable
          accessibilityLabel={t("products.openCart")}
          style={StyleSheet.flatten([
            styles.cartButton,
            { bottom: spacing.lg + insets.bottom },
          ])}
        >
          <AppIcon library="FontAwesome" name="shopping-cart" size={28} color={colors.surface} />
          {cartCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

function chunkProducts(products: Product[]) {
  const rows: Product[][] = [];

  for (let index = 0; index < products.length; index += 2) {
    rows.push(products.slice(index, index + 2));
  }

  return rows;
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  retryButton: {
    alignItems: "center",
    paddingBottom: spacing.xl,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 96,
  },
  sectionTitle: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  productRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  productRowFiller: {
    flexBasis: "47.8%",
  },
  cartButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    bottom: spacing.lg,
    height: 58,
    justifyContent: "center",
    position: "absolute",
    right: spacing.lg,
    width: 58,
    ...shadows.sm,
  },
  cartBadge: {
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: 10,
    height: 20,
    justifyContent: "center",
    minWidth: 20,
    position: "absolute",
    right: -4,
    top: -4,
  },
  cartBadgeText: {
    color: colors.surface,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
});
