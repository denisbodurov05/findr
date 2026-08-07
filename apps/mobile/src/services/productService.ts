import { AxiosInstance } from "axios";

import { Product, ProductsByCategory } from "@findr/types";

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    productId: String(product.productId),
    imageUri: product.image || product.imageUri || undefined,
  };
}

export async function getProductsByCategory(api: AxiosInstance) {
  const { data } = await api.get<ProductsByCategory>("/products/grouped-by-categories");
  const groupedProducts: ProductsByCategory = {};

  for (const [category, products] of Object.entries(data)) {
    groupedProducts[category] = products.map(normalizeProduct);
  }

  return groupedProducts;
}
