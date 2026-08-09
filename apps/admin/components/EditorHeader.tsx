import { BrandLogo } from "@/components/BrandLogo";
import type { StoreSummary } from "@findr/types";

interface Props {
  stores: StoreSummary[];
  storeId: number | null;
  onStoreChange(id: number): void;
  isAdmin: boolean;
  busy: boolean;
  addingStore: boolean;
  newStoreName: string;
  onNewStoreNameChange(value: string): void;
  onNewStoreSubmit(): void;
  onCancelNewStore(): void;
  onStartNewStore(): void;
  onLogout(): void;
}

export function EditorHeader({
  stores, storeId, onStoreChange, isAdmin, busy,
  addingStore, newStoreName, onNewStoreNameChange,
  onNewStoreSubmit, onCancelNewStore, onStartNewStore, onLogout,
}: Props) {
  return (
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
      <BrandLogo />

      <select value={storeId ?? ""} disabled={busy || stores.length === 0}
        onChange={(event) => onStoreChange(Number(event.target.value))}
        className="rounded-lg border border-slate-400 bg-white px-3 py-1.5 text-sm text-slate-900">
        {stores.length === 0 ? <option value="">No stores</option> : null}
        {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
      </select>

      {isAdmin && (addingStore ? (
        <form onSubmit={(event) => { event.preventDefault(); onNewStoreSubmit(); }} className="flex items-center gap-1">
          <input autoFocus type="text" required value={newStoreName}
            onChange={(event) => onNewStoreNameChange(event.target.value)}
            placeholder="Store name"
            className="w-40 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-500" />
          <button type="submit" disabled={busy} className="rounded-lg bg-slate-900 px-2 py-1 text-sm text-white transition hover:bg-slate-700 disabled:opacity-50">Add</button>
          <button type="button" onClick={onCancelNewStore}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50">✕</button>
        </form>
      ) : (
        <button onClick={onStartNewStore} disabled={busy}
          className="rounded-lg border border-dashed border-slate-400 px-3 py-1.5 text-sm text-slate-500 transition hover:border-slate-600 hover:text-slate-700">
          + New store
        </button>
      ))}

      <div className="flex-1" />

      <button onClick={onLogout}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50">
        Sign out
      </button>
    </header>
  );
}
