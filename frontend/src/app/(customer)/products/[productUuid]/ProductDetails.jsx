"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

  const [loginWarning, setLoginWarning] = useState(false);
  const [wishlistWarning, setWishlistWarning] = useState(false);

  const [cartSuccess, setCartSuccess] = useState(false);
  const [wishlistSuccess, setWishlistSuccess] = useState(false);

  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  // ============================================================
  // FETCH PRODUCT
  // ============================================================

  useEffect(() => {
    async function fetchProduct() {
      try {
        // console.log("UUID RECEIVED BY PRODUCT DETAILS:", productUuid);

        const data = await getProductById(productUuid);

        // console.log("FULL PRODUCT RESPONSE:", JSON.stringify(data, null, 2));

        if (!data) {
          console.error("Product UUID missing from response:", data);
          return;
        }

        setProduct(data);
        setActiveImage(getProductImages(data)[0] || null);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    }

    if (productUuid) {
      fetchProduct();
    }
  }, [productUuid]);

  // ============================================================
  // LOADING
  // ============================================================

  if (!product) {
    return (
      <h2 className="text-center text-xl mt-10 text-black">
        Loading Product...
      </h2>
    );
  }

  // ============================================================
  // WISHLIST
  // ============================================================

  function handleWishlist() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setWishlistWarning(true);

      setTimeout(() => {
        setWishlistWarning(false);
      }, 3000);

      return;
    }

    if (isInWishlist(product.productUuid)) {
      removeFromWishlist(product.productUuid);
      return;
    }

    addToWishlist(product);

    setWishlistSuccess(true);

    setTimeout(() => {
      setWishlistSuccess(false);
    }, 3000);
  }

  // ============================================================
  // VARIANT CHANGE
  // ============================================================

  function handleVariantChange(variantName, option) {
    setSelectedVariants((previous) => ({
      ...previous,
      [variantName]: option,
    }));
  }

  // ============================================================
  // GET SELECTED VARIANT PRICE
  // ============================================================

  function getSelectedVariantPrice() {
    const variantPrices = product.variantPrices || {};
    const variants = product.variants || {};

    const variantNames = Object.keys(variants);

    // No variant pricing
    if (Object.keys(variantPrices).length === 0) {
      return product.price;
    }

    // Check whether all variants are selected
    const allSelected = variantNames.every(
      (variantName) => selectedVariants[variantName]
    );

    if (!allSelected) {
      return product.price;
    }

    const priceKey = variantNames
      .map(
        (variantName) =>
          `${variantName}=${selectedVariants[variantName]}`
      )
      .join("|");

    // console.log("PRICE KEY:", priceKey);
    // console.log("PRICE:", variantPrices[priceKey]);

    return variantPrices[priceKey] ?? product.price;
  }

  // ============================================================
  // ADD TO CART
  // ============================================================

  function handleAddToCart() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoginWarning(true);

      setTimeout(() => {
        setLoginWarning(false);
      }, 3000);

      return;
    }

    const variantNames = Object.keys(product.variants || {});

    for (const variantName of variantNames) {
      if (!selectedVariants[variantName]) {
        alert(`Please select ${variantName}`);
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

    setCartSuccess(true);

    setTimeout(() => {
      setCartSuccess(false);
    }, 3000);
  }

  // ============================================================
  // UI
  // ============================================================

  const productImages = getProductImages(product);

  return (
    <section className="min-h-full flex items-center px-3 sm:px-5 md:px-8 lg:px-10 py-5 sm:py-7 md:py-10">

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">

        {/* PRODUCT IMAGE GALLERY */}

        <div className="flex flex-col gap-3">

          {/* Main image */}
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[420px] bg-white rounded-xl shadow-lg p-4 sm:p-5">
            {activeImage && (
              <Image
                key={activeImage}
                src={activeImage}
                alt={product.name}
                fill
                className="object-contain"
              />
            )}
          </div>

          {/* Thumbnails — only shown when there are multiple images */}
          {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {productImages.map((img, index) => (
                  <button
                    key={`${img}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`
                      relative shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-lg border-2 bg-white overflow-hidden transition
                      ${activeImage === img
                        ? "border-blue-500 shadow-md"
                        : "border-slate-200 hover:border-blue-300"
                      }
                    `}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

        </div>

        {/* PRODUCT DETAILS */}

        <div className="flex flex-col justify-center gap-3 sm:gap-4">

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black">
            {product.name}
          </h1>

          <p className="text-gray-600 mt-2 sm:mt-4">
            <span className="font-semibold">
              Category:
            </span>{" "}
            {product.category}
          </p>

          <p className="text-gray-600 mt-2 sm:mt-4">
            <span className="font-semibold">
              Description:
            </span>{" "}
            {product.description}
          </p>

          {/* PRICE */}

          <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2 sm:mt-4">
            ₹ {getSelectedVariantPrice()}
          </h2>

          {/* VARIANTS */}

          {product.variants &&
            Object.keys(product.variants).length > 0 && (

              <div className="mt-6 space-y-5">

                {Object.entries(product.variants).map(
                  ([variantName, options]) => (

                    <div key={variantName}>

                      <h3 className="font-semibold text-lg text-gray-800 mb-3">
                        {variantName}
                      </h3>

                      <div className="flex flex-wrap gap-3">

                        {options.map((option) => (

                          <button
                            key={`${variantName}-${option}`}
                            type="button"
                            onClick={() =>
                              handleVariantChange(
                                variantName,
                                option
                              )
                            }
                            className={`
                              px-4
                              py-2
                              rounded-lg
                              border
                              font-medium
                              transition
                              cursor-pointer

                              ${
                                selectedVariants[
                                  variantName
                                ] === option
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                              }
                            `}
                          >
                            {option}
                          </button>

                        ))}

                      </div>

                    </div>

                  )
                )}

              </div>
            )}

          {/* STOCK */}

          <div className="mt-5 mb-2">

            {product.stock <= 0 ? (

              <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full">
                ❌ Out Of Stock
              </span>

            ) : product.stock <= 15 ? (

              <span className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full">
                ⚠️ Only Few Left
              </span>

            ) : (

              <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
                ✅ Available
              </span>

            )}

          </div>

          {/* BUTTONS */}

          <div className="flex gap-4">

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`
                mt-1
                px-6
                py-3
                rounded-lg
                ${
                  product.stock <= 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-800 cursor-pointer"
                }
              `}
            >
              {product.stock <= 0
                ? "Out of Stock"
                : "Add To Cart"}
            </button>

            <button
              onClick={handleWishlist}
              disabled={product.stock <= 0}
              className={`
                mt-1
                px-6
                py-3
                rounded-lg
                ${
                  product.stock <= 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-800 cursor-pointer"
                }
              `}
            >
              {product.stock <= 0
                ? "Not Available"
                : "Wishlist"}
            </button>

          </div>

        </div>
      </div>

      {/* ======================================================
          WARNINGS / SUCCESS MESSAGES
      ====================================================== */}

      {loginWarning && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg font-semibold">
          ⚠️ Please login first to use Add to Cart.
        </div>
      )}

      {wishlistWarning && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg font-semibold">
          ⚠️ Please login first to use Add to Wishlist.
        </div>
      )}

      {cartSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-800 px-6 py-3 rounded-lg shadow-lg font-semibold">
          ✅ Product added to cart successfully.
        </div>
      )}

      {wishlistSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-800 px-6 py-3 rounded-lg shadow-lg font-semibold">
          ❤️ Product added to wishlist successfully.
        </div>
      )}

    </section>
  );
}