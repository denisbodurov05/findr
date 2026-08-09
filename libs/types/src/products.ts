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

export interface ProductDto {
  productId: number;
  name: string;
  nameKey: string;
  image?: string | null;
  categoryKey: string;
  isGolden: boolean;
}

export type ProductsByCategory = Record<string, Product[]>;
export type ProductsByCategoryDto = Record<string, ProductDto[]>;
