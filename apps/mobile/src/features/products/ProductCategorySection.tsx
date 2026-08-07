import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, spacing } from "@/config/theme";
import type { TranslationKey } from "@/i18n/translations";
import { Product } from "@/types/domain";
import { ProductCard } from "@/features/products/ProductCard";
import { useTranslation } from "@/providers/I18nProvider";

interface ProductCategorySectionProps {
  category: string;
  products: Product[];
  isSelected: (productId: string) => boolean;
  onAddProduct: (product: Product) => void;
}

export function ProductCategorySection({
  category,
  products,
  isSelected,
  onAddProduct,
}: ProductCategorySectionProps) {
  const { t } = useTranslation();
  const title = category.startsWith("categories.") ? t(category as TranslationKey) : category;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.productId}
            product={product}
            selected={isSelected(product.productId)}
            onAdd={onAddProduct}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: "100%",
  },
  title: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
