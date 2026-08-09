import type {
  LayoutCell,
  LayoutCellKind,
  StoreCell as StoreCellView,
  StoreMap as StoreDto,
} from "@findr/types";

import type { CellMeta } from "@/lib/types";

export const GRID_COLS = 41;
export const GRID_ROWS = 21;

export type PaintTool = LayoutCellKind | "ERASE";

export function paintLayoutCell(
  previous: Map<string, LayoutCell>,
  x: number,
  y: number,
  tool: PaintTool,
  productId?: number,
): Map<string, LayoutCell> {
  const next = new Map(previous);
  const key = `${x},${y}`;
  const current = next.get(key);

  if (tool === "ERASE") {
    next.delete(key);
  } else if (tool === "PRODUCT") {
    if (productId === undefined) return next;
    if (current?.kind === "PRODUCT" && current.productId === productId) next.delete(key);
    else next.set(key, { x, y, kind: "PRODUCT", productId });
  } else if (current?.kind === tool) {
    next.delete(key);
  } else {
    next.set(key, { x, y, kind: tool });
  }

  return next;
}

export function parseCell(cell: StoreCellView): CellMeta | null {
  if (cell.identifierAndId?.startsWith("P")) {
    const productId = Number(cell.identifierAndId.slice(1));
    return Number.isSafeInteger(productId) && productId > 0
      ? { kind: "PRODUCT", productId }
      : null;
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

export function parseStoreLayout(store: StoreDto): Map<string, LayoutCell> {
  const cells = new Map<string, LayoutCell>();

  for (let x = 0; x < GRID_COLS; x += 1) {
    for (let y = 0; y < GRID_ROWS; y += 1) {
      const cell = store.itemDetails[x]?.[y];
      if (!cell) continue;

      const meta = parseCell(cell);
      if (meta) cells.set(`${x},${y}`, { x, y, ...meta });
    }
  }

  return cells;
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

  return "#DCE7DE";
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
