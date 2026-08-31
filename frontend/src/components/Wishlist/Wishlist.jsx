"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Heart,
  PackageOpen,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishListContext";

export default function Wishlist() {
  const router = useRouter();

  const { wishlistItems, removeFromWishlist, wishlistLoaded } = useWishlist();
  const { addToCart } = useCart();

  const [cartMessage, setCartMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      setMounted(true);
    }

    checkLogin();
  }, [router]);

  function showMessage(message) {
    setCartMessage(message);

    setTimeout(() => {
      setCartMessage("");
    }, 3000);
  }

  function handleAddToCart(product) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      showMessage("Please login first to add product to cart.");
      return;
    }

    addToCart({
      ...product,
      quantity: 1,
    });

    showMessage("Product added to cart.");
  }

  function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  const validWishlistItems = wishlistItems.filter(
    (product) => product?.productUuid,
  );

  if (!mounted || !wishlistLoaded) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-44 rounded bg-slate-200 animate-pulse" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-72 rounded-lg bg-white shadow-sm animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (validWishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <WishlistHeader
            count={0}
            onContinueShopping={() => router.push("/")}
          />

          <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
              <div>
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <PackageOpen className="h-7 w-7" />
                </span>

                <h2 className="mt-5 text-2xl font-bold text-slate-950">
                  Your wishlist is empty
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  Save products you like and come back to them later. Your
                  favorite OneCart picks will appear here.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Discover Products
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-lg bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">
                  Why use wishlist?
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep an eye on products before checkout and move them to cart
                  when you are ready to buy.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <WishlistHeader
          count={validWishlistItems.length}
          onContinueShopping={() => router.push("/")}
        />

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {validWishlistItems.map((product) => {
            const isOutOfStock = Number(product.stock || 0) <= 0;

            return (
              <article
                key={product.productUuid}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className="relative h-56 cursor-pointer bg-slate-50"
                  onClick={() => router.push(`/products/${product.productUuid}`)}
                >
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name || "Wishlist product"}
                      fill
                      className="object-contain p-5"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
                      No Image
                    </div>
                  )}

                  <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-rose-600 shadow-sm">
                    <Heart className="h-4 w-4 fill-current" />
                  </span>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2
                        className="cursor-pointer text-lg font-bold text-slate-950 wrap-break-words hover:text-blue-700"
                        onClick={() =>
                          router.push(`/products/${product.productUuid}`)
                        }
                      >
                        {product.name}
                      </h2>

                      <p className="mt-2 text-xl font-bold text-blue-700">
                        {formatCurrency(product.price)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        isOutOfStock
                          ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      }`}
                    >
                      {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </span>
                  </div>

                  {product.selectedVariants &&
                    Object.keys(product.selectedVariants).length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Object.entries(product.selectedVariants).map(
                          ([name, value]) => (
                            <span
                              key={name}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                            >
                              {name}: {value}
                            </span>
                          ),
                        )}
                      </div>
                    )}

                  <div className="mt-5 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                        isOutOfStock
                          ? "cursor-not-allowed bg-slate-200 text-slate-500"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {isOutOfStock ? "Unavailable" : "Add to Cart"}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.productUuid)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {cartMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800 shadow-lg">
          {cartMessage}
        </div>
      )}
    </div>
  );
}

function WishlistHeader({ count, onContinueShopping }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
          Saved Products
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
          My Wishlist
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          {count === 0
            ? "Products you save will appear here."
            : `${count} product${count === 1 ? "" : "s"} saved for later.`}
        </p>
      </div>

      <button
        type="button"
        onClick={onContinueShopping}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 sm:w-auto"
      >
        <ShoppingBag className="h-4 w-4" />
        Continue Shopping
      </button>
    </header>
  );
}