"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  getWishlist,
  addToWishlist as addWishlistAPI,
  removeFromWishlist as removeWishlistAPI,
} from "@/services/wishlistServices";

const WishListContext = createContext();

export function WishlistProvider({ children }) {

  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);

  // ------------------------------------------------------------------
  // Load Wishlist From Backend
  // ------------------------------------------------------------------

  async function loadWishlist() {

    const token = localStorage.getItem("access_token");

    // No logged-in user
    if (!token) {

      setWishlistItems([]);
      setWishlistLoaded(true);

      return;
    }

    try {

      setWishlistLoaded(false);

      const data = await getWishlist();

      console.log("Wishlist From Backend:", data);
      console.log("Wishlist Products:", data.products);

      // Backend returns complete product objects
      setWishlistItems(data.products || []);

    } catch (error) {

      console.error("Error loading wishlist:", error);

      setWishlistItems([]);

    } finally {

      setWishlistLoaded(true);

    }
  }

  // ------------------------------------------------------------------
  // Load Wishlist + Listen For Login / Logout
  // ------------------------------------------------------------------

  useEffect(() => {

    // Load wishlist when application starts
    loadWishlist();

    // Listen for authentication changes
    function handleAuthChange() {

      loadWishlist();

    }

    window.addEventListener("auth-change", handleAuthChange);

    return () => {

      window.removeEventListener(
        "auth-change",
        handleAuthChange
      );

    };

  }, []);

  // ------------------------------------------------------------------
  // Add Product To Wishlist
  // ------------------------------------------------------------------

  async function addToWishlist(product) {

    const token = localStorage.getItem("access_token");

    if (!token) {

      return;

    }

    try {

      const exists = wishlistItems.some(
        (item) =>
          item.productUuid === product.productUuid
      );

      if (exists) {

        return;

      }

      await addWishlistAPI(product.productUuid);

      setWishlistItems((previousItems) => [
        ...previousItems,
        product,
      ]);

    } catch (error) {

      console.error(
        "Error adding product to wishlist:",
        error
      );

    }
  }

  // ------------------------------------------------------------------
  // Remove Product From Wishlist
  // ------------------------------------------------------------------

  async function removeFromWishlist(productUuid) {

    try {

      await removeWishlistAPI(productUuid);

      setWishlistItems((previousItems) =>
        previousItems.filter(
          (item) =>
            item.productUuid !== productUuid
        )
      );

    } catch (error) {

      console.error(
        "Error removing product from wishlist:",
        error
      );

    }
  }

  // ------------------------------------------------------------------
  // Check Product
  // ------------------------------------------------------------------

  function isInWishlist(productUuid) {

    return wishlistItems.some(
      (item) =>
        item.productUuid === productUuid
    );

  }

  //----------------------------------------------------------------------

  function handleLogout () {
    localStorage.removeItem("access_token")
    window.dispatchEvent(new Event("auth-change"));
  }

  // ------------------------------------------------------------------

  return (

    <WishListContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistLoaded,
        handleLogout,
      }}
    >

      {children}

    </WishListContext.Provider>

  );
}

// ------------------------------------------------------------------

export function useWishlist() {

  return useContext(WishListContext);

}