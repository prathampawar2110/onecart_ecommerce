"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getProductById } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishListContext";
import { useRouter } from "next/navigation";

//-----------------------------------------------------------------------------------------------------------------------------------------

export default function ProductDetails({ productUuid }) {
  const router = useRouter();

  const [product, setProduct] = useState(null);

  const { addToCart } = useCart();

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Selected variants
  const [selectedVariants, setSelectedVariants] = useState({});

  // For warning effect
  const [loginWarning, setLoginWarning] = useState(false);
  const [wishlistWarning, setWishlistWarning] = useState(false);

  // for botton message
  const [cartSuccess, setCartSuccess] = useState(false);
  const [wishlistSuccess, setWishlistSuccess] = useState(false);

  const [quantity, setQuantity] = useState(1);

  // Fetch product
  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProductById(productUuid);

        console.log("PRODUCT DETAILS:", data);
        console.log("VARIANTS:", data.variants);
        console.log("variantPrices:", data.variantPrices);
        console.log("variant_prices:", data.variant_prices);

        if (!data.product_uuid) {
          console.error("Invalid product response:", data);
          return;
        }

        setProduct(data);

      } catch (error) {
        console.log("Error fetching product:", error);
      }
    }

    if (productUuid) {
      fetchProduct();
    }
  }, [productUuid]);

  // --------------------------------------------------Loading-----------------------------------------------------------------------------
  if (!product) {
    return <h2 className="text-center text-xl mt-10 text-black">Loading Product...</h2>;
  }

  // --------------------------------------------------Function-----------------------------------------------------------------------------

  function handleWishlist() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setWishlistWarning(true);

      setTimeout(() => {
        setWishlistWarning(false);
      }, 3000);
      return;
    }

    // if already in wishlist -> remove
    if (isInWishlist(product.product_uuid)) {
      removeFromWishlist(product.product_uuid);
      return;
    }

    //otherwise -> add
    addToWishlist(product);

    //show success message
    setWishlistSuccess(true);

    setTimeout(() => {
      setWishlistSuccess(false);
    }, 3000);
    return;
  }

  function handleVariantChange(variantName, option) {
    setSelectedVariants({
      ...selectedVariants,
      [variantName]: option,
    });
  }

  function getSelectedVariantPrice() {
    const variantPrices = product.variantPrices || {};
    const variants = product.variants || {};

    const variantNames = Object.keys(variants);

    // No variant pricing
    if (Object.keys(variantPrices).length === 0) {
      return product.price;
    }

    // Check if every variant has been selected
    const allSelected = variantNames.every(
      (variantName) => selectedVariants[variantName],
    );

    // Not all variants selected
    if (!allSelected) {
      return product.price;
    }

    // Create price key
    const priceKey = variantNames
      .map((variantName) => `${variantName}=${selectedVariants[variantName]}`)
      .join("|");

    console.log("SELECTED VARIANTS:", selectedVariants);
    console.log("PRICE KEY:", priceKey);
    console.log("PRICE:", variantPrices[priceKey]);

    return variantPrices[priceKey] ?? product.price;
  }

  // Add To Cart
  function handleAddToCart() {
    // check whether user is logged in
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoginWarning(true);

      // to remove warning automatically after 5 sec
      setTimeout(() => {
        setLoginWarning(false);
      }, 3000);
      return;
    }

    // Get variant
    const variantNames = Object.keys(product.variants || {});

    // Check whether every variant is selected
    for (const variantName of variantNames) {
      if (!selectedVariants[variantName]) {
        alert(`Please select ${variantName}`);

        return;
      }
    }

    // Add product + selected variants
    addToCart(
      {
        ...product,
        selectedVariants: selectedVariants,
      },
      quantity,
    );

    //show success message
    setCartSuccess(true);

    setTimeout(() => {
      setCartSuccess(false);
    }, 3000);
  }

  //--------------------------------------------------------------------------------------------------------------------------------------

  return (
    <section className="min-h-full flex items-center px-3 sm:px-5 md:px-8 lg:px-10 py-5 sm:py-7 md:py-10">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
        {/* ------------------------------------------------ */}
        {/* Product Image */}
        {/* ------------------------------------------------ */}

        <div
          className="
                    relative
                    h-64
                    sm:h-80
                    md:h-96
                    lg:h-100
                    bg-white
                    rounded-xl
                    shadow-lg
                    p-4
                    sm:p-5
                "
        >
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>

        {/* ------------------------------------------------ */}
        {/* Product Details */}
        {/* ------------------------------------------------ */}

        <div className="flex flex-col justify-center gap-3 sm:gap-4">
          {/* Product Name */}

          <h1
            className="
                        text-2xl
                        sm:text-3xl
                        md:text-4xl
                        font-bold
                        text-black
                    "
          >
            {product.name}
          </h1>

          {/* Category */}

          <p className="text-gray-600 mt-2 sm:mt-4 md:mt-5 text-sm sm:text-base">
            <span className="font-semibold">Category :</span> {product.category}
          </p>

          {/* Description */}

          <p className="text-gray-600 mt-2 sm:mt-4 md:mt-5 text-sm sm:text-base ">
            <span className="font-semibold">Description :</span>{" "}
            {product.description}
          </p>

          {/* Price */}

          <h2
            className="
                        text-2xl
                        sm:text-3xl
                        font-bold
                        text-blue-600
                        mt-2
                        sm:mt-4
                        md:mt-5
                    "
          >
            ₹ {getSelectedVariantPrice()}
          </h2>

          {/* ------------------------------------------------ */}
          {/* Variants */}
          {/* ------------------------------------------------ */}

          {product.variants && Object.keys(product.variants).length > 0 && (
            <div className="mt-6 space-y-5">
              {Object.entries(product.variants).map(
                ([variantName, options]) => (
                  <div key={variantName}>
                    {/* Variant Name */}

                    <h3
                      className="
                                        font-semibold
                                        text-lg
                                        text-gray-800
                                        mb-3
                                    "
                    >
                      {variantName}
                    </h3>

                    {/* Variant Options */}

                    <div
                      className="
                                        flex
                                        flex-wrap
                                        gap-3
                                    "
                    >
                      {options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            handleVariantChange(variantName, option)
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
                ),
              )}
            </div>
          )}

          {/* ------------------------------------------------ */}
          {/* Stock Status */}
          {/* ------------------------------------------------ */}

          <div className="mt-5 mb-2">
            {product.stock <= 0 ? (
              <span
                className="
                                    bg-red-100
                                    text-red-700
                                    px-4
                                    py-2
                                    rounded-full
                                "
              >
                ❌ Out Of Stock
              </span>
            ) : product.stock <= 15 ? (
              <span
                className="
                                    bg-yellow-100
                                    text-yellow-700
                                    px-4
                                    py-2
                                    rounded-full
                                "
              >
                ⚠️ Only Few Left
              </span>
            ) : (
              <span
                className="
                                    bg-green-100
                                    text-green-700
                                    px-4
                                    py-2
                                    rounded-full
                                "
              >
                ✅ Available
              </span>
            )}
          </div>

          {/* ------------------------------------------------ */}
          {/* Buttons */}
          {/* ------------------------------------------------ */}

          <div className="flex gap-4">

            {/* Add To Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={` mt-1
                                px-6
                                py-3
                                rounded-lg
                                hover:bg-blue-800

                                ${
                                  product.stock <= 0
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-500 text-white cursor-pointer"
                                }
                            `}
            >
              {product.stock <= 0 ? "Out of Stock" : "Add To Cart"}
            </button>

            {/* Wishlist */}

            <button
              onClick={handleWishlist}
              disabled={product.stock <= 0}
              className={` mt-1
                                px-6
                                py-3
                                rounded-lg
                                hover:bg-red-800

                                ${
                                  product.stock <= 0
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-red-500 text-white cursor-pointer"
                                }
                            `}
            >
              {product.stock <= 0 ? "Not Available" : "Wishlist"}
            </button>
          </div>
        </div>
      </div>


      {/* ------------------------------------------------ */}
      {/* Message/Warning to display */}
      {/* ------------------------------------------------ */}

      {/* Wishlist Login Warning */}

      {loginWarning && (
        <div
          className="
        fixed
        bottom-6
        left-1/2
        -translate-x-1/2
        z-50
        bg-yellow-100
        border
        border-yellow-400
        text-yellow-800
        px-6
        py-3
        rounded-lg
        shadow-lg
        font-semibold

        flex
        items-center
        gap-2

         whitespace-nowrap
    "
        >
          <span>⚠️</span>

          <span>Please login first to use Add to Cart.</span>
        </div>
      )}

      {wishlistWarning && (
        <div
          className="
        fixed
        bottom-6
        left-1/2
        -translate-x-1/2
        z-50

        bg-yellow-100
        border
        border-yellow-400
        text-yellow-800
        px-6
        py-3

        rounded-lg
        shadow-lg

        font-semibold
        flex
        items-center
        gap-2

         whitespace-nowrap
    "
        >
          <span>⚠️</span>

          <span>Please login first to use Add to Wishlist.</span>
        </div>
      )}

      {/* Cart Success Message */}

      {cartSuccess && (
        <div
          className="
            fixed
            bottom-6
            left-1/2
            -translate-x-1/2
            z-50

            bg-green-100
            border
            border-green-400
            text-green-800

            px-6
            py-3

            rounded-lg

            shadow-lg

            font-semibold

            flex
            items-center
            gap-2

            whitespace-nowrap
          "
        >
          <span>✅</span>

          <span>Product added to cart successfully.</span>
        </div>
      )}

      {/* Wishlist Success Message */}
      {wishlistSuccess && (
        <div
          className="
      fixed
      bottom-6
      left-1/2
      -translate-x-1/2
      z-50

      bg-green-100
      border
      border-green-400
      text-green-800

      px-6
      py-3

      rounded-lg

      shadow-lg

      font-semibold

      flex
      items-center
      gap-2

      whitespace-nowrap
    "
        >
          <span>❤️</span>

          <span>Product added to wishlist successfully.</span>
        </div>
      )}
    </section>
  );
}