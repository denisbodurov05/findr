import { cellColor } from "@/lib/map";
import type { LayoutCell } from "@findr/types";

function ReloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
      <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38 323.7 32 306.7 32L64 32zm0 96c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32L96 224c-17.7 0-32-14.3-32-32l0-64zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
    </svg>
  );
}

interface Props {
  cells: Map<string, LayoutCell>;
  gridCols: number;
  gridRows: number;
  isAdmin: boolean;
  saving: boolean;
  loading: boolean;
  dirty: boolean;
  productCategory(productId: number): string | undefined;
  onPointerDown(x: number, y: number): void;
  onPointerEnter(x: number, y: number): void;
  onSave(): void;
  onReload(): void;
  onDelete(): void;
}

export function GridEditor({
  cells, gridCols, gridRows, isAdmin, saving, loading, dirty,
  productCategory, onPointerDown, onPointerEnter, onSave, onReload, onDelete,
}: Props) {
  return (
    <section className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
        <span>{loading ? "Loading layout…" : `${cells.size} cells placed${dirty ? " • unsaved" : ""}`}</span>
        <span className="ml-auto flex items-center gap-2">
          <button type="button" onClick={onReload} disabled={loading || saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500">
            <ReloadIcon />Reload
          </button>
          {isAdmin && (
            <>
              <button type="button" onClick={onSave} disabled={saving || loading || !dirty}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50">
                <SaveIcon />{saving ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={onDelete} disabled={saving || loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500">
                <TrashIcon />Delete
              </button>
            </>
          )}
        </span>
      </div>

      <div className="inline-grid touch-none select-none" style={{
        gridTemplateColumns: `repeat(${gridCols}, 16px)`,
        gridTemplateRows: `repeat(${gridRows}, 16px)`,
      }}>
        {Array.from({ length: gridRows }, (_, rowIndex) => {
          const y = gridRows - 1 - rowIndex;
          return Array.from({ length: gridCols }, (_, x) => {
            const cell = cells.get(`${x},${y}`);
            return (
              <button key={`${x},${y}`} type="button" title={`${x},${y}`} aria-label={`Store cell ${x},${y}`}
                disabled={loading || saving}
                onPointerDown={(event) => { event.preventDefault(); onPointerDown(x, y); }}
                onPointerEnter={() => onPointerEnter(x, y)}
                className="border border-slate-200 transition hover:ring-2 hover:ring-inset hover:ring-slate-500"
                style={{
                  backgroundColor: cell
                    ? cellColor(cell, productCategory(cell.productId ?? -1))
                    : "#FBFCFA",
                }} />
            );
          });
        })}
      </div>
    </section>
  );
}
