import { cellColor, categoryColor } from "@/lib/map";
import { productNames } from "@/lib/translations";
import type { LayoutCellKind as CellKind, ProductDto } from "@findr/types";

const TOOLS: { kind: CellKind; label: string }[] = [
  { kind: "ENTRY", label: "Entrance" },
  { kind: "EXIT", label: "Exit" },
  { kind: "NORMAL_CHECKOUT", label: "Checkout" },
  { kind: "SELF_CHECKOUT", label: "Self checkout" },
  { kind: "BLOCKED", label: "Blocked" },
];

interface Props {
  tool: CellKind | "ERASE" | null;
  selectedProduct: ProductDto | null;
  search: string;
  productList: ProductDto[];
  onSelectTool(t: CellKind | "ERASE" | null): void;
  onSelectProduct(product: ProductDto): void;
  onSearchChange(value: string): void;
}

export function ProductSidebar({
  tool, selectedProduct, search, productList,
  onSelectTool, onSelectProduct, onSearchChange,
}: Props) {
  return (
    <aside className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Tools</h2>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {TOOLS.map((item) => (
          <button key={item.kind}
            onClick={() => onSelectTool(tool === item.kind ? null : item.kind)}
            className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs transition ${
              tool === item.kind
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: cellColor({ kind: item.kind }) }} />
            {item.label}
          </button>
        ))}
        <button onClick={() => onSelectTool(tool === "ERASE" ? null : "ERASE")}
          className={`flex items-center justify-center rounded-lg border px-2 py-1.5 text-xs transition ${
            tool === "ERASE"
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
          Erase
        </button>
      </div>

      <div className="flex flex-col" style={{ height: "calc(100vh - 280px)" }}>
        <h2 className="mb-2 shrink-0 text-sm font-semibold text-slate-900">Products</h2>
        <input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search products..."
          className="mb-3 shrink-0 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-slate-500" />

        <div className="flex-1 space-y-1 overflow-y-auto">
          {productList.map((product) => (
            <button key={product.productId}
              onClick={() => { onSelectProduct(product); onSelectTool("PRODUCT"); }}
              className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition ${
                selectedProduct?.productId === product.productId
                  ? "border-slate-900 bg-slate-100"
                  : "border-transparent hover:bg-slate-50"}`}>
              <span className="h-3 w-3 shrink-0 rounded-sm"
                style={{ backgroundColor: categoryColor(product.categoryKey) }} />
              <span className="truncate text-slate-700">
                {productNames[product.nameKey] ?? product.name}
              </span>
              {product.isGolden ? (
                <span className="ml-auto shrink-0 rounded bg-amber-100 px-1 text-[10px] font-medium text-amber-700">golden</span>
              ) : null}
            </button>
          ))}
          {productList.length === 0 ? <p className="text-xs text-slate-400">No products match.</p> : null}
        </div>
      </div>
    </aside>
  );
}
