import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";

import { useAuth } from "@/providers/AuthProvider";
import { getProductsByCategory } from "@/services/productService";
import { getStores } from "@/services/routingService";
import { useAuthenticatedApi } from "@/services/useAuthenticatedApi";
import { ProductsByCategory, StoreSummary } from "@findr/types";

interface CatalogContextValue {
  productsByCategory: ProductsByCategory;
  productsLoading: boolean;
  productsError: boolean;
  reloadProducts: () => Promise<void>;
  stores: StoreSummary[];
  storesLoading: boolean;
  storesError: boolean;
  storeSelectionLoading: boolean;
  selectedStoreId: number | null;
  selectedStore: StoreSummary | null;
  selectStore: (storeId: number) => void;
  reloadStores: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);
const STORE_STORAGE_KEY_PREFIX = "selectedStoreId";

function getStoreStorageKey(userId: string) {
  return `${STORE_STORAGE_KEY_PREFIX}.${userId}`;
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const api = useAuthenticatedApi();
  const { user } = useAuth();
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>({});
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [productsError, setProductsError] = useState(false);
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storesLoaded, setStoresLoaded] = useState(false);
  const [storesError, setStoresError] = useState(false);
  const [storeSelectionLoading, setStoreSelectionLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      setProductsError(false);
      setProductsByCategory(await getProductsByCategory(api));
      setProductsLoaded(true);
    } catch {
      setProductsError(true);
    } finally {
      setProductsLoading(false);
    }
  }, [api]);

  const loadStores = useCallback(async () => {
    try {
      setStoresLoading(true);
      setStoresError(false);
      const nextStores = await getStores(api);
      setStores(nextStores);
      setStoresLoaded(true);

      if (selectedStoreId !== null && !nextStores.some((store) => store.id === selectedStoreId)) {
        setSelectedStoreId(null);

        if (user?.id) {
          void SecureStore.deleteItemAsync(getStoreStorageKey(user.id)).catch(() => undefined);
        }
      }
    } catch {
      setStoresError(true);
    } finally {
      setStoresLoading(false);
    }
  }, [api, selectedStoreId, user]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!user) {
        setSelectedStoreId(null);
        setStoreSelectionLoading(false);
        return;
      }

      try {
        setStoreSelectionLoading(true);
        const storedStoreId = await SecureStore.getItemAsync(getStoreStorageKey(user.id));
        const parsedStoreId = storedStoreId ? Number(storedStoreId) : null;
        setSelectedStoreId(Number.isFinite(parsedStoreId) ? parsedStoreId : null);
      } finally {
        setStoreSelectionLoading(false);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [user]);

  useEffect(() => {
    if (!user || productsLoaded || productsLoading || productsError) {
      return;
    }

    const timeout = setTimeout(() => {
      void loadProducts();
    }, 0);

    return () => clearTimeout(timeout);
  }, [loadProducts, productsError, productsLoaded, productsLoading, user]);

  useEffect(() => {
    if (!user || storesLoaded || storesLoading || storesError) {
      return;
    }

    const timeout = setTimeout(() => {
      void loadStores();
    }, 0);

    return () => clearTimeout(timeout);
  }, [loadStores, storesError, storesLoaded, storesLoading, user]);

  const selectStore = useCallback(
    (storeId: number) => {
      setSelectedStoreId(storeId);

      if (user?.id) {
        void SecureStore.setItemAsync(getStoreStorageKey(user.id), String(storeId)).catch(
          () => undefined
        );
      }
    },
    [user]
  );

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId) ?? null,
    [selectedStoreId, stores]
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      productsByCategory,
      productsLoading,
      productsError,
      reloadProducts: loadProducts,
      stores,
      storesLoading,
      storesError,
      storeSelectionLoading,
      selectedStoreId,
      selectedStore,
      selectStore,
      reloadStores: loadStores,
    }),
    [
      loadProducts,
      loadStores,
      productsByCategory,
      productsError,
      productsLoading,
      selectedStore,
      selectedStoreId,
      selectStore,
      storeSelectionLoading,
      stores,
      storesError,
      storesLoading,
    ]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);

  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }

  return context;
}
