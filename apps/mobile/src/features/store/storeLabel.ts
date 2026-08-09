import type { StoreSummary } from "@findr/types";

export function getStoreLabel(store: Pick<StoreSummary, "id" | "name">): string {
  return `${store.name} (#${store.id})`;
}
