export interface StoreSummary {
  id: number;
  name: string;
  description: string;
}

export interface StoreCell {
  category: string;
  identifierAndId: string;
}

export type LayoutCellKind =
  | "PRODUCT"
  | "NORMAL_CHECKOUT"
  | "SELF_CHECKOUT"
  | "ENTRY"
  | "EXIT"
  | "BLOCKED";

export interface LayoutCell {
  x: number;
  y: number;
  kind: LayoutCellKind;
  productId?: number;
}

export interface StoreMap {
  id: number;
  name?: string;
  description: string;
  itemDetails: (StoreCell | null | undefined)[][];
}
