export interface StoreSummary {
  id: number;
  name: string;
  nameKey?: string;
  description: string;
  descriptionKey?: string;
  address: string;
  addressKey?: string;
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
