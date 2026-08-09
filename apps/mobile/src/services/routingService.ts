import { AxiosInstance } from "axios";

import { PathfindDto, PathfindResult, Product, ProductDto, StoreMap, StoreSummary } from "@findr/types";

function normalizeSortedProduct(product: ProductDto | null): Product | null {
  if (!product) {
    return null;
  }

  return {
    ...product,
    productId: String(product.productId),
    imageUri: product.image || undefined,
  };
}

export async function getStoreMap(api: AxiosInstance, storeId = 1) {
  const { data } = await api.get<StoreMap>(`/store/${storeId}`);
  return data;
}

export async function getStores(api: AxiosInstance) {
  const { data } = await api.get<StoreSummary[]>("/store");
  return data;
}

export async function getPath(api: AxiosInstance, productIds: string[], storeId = 1) {
  const products = productIds.map((productId) => `P${productId}`);
  const { data } = await api.get<PathfindDto>(`/pathfind/${storeId}`, {
    params: {
      products: products.join(","),
    },
  });

  return {
    ...data,
    sorted: data.sorted.map(normalizeSortedProduct),
  } satisfies PathfindResult;
}
