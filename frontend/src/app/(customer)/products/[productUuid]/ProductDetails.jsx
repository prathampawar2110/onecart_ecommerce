"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  ShoppingCart,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Banknote,
  Minus,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { getProductById } from "@/services/productService";
import { getProductImages } from "@/utils/productImages";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishListContext";
import { useRouter } from "next/navigation";

export default function ProductDetails({ productUuid }) {
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const data = await getProductById(productUuid);
        if (data) {
          setProduct(data);
          const images = getProductImages(data);
          setActiveImage(images[0] || data.image_url || null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    if (productUuid) {
      fetchProduct();
    }
  }, [productUuid]);

  function triggerToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3200);
  }

  function handleWishlist() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      triggerToast("warning", "Please login to manage your wishlist.");
      return;
    }

    if (isInWishlist(product.productUuid)) {
      removeFromWishlist(product.productUuid);
      triggerToast("info", "Removed from wishlist.");
    } else {
      addToWishlist(product);
      triggerToast("success", "Added to your wishlist!");
    }
  }

  function handleVariantChange(variantName, option) {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: option,
    }));
  }

  function getSelectedVariantPrice() {
    if (!product) return 0;
    const variantPrices = product.variantPrices || {};
    const variants = product.variants || {};
    const variantNames = Object.keys(variants);

    if (Object.keys(variantPrices).length === 0) {
      return product.price;
    }

    const allSelected = variantNames.every(
      (variantName) => selectedVariants[variantName]
    );

    if (!allSelected) {
      return product.price;
    }

    const priceKey = variantNames
      .map((variantName) => `${variantName}=${selectedVariants[variantName]}`)
      .join("|");

    return variantPrices[priceKey] ?? product.price;
  }

  function handleAddToCart() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      triggerToast("warning", "Please sign in to add items to your cart.");
      return;
    }

    const variantNames = Object.keys(product.variants || {});
    for (const variantName of variantNames) {
      if (!selectedVariants[variantName]) {
        triggerToast("warning", `Please select a ${variantName} option.`);
        return;
      }
    }

    addToCart(
      {
        ...product,
        productUuid: product.productUuid,
        selectedVariants,
      },
      quantity
    );

    triggerToast(
      "success",
      `Added ${quantity} ${quantity === 1 ? "unit" : "units"} to your cart!`
    );
  }

  // Skeleton loading view
  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 animate-shimmer">
        <div className="h-4 w-48 bg-slate-200 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="w-full aspect-square bg-slate-200 rounded-2xl" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-slate-200 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-slate-200 rounded-md w-3/4" />
            <div className="h-4 bg-slate-200 rounded-md w-1/4" />
            <div className="h-10 bg-slate-200 rounded-md w-1/3" />
            <div className="h-24 bg-slate-200 rounded-xl w-full" />
            <div className="h-12 bg-slate-200 rounded-xl w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const productImages = getProductImages(product);
  const currentPrice = Number(getSelectedVariantPrice() || 0);
  const originalPrice = Math.round(currentPrice * 1.25);
  const isOutOfStock = Number(product.stock || 0) <= 0;
  const isLowStock = Number(product.stock || 0) > 0 && Number(product.stock) <= 15;
  const isFavorited = isInWishlist(product.productUuid);

  return (
    <section className="min-h-full py-6 sm:py-8 md:py-10">
      {/* Toast Feedback */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold backdrop-blur-md ${
              toast.type === "success"
                ? "bg-emerald-50/95 border-emerald-300 text-emerald-800"
                : toast.type === "warning"
                  ? "bg-amber-50/95 border-amber-300 text-amber-800"
                  : "bg-slate-900/95 border-slate-700 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <p className="flex-1">{toast.text}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Breadcrumb Navigation */}
        {/* <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide py-1">
          <Link href="/" className="hover:text-blue-600 transition shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          {product.category && (
            <>
              <Link
                href={`/search?category=${encodeURIComponent(product.category)}`}
                className="hover:text-blue-600 transition shrink-0"
              >
                {product.category}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            </>
          )}
          <span className="text-slate-900 font-semibold truncate shrink-0 max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </nav> */}

        {/* Main Grid: Gallery & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
          {/* LEFT: IMAGE GALLERY */}
          <div className="flex flex-col gap-4">
            {/* Main Image Display */}
            <div className="relative w-full aspect-square bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 flex items-center justify-center overflow-hidden group">
              {activeImage && (
                <Image
                  key={activeImage}
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                />
              )}

              {/* Wishlist Quick Toggle on image */}
              <button
                type="button"
                onClick={handleWishlist}
                aria-label="Toggle Wishlist"
                className={`absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isFavorited
                    ? "bg-rose-300 text-rose-600 ring-2 ring-rose-200"
                    : "bg-white/90 backdrop-blur-xs text-slate-500 hover:text-rose-600 hover:bg-white"
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-transform active:scale-125 ${
                    isFavorited ? "fill-rose-600" : ""
                  }`}
                />
              </button>
            </div>

            {/* Thumbnail Carousel */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`relative shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 bg-white overflow-hidden transition cursor-pointer p-1.5 ${
                      activeImage === img
                        ? "border-blue-600 ring-2 ring-blue-100 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT DETAILS */}
          <div className="flex flex-col gap-5">
            {/* Category & Rating Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {product.category && (
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  {product.category}
                </span>
              )}

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />

                  {/* ⭐ NEW: Admin-controlled rating */}
                  <span>{Number(product.rating || 0).toFixed(1)}</span>
                </div>

                {/* ⭐ NEW */}
                <span className="text-xs text-slate-400">rating</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  ₹{currentPrice.toLocaleString("en-IN")}
                </span>
                {currentPrice > 0 && (
                  <>
                    <span className="text-base text-slate-400 line-through">
                      ₹{originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      20% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Inclusive of all taxes. Free shipping on this order.
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  About this item
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variants Picker */}
            {product.variants && Object.keys(product.variants).length > 0 && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {Object.entries(product.variants).map(
                  ([variantName, options]) => (
                    <div key={variantName}>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Select {variantName}:{" "}
                        <span className="text-blue-600 font-semibold normal-case">
                          {selectedVariants[variantName] || "Not selected"}
                        </span>
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {options.map((option) => {
                          const isSelected =
                            selectedVariants[variantName] === option;
                          return (
                            <button
                              key={`${variantName}-${option}`}
                              type="button"
                              onClick={() =>
                                handleVariantChange(variantName, option)
                              }
                              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Stock Level Banner */}
            <div className="flex items-center gap-2 pt-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOutOfStock
                    ? "bg-red-500"
                    : isLowStock
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  isOutOfStock
                    ? "text-red-600"
                    : isLowStock
                      ? "text-amber-700"
                      : "text-emerald-700"
                }`}
              >
                {isOutOfStock
                  ? "Currently Out of Stock"
                  : isLowStock
                    ? `Only ${product.stock} units left in stock — order soon`
                    : "In Stock and Ready to Ship"}
              </span>
            </div>

            {/* as */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm shadow-sm transition-all duration-200 cursor-pointer active:scale-98 ${
                    isOutOfStock
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-blue-400 hover:bg-blue-700 text-white shadow-blue-500/25 hover:shadow-lg"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>

                {/* Wishlist */}
                <button
                  type="button"
                  onClick={handleWishlist}
                  className={`inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm border transition-all duration-200 cursor-pointer ${
                    isFavorited
                      ? "bg-rose-200 border-rose-700 text-rose-600 hover:bg-rose-100"
                      : "bg-white border-slate-700 text-slate-700 hover:bg-rose-400 hover:text-white"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorited ? "fill-rose-500 text-rose-500" : ""
                    }`}
                  />

                  {isFavorited ? "Saved to Wishlist" : "Save to Wishlist"}
                </button>
              </div>
            </div>

            {/* Store Guarantee Cards */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-100">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold">
                  Free Express Shipping
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-100">
                <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold">
                  7 Days Easy Return
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold">1 Year Guarantee</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-100">
                <Banknote className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold">Cash On Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}