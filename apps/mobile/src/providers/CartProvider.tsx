import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

import { Product } from "@/types/domain";

interface CartContextValue {
  cart: Product[];
  cartCount: number;
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Product[]>([]);

  const addProduct = useCallback((product: Product) => {
    setCart((currentCart) => {
      if (currentCart.some((item) => item.productId === product.productId)) {
        return currentCart;
      }

      return [...currentCart, product];
    });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setCart((currentCart) => currentCart.filter((product) => product.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const isInCart = useCallback(
    (productId: string) => cart.some((product) => product.productId === productId),
    [cart]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      cartCount: cart.length,
      addProduct,
      removeProduct,
      clearCart,
      isInCart,
    }),
    [addProduct, cart, clearCart, isInCart, removeProduct]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
