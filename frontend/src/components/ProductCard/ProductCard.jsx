import Link from "next/link";
import Image from "next/image";

import { Heart, ShoppingCart } from "lucide-react";

import { useWishlist } from "@/context/WishListContext";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {

  // ==========================================================
  // CART / WISHLIST
  // ==========================================================

  const { wishlistItems, addToWishlist, removeFromWishlist } =
    useWishlist();

  const { addToCart } = useCart();

  // ==========================================================
  // PRODUCT DATA
  // ==========================================================

  const productUuid = product?.productUuid;

  const isOutOfStock = product?.stock <= 0;

  const isFewLeft =
    product?.stock > 0 && product?.stock <= 10;

  const isWishlisted = wishlistItems.some(
    (item) => item.productUuid === productUuid
  );

  // ==========================================================
  // WISHLIST
  // ==========================================================

  function handleWishlist(event) {

    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock) {
      return;
    }

    if (isWishlisted) {

      removeFromWishlist(productUuid);

    } else {

      addToWishlist(product);

    }
  }

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  function handleAddToCart(event) {

    event.preventDefault();
    event.stopPropagation();

    if (isOutOfStock) {
      return;
    }

    addToCart(product);
  }

  // ==========================================================
  // CARD
  // ==========================================================

  return (

    <div
      className="
        group
        w-full
        border
        border-gray-200
        rounded-lg
        shadow-md
        bg-white
        overflow-hidden

        transition-all
        duration-300
        ease-in-out

        hover:-translate-y-1
        hover:shadow-xl

        relative
      "
    >

      <Link
        href={`/products/${productUuid}`}
        className="block"
      >

        {/* ==================================================
            PRODUCT IMAGE
        ================================================== */}

        <div
          className="
            relative
            w-full
            h-52
            sm:h-56
            flex
            items-center
            justify-center
            p-4
          "
        >

          <Image
            src={
              product?.image_url ||
              "/products/default.webp"
            }
            alt={product?.name || "Product"}
            fill
            className="
              object-contain
              p-4

              transition-transform
              duration-300

              group-hover:scale-105
            "
          />

          {/* Wishlist */}

          <button
            type="button"
            aria-label={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            onClick={handleWishlist}
            className="
              absolute
              top-3
              right-3

              w-10
              h-10

              flex
              items-center
              justify-center

              rounded-full

              bg-white
              shadow-md

              text-gray-600

              hover:bg-red-50
              hover:text-red-500

              transition

              z-10
            "
          >

            <Heart
              className="w-5 h-5"
              fill={isWishlisted ? "currentColor" : "none"}
            />

          </button>

        </div>


        {/* ==================================================
            PRODUCT INFORMATION
        ================================================== */}

        <div className="px-4 pb-4">

          {/* Product Name */}

          <h2
            className="
              text-left
              text-gray-800
              font-semibold
              text-base
              sm:text-lg

              line-clamp-2

              min-h-12
            "
          >
            {product?.name}
          </h2>


          {/* Price */}

          <p
            className="
              mt-2

              text-left

              text-lg
              sm:text-xl

              font-bold

              text-blue-700
            "
          >
            ₹{product?.price}
          </p>


          {/* Availability */}

          {isOutOfStock ? (

            <p
              className="
                mt-1
                text-sm
                font-medium
                text-red-600
              "
            >
              Out of stock
            </p>

          ) : isFewLeft ? (

            <p
              className="
                mt-1
                text-sm
                font-medium
                text-orange-600
              "
            >
              Few left
            </p>

          ) : (

            <p
              className="
                mt-1
                text-sm
                font-medium
                text-green-600
              "
            >
              In stock
            </p>

          )}

        </div>

      </Link>


      {/* ====================================================
          ADD TO CART
      ==================================================== */}

      <div className="px-4 pb-4">

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="
            w-full

            min-h-11

            flex
            items-center
            justify-center
            gap-2

            rounded-lg

            px-4
            py-2.5

            font-medium

            transition

            bg-blue-600
            text-white

            hover:bg-blue-700

            disabled:bg-gray-300
            disabled:text-gray-500
            disabled:cursor-not-allowed

            cursor-pointer
          "
        >

          <ShoppingCart className="w-5 h-5" />

          {isOutOfStock
            ? "Out of Stock"
            : "Add to Cart"}

        </button>

      </div>

    </div>
  );
}