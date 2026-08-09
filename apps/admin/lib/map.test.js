import { describe, expect, it } from "@jest/globals";

import { paintLayoutCell, parseCell, parseStoreLayout } from "@/lib/map";

describe("store map parsing", () => {
  it("parses supported cell types", () => {
    expect(parseCell({ identifierAndId: "P42", category: "categories.fruits" }))
      .toEqual({ kind: "PRODUCT", productId: 42 });
    expect(parseCell({ identifierAndId: "TF", category: "entry" }))
      .toEqual({ kind: "ENTRY" });
  });

  it("rejects malformed product identifiers", () => {
    expect(parseCell({ identifierAndId: "Pnot-a-number", category: "categories.fruits" }))
      .toBeNull();
  });

  it("converts a sparse API store map into editor cells", () => {
    const itemDetails = [];
    itemDetails[3] = [];
    itemDetails[3][4] = { identifierAndId: "P7", category: "categories.fruits" };
    itemDetails[5] = [];
    itemDetails[5][6] = { identifierAndId: "TF", category: "exit" };

    const cells = parseStoreLayout({
      id: 1,
      name: "test",
      description: "",
      itemDetails,
    });

    expect([...cells.values()]).toEqual([
      { x: 3, y: 4, kind: "PRODUCT", productId: 7 },
      { x: 5, y: 6, kind: "EXIT" },
    ]);
  });

  it("keeps repeated product and tool placements", () => {
    let cells = new Map();
    cells = paintLayoutCell(cells, 1, 1, "PRODUCT", 7);
    cells = paintLayoutCell(cells, 2, 1, "PRODUCT", 7);
    cells = paintLayoutCell(cells, 3, 1, "ENTRY");
    cells = paintLayoutCell(cells, 4, 1, "ENTRY");

    expect([...cells.values()]).toEqual([
      { x: 1, y: 1, kind: "PRODUCT", productId: 7 },
      { x: 2, y: 1, kind: "PRODUCT", productId: 7 },
      { x: 3, y: 1, kind: "ENTRY" },
      { x: 4, y: 1, kind: "ENTRY" },
    ]);
  });
});
