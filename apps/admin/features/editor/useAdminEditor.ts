"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onIdTokenChanged, signOut } from "firebase/auth";

import {
  authenticate,
  createStore,
  deleteStore,
  getMe,
  getProducts,
  getStore,
  getStores,
  saveLayout,
} from "@/lib/api";
import { firebaseApp } from "@/lib/firebase";
import { paintLayoutCell, parseStoreLayout } from "@/lib/map";
import { productNames } from "@/lib/translations";
import { ApiError } from "@/lib/types";
import type {
  LayoutCell,
  LayoutCellKind as CellKind,
  ProductDto,
  StoreSummary,
} from "@findr/types";

type Tool = CellKind | "ERASE";

interface Status {
  type: "ok" | "error";
  text: string;
}

export function useAdminEditor() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
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
  const [loadingStore, setLoadingStore] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [addingStore, setAddingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");

  const isAdmin = role === "ADMIN";
  const draggingRef = useRef(false);
  const storeIdRef = useRef<number | null>(null);
  const startToolRef = useRef<Tool | null>(null);
  const startProductRef = useRef<ProductDto | null>(null);

  useEffect(() => {
    storeIdRef.current = storeId;
  }, [storeId]);

  useEffect(() => {
    function handlePointerUp() {
      draggingRef.current = false;
    }

    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, []);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    return onIdTokenChanged(auth, (firebaseUser) => {
      const nextSignedIn = firebaseUser !== null;
      setSignedIn(nextSignedIn);
      setAuthReady(true);

      if (!nextSignedIn) {
        setRole(null);
        setStores([]);
        setStoreId(null);
        setCells(new Map());
        setProducts({});
        setDirty(false);
        setStatus(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!signedIn) return;

    let cancelled = false;
    async function loadAdminData() {
      try {
        const me = await getMe();
        if (cancelled) return;

        setRole(me.role);
        if (me.role !== "ADMIN") {
          router.replace("/403");
          return;
        }

        const [storeList, productMap] = await Promise.all([getStores(), getProducts()]);
        if (cancelled) return;

        setStores(storeList);
        setProducts(productMap);
        setStoreId((current) => current ?? storeList[0]?.id ?? null);
      } catch (error) {
        if (cancelled) return;
        setAuthError(error instanceof ApiError ? error.message : "Failed to load admin data.");
        await signOut(getAuth(firebaseApp));
      }
    }

    void loadAdminData();
    return () => {
      cancelled = true;
    };
  }, [signedIn, router]);

  useEffect(() => {
    if (storeId === null || !isAdmin) return;

    const selectedStoreId = storeId;
    const controller = new AbortController();
    async function loadSelectedStore() {
      await Promise.resolve();
      if (controller.signal.aborted) return;

      setLoadingStore(true);
      setCells(new Map());
      try {
        const store = await getStore(selectedStoreId, controller.signal);
        if (controller.signal.aborted) return;
        setCells(parseStoreLayout(store));
        setDirty(false);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus({
          type: "error",
          text: error instanceof ApiError ? error.message : "Failed to load store map.",
        });
      } finally {
        if (!controller.signal.aborted) setLoadingStore(false);
      }
    }

    void loadSelectedStore();
    return () => controller.abort();
  }, [storeId, isAdmin]);

  useEffect(() => {
    function warnAboutUnsavedChanges(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warnAboutUnsavedChanges);
    return () => window.removeEventListener("beforeunload", warnAboutUnsavedChanges);
  }, [dirty]);

  const productList = useMemo(() => {
    const flat = Object.values(products).flat();
    const query = search.trim().toLowerCase();
    if (!query) return flat;

    return flat.filter((product) => {
      const displayName = (productNames[product.nameKey] ?? product.name).toLowerCase();
      return displayName.includes(query);
    });
  }, [products, search]);

  const productCategory = useCallback(
    (productId: number) => {
      for (const list of Object.values(products)) {
        const found = list.find((product) => product.productId === productId);
        if (found) return found.categoryKey;
      }
      return undefined;
    },
    [products],
  );

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError(null);

    try {
      await authenticate(email, password);
      setPassword("");
    } catch (error) {
      const code = (error as { code?: unknown } | null)?.code;
      if (code === "auth/invalid-credential" || code === "auth/user-not-found" || code === "auth/wrong-password") {
        setAuthError("Incorrect email or password.");
      } else if (code === "auth/too-many-requests") {
        setAuthError("Too many attempts. Please try again later.");
      } else {
        setAuthError("Login failed. Check your connection and try again.");
      }
    } finally {
      setAuthBusy(false);
    }
  }

  function confirmDiscardChanges(action: string): boolean {
    return !dirty || window.confirm(`You have unsaved layout changes. Discard them and ${action}?`);
  }

  function handleStoreChange(nextStoreId: number) {
    if (saving || loadingStore || nextStoreId === storeId) return;
    if (!confirmDiscardChanges("switch stores")) return;

    setDirty(false);
    setStatus(null);
    setStoreId(nextStoreId);
  }

  function handleLogout() {
    if (!confirmDiscardChanges("sign out")) return;
    void signOut(getAuth(firebaseApp));
  }

  async function handleCreateStore() {
    const trimmed = newStoreName.trim();
    if (!trimmed || !confirmDiscardChanges("create a new store")) return;

    try {
      const created = await createStore(trimmed);
      setStores((previous) => [...previous, created].sort((a, b) => a.id - b.id));
      setDirty(false);
      setStoreId(created.id);
      setAddingStore(false);
      setNewStoreName("");
      setStatus({ type: "ok", text: `Store "${trimmed}" created.` });
    } catch (error) {
      setStatus({ type: "error", text: adminOnly(error) });
    }
  }

  async function handleDeleteStore() {
    if (storeId === null || saving || loadingStore) return;

    const selectedStore = stores.find((store) => store.id === storeId);
    const label = selectedStore?.name ?? `#${storeId}`;
    if (!window.confirm(`Permanently delete store "${label}" and its entire layout?`)) return;

    try {
      await deleteStore(storeId);
      const remaining = stores.filter((store) => store.id !== storeId);
      setStores(remaining);
      setDirty(false);
      setCells(new Map());
      setStoreId(remaining[0]?.id ?? null);
      setStatus({ type: "ok", text: `Store "${label}" deleted.` });
    } catch (error) {
      setStatus({ type: "error", text: adminOnly(error) });
    }
  }

  function paintCell(x: number, y: number) {
    const activeTool = startToolRef.current;
    const activeProduct = startProductRef.current;
    if (!activeTool) return;

    setCells((previous) => paintLayoutCell(
      previous,
      x,
      y,
      activeTool,
      activeProduct?.productId,
    ));
    setDirty(true);
  }

  function handleCellPointerDown(x: number, y: number) {
    if (!tool || loadingStore || saving) return;

    draggingRef.current = true;
    startToolRef.current = tool;
    startProductRef.current = selectedProduct;
    paintCell(x, y);
  }

  function handleCellPointerEnter(x: number, y: number) {
    if (!draggingRef.current) return;
    paintCell(x, y);
  }

  function selectTool(nextTool: Tool | null) {
    setTool(nextTool);
    if (nextTool !== "PRODUCT") setSelectedProduct(null);
  }

  function adminOnly(error: unknown): string {
    if (error instanceof ApiError && error.status === 403) return "Admin access required.";
    return error instanceof ApiError ? error.message : "Operation failed.";
  }

  async function handleSave() {
    if (storeId === null || loadingStore || !dirty) return;

    const savedStoreId = storeId;
    setSaving(true);
    setStatus(null);
    try {
      await saveLayout(savedStoreId, [...cells.values()]);
      if (storeIdRef.current === savedStoreId) setDirty(false);
      setStatus({ type: "ok", text: "Layout saved and pathfinding cache refreshed." });
    } catch (error) {
      setStatus({ type: "error", text: adminOnly(error) });
    } finally {
      setSaving(false);
    }
  }

  async function handleReload() {
    if (storeId === null || loadingStore || saving) return;
    if (!confirmDiscardChanges("reload from the server")) return;

    const reloadedStoreId = storeId;
    setLoadingStore(true);
    setStatus(null);
    try {
      const store = await getStore(reloadedStoreId);
      if (storeIdRef.current !== reloadedStoreId) return;
      setCells(parseStoreLayout(store));
      setDirty(false);
      setStatus({ type: "ok", text: "Layout reloaded from server." });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof ApiError ? error.message : "Reload failed.",
      });
    } finally {
      setLoadingStore(false);
    }
  }

  return {
    addingStore,
    authBusy,
    authError,
    authReady,
    cells,
    dirty,
    email,
    handleCellPointerDown,
    handleCellPointerEnter,
    handleCreateStore,
    handleDeleteStore,
    handleLogin,
    handleLogout,
    handleReload,
    handleSave,
    handleStoreChange,
    isAdmin,
    loadingStore,
    newStoreName,
    password,
    productCategory,
    productList,
    role,
    saving,
    search,
    selectTool,
    selectedProduct,
    setAddingStore,
    setEmail,
    setNewStoreName,
    setPassword,
    setSearch,
    setSelectedProduct,
    signedIn,
    status,
    storeId,
    stores,
    tool,
  };
}
