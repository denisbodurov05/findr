import { useMemo, useState } from "react";

import type { TranslationKey } from "@/i18n/translations";
import { useCatalog } from "@/providers/CatalogProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { ProductsByCategory } from "@/types/domain";

export function useProducts() {
  const { t } = useTranslation();
  const { productsByCategory, productsLoading, productsError, reloadProducts } = useCatalog();
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return productsByCategory;
    }

    return Object.entries(productsByCategory).reduce<ProductsByCategory>(
      (filtered, [category, products]) => {
        const categoryProducts = products.filter((product) =>
          getProductLabel(product.nameKey, product.name, t).toLowerCase().includes(normalizedQuery)
        );

        if (categoryProducts.length > 0) {
          filtered[category] = categoryProducts;
        }

        return filtered;
      },
      {}
    );
  }, [productsByCategory, query, t]);

  return {
    query,
    setQuery,
    loading: productsLoading,
    error: productsError ? t("products.loadError") : null,
    productsByCategory: filteredProducts,
    reload: reloadProducts,
  };
}

function getProductLabel(
  nameKey: string | undefined,
  fallback: string,
  t: (key: TranslationKey) => string
) {
  return nameKey ? t(nameKey as TranslationKey) : fallback;
}
