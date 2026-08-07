export interface Product {
  productId: string;
  name: string;
  nameKey?: string;
  image?: string | null;
  imageUri?: string;
  coordinateId?: string | number | null;
  categoryId?: string | number | null;
  categoryKey?: string;
  isGolden?: boolean;
  golden?: boolean;
}

export type ProductsByCategory = Record<string, Product[]>;
