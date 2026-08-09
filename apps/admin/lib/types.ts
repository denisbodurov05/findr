import type { LayoutCellKind } from "@findr/types";

export interface CellMeta {
  kind: LayoutCellKind;
  productId?: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
