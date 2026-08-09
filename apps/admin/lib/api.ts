import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import { firebaseApp } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8890";

export interface StoreSummary {
  id: number;
  name: string;
  nameKey: string;
  address: string;
}

export interface ProductDto {
  productId: number;
  name: string;
  nameKey: string;
  categoryKey: string;
  isGolden: boolean;
  image?: string | null;
}

export interface StoreCellView {
  identifierAndId: string;
  category: string;
}

export interface StoreDto {
  id: number;
  name: string;
  nameKey: string;
  itemDetails: (StoreCellView | null)[][];
}

export type CellKind =
  | "PRODUCT"
  | "NORMAL_CHECKOUT"
  | "SELF_CHECKOUT"
  | "ENTRY"
  | "EXIT"
  | "BLOCKED";

export interface LayoutCell {
  x: number;
  y: number;
  kind: CellKind;
  productId?: number;
}

export interface CellMeta {
  kind: CellKind;
  productId?: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

async function request(path: string, token: string | null, init?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `${init?.method ?? "GET"} ${path} -> ${res.status}`);
  }

  return res;
}

export async function authenticate(email: string, password: string): Promise<string> {
  const { user } = await signInWithEmailAndPassword(getAuth(firebaseApp), email, password);
  return user.getIdToken();
}

export async function getMe(token: string): Promise<{ email: string; role: string }> {
  const res = await request("/api/v1/auth/me", token);
  return res.json();
}

export async function getStores(token: string): Promise<StoreSummary[]> {
  const res = await request("/api/v1/store", token);
  return res.json();
}

export async function getStore(token: string, storeId: number): Promise<StoreDto> {
  const res = await request(`/api/v1/store/${storeId}`, token);
  return res.json();
}

export async function getProducts(token: string): Promise<Record<string, ProductDto[]>> {
  const res = await request("/api/v1/products/grouped-by-categories", token);
  return res.json();
}

export async function saveLayout(token: string, storeId: number, cells: LayoutCell[]): Promise<void> {
  await request(`/api/v1/store/${storeId}/layout`, token, {
    method: "PUT",
    body: JSON.stringify(cells),
  });
}

export function parseCell(cell: StoreCellView): CellMeta | null {
  if (cell.identifierAndId?.startsWith("P")) {
    return { kind: "PRODUCT", productId: Number(cell.identifierAndId.slice(1)) };
  }

  switch (cell.category) {
    case "normal_checkout":
      return { kind: "NORMAL_CHECKOUT" };
    case "self_checkout":
      return { kind: "SELF_CHECKOUT" };
    case "entry":
      return { kind: "ENTRY" };
    case "exit":
      return { kind: "EXIT" };
    case "blocked_path":
      return { kind: "BLOCKED" };
    default:
      return null;
  }
}

export function cellColor(cell: CellMeta, productCategoryKey?: string): string {
  switch (cell.kind) {
    case "NORMAL_CHECKOUT":
      return "#D8A21B";
    case "SELF_CHECKOUT":
      return "#2F9E74";
    case "ENTRY":
      return "#3BB273";
    case "EXIT":
      return "#D9534F";
    case "BLOCKED":
      return "#B93737";
    case "PRODUCT":
      return categoryColor(productCategoryKey);
  }
}

const CATEGORY_GROUPS: Record<string, string[]> = {
  drinks: ["alcohol", "beer", "other_drinks", "energy_drinks", "coffee", "tea"],
  fresh: ["vegetables", "meat", "milk", "dairy", "seafood", "fruits", "fish", "eggs"],
  pantry: ["organic", "flours", "legumes", "canned_food", "mayonnaise", "butters", "cooking_oil", "vinegar", "pasta", "savory_snacks", "sauces", "dried_goods"],
  snacks: ["biscuits", "muesli", "sweets", "ice_cream", "chocolate", "nuts"],
  home: ["other", "toys", "non_food", "diy", "cleaning"],
};

const GROUP_COLORS: Record<string, string> = {
  drinks: "#4CA3C7",
  fresh: "#57A86E",
  pantry: "#C99A3A",
  snacks: "#C65F8D",
  home: "#8675C2",
};

export function categoryColor(categoryKey?: string): string {
  if (!categoryKey) {
    return "#DCE7DE";
  }

  const name = categoryKey.replace(/^categories\./, "");

  for (const [group, members] of Object.entries(CATEGORY_GROUPS)) {
    if (members.includes(name)) {
      return GROUP_COLORS[group];
    }
  }

  return "#DCE7DE";
}

export function categoryLabel(categoryKey: string): string {
  return categoryKey.replace(/^categories\./, "").replace(/_/g, " ");
}

export const GRID_COLS = 41;
export const GRID_ROWS = 21;
