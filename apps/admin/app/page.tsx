"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

import { firebaseApp } from "@/lib/firebase";

import {
  ApiError,
  authenticate,
  categoryColor,
  cellColor,
  getProducts,
  getStore,
  getStores,
  GRID_COLS,
  GRID_ROWS,
  parseCell,
  saveLayout,
} from "@/lib/api";
import type {
  CellKind,
  LayoutCell,
  ProductDto,
  StoreSummary,
} from "@/lib/api";

const TOOLS: { kind: CellKind; label: string }[] = [
  { kind: "ENTRY", label: "Entrance" },
  { kind: "EXIT", label: "Exit" },
  { kind: "NORMAL_CHECKOUT", label: "Checkout" },
  { kind: "SELF_CHECKOUT", label: "Self checkout" },
  { kind: "BLOCKED", label: "Blocked" },
];

type Tool = CellKind | "ERASE";

interface Status {
  type: "ok" | "error";
  text: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [cells, setCells] = useState<Map<string, LayoutCell>>(new Map());
  const [products, setProducts] = useState<Record<string, ProductDto[]>>({});
  const [tool, setTool] = useState<Tool | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(firebaseApp), (firebaseUser) => {
      if (firebaseUser) {
        void firebaseUser.getIdToken().then(setToken);
      } else {
        setToken(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    void Promise.all([getStores(token), getProducts(token)])
      .then(([storeList, productMap]) => {
        setStores(storeList);
        setProducts(productMap);
        if (storeList.length > 0) {
          setStoreId(storeList[0].id);
        }
      })
      .catch((error) => {
        setStatus({ type: "error", text: error instanceof ApiError ? error.message : "Failed to load data" });
        void signOut(getAuth(firebaseApp));
      });
  }, [token]);

  useEffect(() => {
    if (!token || storeId === null) {
      return;
    }

    void getStore(token, storeId)
      .then((store) => {
        const next = new Map<string, LayoutCell>();

        for (let x = 0; x < GRID_COLS; x += 1) {
          for (let y = 0; y < GRID_ROWS; y += 1) {
            const cell = store.itemDetails[x]?.[y];

            if (!cell) {
              continue;
            }

            const meta = parseCell(cell);

            if (meta) {
              next.set(`${x},${y}`, { x, y, ...meta });
            }
          }
        }

        setCells(next);
      })
      .catch((error) => {
        setStatus({ type: "error", text: error instanceof ApiError ? error.message : "Failed to load store map" });
      });
  }, [token, storeId]);

  const productList = useMemo(() => {
    const flat = Object.values(products).flat();
    const query = search.trim().toLowerCase();

    if (!query) {
      return flat;
    }

    return flat.filter((product) => product.name.toLowerCase().includes(query));
  }, [products, search]);

  const productCategory = useCallback(
    (productId: number) => {
      for (const list of Object.values(products)) {
        const found = list.find((product) => product.productId === productId);

        if (found) {
          return found.categoryKey;
        }
      }

      return undefined;
    },
    [products]
  );

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError(null);

    try {
      await authenticate(email, password);
    } catch (error) {
      const code = (error as { code?: unknown } | null)?.code;

      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        setAuthError("Incorrect email or password!");
      } else if (code === "auth/too-many-requests") {
        setAuthError("Too many attempts. Please try again later.");
      } else {
        setAuthError("Login failed. Check your connection.");
      }
    } finally {
      setAuthBusy(false);
    }
  }

  function handleLogout() {
    void signOut(getAuth(firebaseApp));
  }

  function handleCellClick(x: number, y: number) {
    if (!tool) {
      return;
    }

    const key = `${x},${y}`;
    setCells((previous) => {
      const next = new Map(previous);
      const current = next.get(key);

      if (tool === "ERASE") {
        next.delete(key);
      } else if (tool === "PRODUCT" && selectedProduct) {
        if (current?.kind === "PRODUCT" && current.productId === selectedProduct.productId) {
          next.delete(key);
        } else {
          next.set(key, { x, y, kind: "PRODUCT", productId: selectedProduct.productId });
        }
      } else if (current?.kind === tool) {
        next.delete(key);
      } else {
        next.set(key, { x, y, kind: tool });
      }

      return next;
    });
  }

  function selectTool(nextTool: Tool | null) {
    setTool(nextTool);

    if (nextTool !== "PRODUCT") {
      setSelectedProduct(null);
    }
  }

  async function handleSave() {
    if (!token || storeId === null) {
      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      await saveLayout(token, storeId, [...cells.values()]);
      setStatus({ type: "ok", text: "Layout saved — pathfinding cache invalidated." });
    } catch (error) {
      setStatus({ type: "error", text: error instanceof ApiError ? error.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function handleReload() {
    if (storeId === null) {
      return;
    }

    setStatus(null);

    try {
      const store = await getStore(token as string, storeId);
      const next = new Map<string, LayoutCell>();

      for (let x = 0; x < GRID_COLS; x += 1) {
        for (let y = 0; y < GRID_ROWS; y += 1) {
          const cell = store.itemDetails[x]?.[y];

          if (cell) {
            const meta = parseCell(cell);

            if (meta) {
              next.set(`${x},${y}`, { x, y, ...meta });
            }
          }
        }
      }

      setCells(next);
      setStatus({ type: "ok", text: "Layout reloaded from server." });
    } catch (error) {
      setStatus({ type: "error", text: error instanceof ApiError ? error.message : "Reload failed" });
    }
  }

  if (!token) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-100 p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-xl font-semibold text-slate-900">Findr Admin</h1>

          <label className="mb-1 block text-sm font-medium text-slate-600" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />

          <label className="mb-1 block text-sm font-medium text-slate-600" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />

          {authError ? <p className="mb-4 text-sm text-red-600">{authError}</p> : null}

          <button
            type="submit"
            disabled={authBusy}
            className="w-full rounded-lg bg-slate-900 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {authBusy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
        <h1 className="text-lg font-semibold text-slate-900">Findr Admin</h1>

        <select
          value={storeId ?? ""}
          onChange={(event) => setStoreId(Number(event.target.value))}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <button
          onClick={handleReload}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
        >
          Reload
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save layout"}
        </button>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50"
        >
          Sign out
        </button>
      </header>

      {status ? (
        <div
          className={`px-6 py-2 text-sm ${
            status.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
          }`}
        >
          {status.text}
        </div>
      ) : null}

      <div className="flex flex-1 gap-6 overflow-hidden p-6">
        <aside className="w-72 shrink-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Tools</h2>

          <div className="mb-4 grid grid-cols-2 gap-2">
            {TOOLS.map((item) => (
              <button
                key={item.kind}
                onClick={() => selectTool(tool === item.kind ? null : item.kind)}
                className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs transition ${
                  tool === item.kind
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: cellColor({ kind: item.kind }) }} />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => selectTool(tool === "ERASE" ? null : "ERASE")}
              className={`flex items-center justify-center rounded-lg border px-2 py-1.5 text-xs transition ${
                tool === "ERASE"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Erase
            </button>
          </div>

          <h2 className="mb-2 text-sm font-semibold text-slate-900">Products</h2>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
          />

          <div className="space-y-1">
            {productList.map((product) => (
              <button
                key={product.productId}
                onClick={() => {
                  setSelectedProduct(product);
                  setTool("PRODUCT");
                }}
                className={`flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition ${
                  selectedProduct?.productId === product.productId
                    ? "border-slate-900 bg-slate-100"
                    : "border-transparent hover:bg-slate-50"
                }`}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: categoryColor(product.categoryKey) }}
                />
                <span className="truncate text-slate-700">{product.name}</span>
                {product.isGolden ? (
                  <span className="ml-auto shrink-0 rounded bg-amber-100 px-1 text-[10px] font-medium text-amber-700">
                    golden
                  </span>
                ) : null}
              </button>
            ))}

            {productList.length === 0 ? (
              <p className="text-xs text-slate-400">No products match.</p>
            ) : null}
          </div>
        </aside>

        <section className="flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
            <span>
              {`${cells.size} cells placed`}
            </span>
            <span className="ml-auto">Click a cell to place the selected tool; click again to remove.</span>
          </div>

          <div
            className="inline-grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, 16px)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 16px)`,
            }}
          >
            {Array.from({ length: GRID_ROWS }, (_, rowIndex) => {
              const y = GRID_ROWS - 1 - rowIndex;

              return Array.from({ length: GRID_COLS }, (_, x) => {
                const cell = cells.get(`${x},${y}`);

                return (
                  <button
                    key={`${x},${y}`}
                    title={`${x},${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className="border border-white/50 transition hover:ring-2 hover:ring-inset hover:ring-slate-400"
                    style={{
                      backgroundColor: cell
                        ? cellColor(cell, productCategory(cell.productId ?? -1))
                        : "#FBFCFA",
                    }}
                  />
                );
              });
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
