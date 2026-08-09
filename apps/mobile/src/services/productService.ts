import { AxiosInstance } from "axios";

import { Product, ProductDto, ProductsByCategory, ProductsByCategoryDto } from "@findr/types";

function normalizeProduct(product: ProductDto): Product {
  return {
    ...product,
    productId: String(product.productId),
    imageUri: product.image || undefined,
  };
}

export async function getProductsByCategory(api: AxiosInstance, storeId: number) {
  const { data } = await api.get<ProductsByCategoryDto>(
    `/products/grouped-by-categories/store/${storeId}`
  );
  const groupedProducts: ProductsByCategory = {};

  for (const [category, products] of Object.entries(data)) {
    groupedProducts[category] = products.map(normalizeProduct);
  }

  return groupedProducts;
}
