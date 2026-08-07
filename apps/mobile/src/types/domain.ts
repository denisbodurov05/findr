export interface User {
  id: string;
  username: string;
  email: string;
}

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

export interface StoreSummary {
  id: number;
  name: string;
  nameKey?: string;
  description: string;
  descriptionKey?: string;
  address: string;
  addressKey?: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthSession extends AuthTokens {
  user: User;
}

export interface Point {
  x: number;
  y: number;
}

export interface RoutePoint extends Point {
  id?: string;
}

export interface RouteSegment {
  start: RoutePoint;
  path: Point[];
  end: RoutePoint;
}

export interface PathfindResult {
  distance: number;
  sorted: (Product | null)[];
  pathfind: RouteSegment[];
}

export interface StoreCell {
  category: string;
  indentifierAndId?: string;
  identifierAndId?: string;
}

export interface StoreMap {
  id: number;
  name?: string;
  nameKey?: string;
  address: string;
  addressKey?: string;
  description: string;
  descriptionKey?: string;
  itemDetails: (StoreCell | null | undefined)[][];
}
