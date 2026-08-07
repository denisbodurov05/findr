import { useCallback, useEffect, useState } from "react";

import { useCart } from "@/providers/CartProvider";
import { useCatalog } from "@/providers/CatalogProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { getPath, getStoreMap } from "@/services/routingService";
import { useAuthenticatedApi } from "@/services/useAuthenticatedApi";
import { PathfindResult, StoreMap } from "@findr/types";
import { getErrorMessage } from "@/utils/errors";

export function useRoutePlan() {
  const api = useAuthenticatedApi();
  const { cart } = useCart();
  const { selectedStoreId } = useCatalog();
  const { t } = useTranslation();
  const [storeMap, setStoreMap] = useState<StoreMap | null>(null);
  const [path, setPath] = useState<PathfindResult | null>(null);
  const [loading, setLoading] = useState(cart.length > 0);
  const [error, setError] = useState<string | null>(null);

  const loadRoutePlan = useCallback(async () => {
    if (cart.length === 0) {
      setLoading(false);
      setStoreMap(null);
      setPath(null);
      return;
    }

    if (selectedStoreId === null) {
      setLoading(false);
      setStoreMap(null);
      setPath(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const productIds = cart.map((product) => product.productId);
      const [nextPath, nextStoreMap] = await Promise.all([
        getPath(api, productIds, selectedStoreId),
        getStoreMap(api, selectedStoreId),
      ]);

      setPath(nextPath);
      setStoreMap(nextStoreMap);
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("map.loadError")));
    } finally {
      setLoading(false);
    }
  }, [api, cart, selectedStoreId, t]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadRoutePlan();
    }, 0);

    return () => clearTimeout(timeout);
  }, [loadRoutePlan]);

  return {
    storeMap,
    path,
    loading,
    error,
    reload: loadRoutePlan,
  };
}
