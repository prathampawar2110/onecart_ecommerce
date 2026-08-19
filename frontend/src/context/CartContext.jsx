"use client";

import { createContext, useContext, useState, useEffect } from "react"; // ⭐ CHANGED

// ⭐ CHANGED — import cart API functions
import {
  getCart,
  addToCart as addToCartAPI,
  updateCartQuantity,
  removeFromCart as removeFromCartAPI,
} from "@/services/cartService";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // ⭐ CHANGED — loading state
  const [loading, setLoading] = useState(false);

  // ⭐ CHANGED — Load cart from backend
  async function loadCart() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);

      const data = await getCart();

      setCartItems(data.items || []);
    } catch (error) {
      console.error("Failed to load cart:", error);

      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }

  // ⭐ CHANGED — Load backend cart when user opens the application
  useEffect(() => {
    loadCart();
  }, []);

  // --------------------------------------------------
  // Clear Cart
  // --------------------------------------------------

  function clearCart() {
    setCartItems([]);
  }

  // --------------------------------------------------
  // Add Product To Cart
  // --------------------------------------------------

  async function addToCart(product, quantity = 1) {
    // ⭐ CHANGED — async

    const selectedVariants = product.selectedVariants || {}; // ⭐ CHANGED

    // ⭐ CHANGED — check existing cart item
    const existingProduct = cartItems.find((item) => {
      const sameProduct = item.productUuid === product.productUuid;

      const sameVariants =
        JSON.stringify(item.selectedVariants || {}) ===
        JSON.stringify(selectedVariants);

      return sameProduct && sameVariants;
    });

    // ⭐ CHANGED — quantity validation moved before API call
    if (existingProduct) {
      const newQuantity = existingProduct.quantity + quantity;

      if (newQuantity > 4) {
        return;
      }
    } else {
      if (quantity > 4) {
        quantity = 4;
      }
    }

    try {
      // ⭐ CHANGED — call backend API
      await addToCartAPI(product.productUuid, quantity, selectedVariants);

      // ⭐ CHANGED — refresh cart from backend
      await loadCart();
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  }

  // --------------------------------------------------
  // Remove Product
  // --------------------------------------------------

  async function removeFromCart(productUuid, selectedVariants = {}) {
    // ⭐ CHANGED — async
    try {
      // ⭐ CHANGED — call backend DELETE API
      await removeFromCartAPI(productUuid, selectedVariants);

      // ⭐ CHANGED
      await loadCart();
    } catch (error) {
      console.error("Failed to remove product from cart:", error);
    }
  }

  // --------------------------------------------------
  // Remove Selected Items From Cart
  // --------------------------------------------------

  async function removeSelectedItems(items) {
    try {
      for (const item of items) {
        await removeFromCartAPI(item.productUuid, item.selectedVariants || {});
      }

      // Refresh cart from backend
      await loadCart();
    } catch (error) {
      console.error("Failed to remove selected items:", error);
    }
  }

  // --------------------------------------------------
  // Update Quantity
  // --------------------------------------------------

  async function updateQuantity(productUuid, quantity, selectedVariants = {}) {
    // ⭐ CHANGED — async
    if (quantity < 1 || quantity > 4) {
      return;
    }

    try {
      // ⭐ CHANGED — call backend PUT API
      await updateCartQuantity(productUuid, quantity, selectedVariants);

      // ⭐ CHANGED
      await loadCart();
    } catch (error) {
      console.error("Failed to update cart quantity:", error);
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        removeSelectedItems,
        updateQuantity,
        clearCart,

        loading, // ⭐ CHANGED
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}