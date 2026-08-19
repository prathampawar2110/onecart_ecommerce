"use client";

import Image from "next/image";
import { useWishlist } from "@/context/WishListContext";
import { useCart } from "@/context/CartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

//----------------------------------------------------------------------------------------------------------------------------------

export default function Wishlist() {
  const router = useRouter();

  const { wishlistItems, removeFromWishlist, wishlistLoaded } = useWishlist();

  const { addToCart } = useCart();

  const [cartMessage, setCartMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  // Check whether user is logged in
  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
    }
  }, [router]);

  //----------------------------------------------------------------------------------------------------------------------------------

  // Add Product to Cart

  function handleAddToCart(product) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setCartMessage("Please login first to add product to cart.");

      setTimeout(() => {
        setCartMessage("");
      }, 3000);

      return;
    }

    // Add Product
    addToCart({
      ...product,
      quantity: 1,
    });

    setCartMessage("Product Added to Cart!");

    setTimeout(() => {
      setCartMessage("");
    }, 3000);
  }

  if (!mounted) {
    return null;
  }

  // Wait until wishlist is loaded from localStorage
  if (!wishlistLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-6">
        <h2 className="text-center text-xl text-black">Loading Wishlist...</h2>
      </div>
    );
  }

  //------------------Empty Wishlist-------------------------------------------
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-10 text-center">
          <h1 className="text-3xl font-bold text-black mb-4">My Wishlist ❤️</h1>

          <p className="text-gray-700 text-lg">Your Wishlist is Empty....</p>
        </div>
      </div>
    );
  }

  //----------------------------------------------------------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-10 md:py-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-black mb-5 sm:mb-6  md:mb-8">My Wishlist ❤️</h1>

        {/* Product */}
        <div className="space-y-4  sm:space-y-5">
          {wishlistItems
            .filter((product) => product?.productUuid)
            .map((product) => (
              <div
                key={product.productUuid}
                className="bg-white rounded-xl shadow-md p-4 md:p-5 flex flex-col md:flex-row gap-4 sm:gap-6"
              >
                {/* Product Image */}
                <div className="relative w-full md:w-48 h-40 sm:h-48 shrink-0 bg-gray-50 rounded-xl">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name || "Wishlist product"}
                      fill
                      className="object-contain p-4"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Information */}
                <div className="flex flex-col justify-between flex-1">
                  {/* Name + Price */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-black">
                      {product.name}
                    </h2>

                    <p className="text-lg sm:text-xl font-semibold text-blue-700 mt-2">
                      ₹ {product.price}
                    </p>

                    {/* variant */}
                    {product.selectedVariants &&
                      Object.keys(product.selectedVariants).length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Selected Variant
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {Object.entries(product.selectedVariants).map(
                              ([name, value]) => (
                                <span
                                  key={name}
                                  className="text-sm text-gray-700 border border-black rounded-xl
                                                                        bg-gray-100 px-3 py-1"
                                >
                                  {name} : {value}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Button */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    {/* Add to Cart */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`px-5 py-3 rounded-xl font-semibold transition
                                                        ${
                                                          product.stock <= 0
                                                            ? "bg-gray-300 text-black cursor-not-allowed"
                                                            : "bg-blue-500 text-white hover:bg-blue-800 cursor-pointer"
                                                        }
                                                    `}
                    >
                      {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromWishlist(product.productUuid)}
                      className="px-5 py-3 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-800 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      // Bottom Message
      {cartMessage && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-yellow-100 border
                            border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg font-semibold"
        >
          ⚠️ {cartMessage}
        </div>
      )}
    </div>
  );
}