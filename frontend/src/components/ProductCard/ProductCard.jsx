// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { Heart, ShoppingCart, Star } from "lucide-react";
// import { useWishlist } from "@/context/WishListContext";
// import { useCart } from "@/context/CartContext";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function ProductCard({ product }) {
//   const productUuid = product?.productUuid || product?._id;

//   const router = useRouter();

//   const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
//   const { addToCart } = useCart();

//   const [toastMessage, setToastMessage] = useState("");

//   if (!productUuid) {
//     return null;
//   }

//   const isFavorited = isInWishlist(productUuid);

//   const isOutOfStock = Number(product.stock || 0) <= 0;

//   const isLowStock =
//     Number(product.stock || 0) > 0 && Number(product.stock) <= 15;

//   const price = Number(product.price || 0);

//   const originalPrice = Math.round(price * 1.25);

//   // Show toast message
//   function showToast(msg) {
//     setToastMessage(msg);

//     setTimeout(() => {
//       setToastMessage("");
//     }, 2500);
//   }

//   // Wishlist handler
//   function handleToggleWishlist(e) {
//     e.preventDefault();
//     e.stopPropagation();

//     const token = localStorage.getItem("access_token");

//     if (!token) {
//       router.push("/login");
//       return;
//     }

//     if (isFavorited) {
//       removeFromWishlist(productUuid);
//       showToast("Removed from wishlist");
//     } else {
//       addToWishlist({
//         ...product,
//         productUuid,
//       });

//       showToast("Added to wishlist");
//     }
//   }

//   // Add to cart handler
//   function handleQuickAction(e) {
//     e.preventDefault();
//     e.stopPropagation();

//     const token = localStorage.getItem("access_token");

//     if (!token) {
//       router.push("/login");
//       return;
//     }

//     addToCart(
//       {
//         ...product,
//         productUuid,
//         selectedVariants: {},
//       },
//       1
//     );

//     showToast("Added to cart");
//   }

//   return (
//     <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">

//       {/* Toast Notification */}
//       {toastMessage && (
//         <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-xs animate-in fade-in zoom-in duration-150 whitespace-nowrap pointer-events-none">
//           {toastMessage}
//         </div>
//       )}

//       {/* Card Header Media */}
//       <Link
//         href={`/products/${productUuid}`}
//         className="relative w-full aspect-square bg-slate-50 flex items-center justify-center p-5 overflow-hidden"
//       >
//         <Image
//           src={product.image_url || "/products/default.webp"}
//           alt={product.name || "Product"}
//           fill
//           sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
//           className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-108"
//         />

//         {/* Category Badge */}
//         {product.category && (
//           <span className="absolute left-3 top-3 z-10 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
//             {product.category}
//           </span>
//         )}

//         {/* Wishlist Heart Button */}
//         <button
//           type="button"
//           onClick={handleToggleWishlist}
//           aria-label={
//             isFavorited
//               ? "Remove from wishlist"
//               : "Add to wishlist"
//           }
//           className={`absolute right-3 top-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer ${
//             isFavorited
//               ? "bg-rose-50 text-rose-600 ring-2 ring-rose-200"
//               : "bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-500 hover:bg-white"
//           }`}
//         >
//           <Heart
//             className={`w-4 h-4 transition-transform active:scale-125 ${
//               isFavorited
//                 ? "fill-rose-500 text-rose-500"
//                 : ""
//             }`}
//           />
//         </button>

//         {/* Stock Badge Overlay */}
//         {isOutOfStock ? (
//           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-10">
//             <span className="bg-red-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
//               Out of Stock
//             </span>
//           </div>
//         ) : isLowStock ? (
//           <span className="absolute bottom-2 left-3 z-10 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
//             Only {product.stock} left!
//           </span>
//         ) : null}
//       </Link>

//       {/* Card Body Details */}
//       <div className="flex flex-col flex-1 p-4 sm:p-5">

//         {/* Rating and Reviews */}
//         <div className="flex items-center gap-1 mb-2">
//           <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md text-[11px] font-bold">
//             <Star className="w-3 h-3 fill-amber-400 text-amber-400" />

//             {/* Admin-controlled rating */}
//             <span>
//               {Number(product.rating || 0).toFixed(1)}
//             </span>
//           </div>
//         </div>

//         {/* Product Title */}
//         <Link
//           href={`/products/${productUuid}`}
//           className="group/title"
//         >
//           <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 min-h-10 group-hover/title:text-blue-600 transition-colors duration-200">
//             {product.name}
//           </h3>
//         </Link>

//         {/* Price Row */}
//         <div className="mt-3 flex items-baseline gap-2">
//           <span className="text-lg sm:text-xl font-extrabold text-slate-900">
//             ₹{price.toLocaleString("en-IN")}
//           </span>

//           {price > 0 && (
//             <>
//               <span className="text-xs text-slate-400 line-through">
//                 ₹{originalPrice.toLocaleString("en-IN")}
//               </span>

//               <span className="text-[11px] font-bold text-emerald-600">
//                 20% off
//               </span>
//             </>
//           )}
//         </div>

//         {/* Action Button */}
//         <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
//           {isOutOfStock ? (
//             <button
//               type="button"
//               disabled
//               className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
//             >
//               Sold Out
//             </button>
//           ) : (
//             <button
//               type="button"
//               onClick={handleQuickAction}
//               className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-200 active:scale-98 cursor-pointer"
//             >
//               <ShoppingCart className="w-3.5 h-3.5" />
//               Add to Cart
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";

import { useWishlist } from "@/context/WishListContext";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductCard({ product }) {
  const productUuid = product?.productUuid || product?._id;

  const router = useRouter();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const [toastMessage, setToastMessage] = useState("");

  // If product ID is missing, don't render the card
  if (!productUuid) {
    return null;
  }

  // Wishlist status
  const isFavorited = isInWishlist(productUuid);

  // Stock status
  const isOutOfStock = Number(product.stock || 0) <= 0;

  const isLowStock =
    Number(product.stock || 0) > 0 &&
    Number(product.stock) <= 15;

  // Price
  const price = Number(product.price || 0);

  // Simulated original price for discount display
  const originalPrice = Math.round(price * 1.25);

  // Show toast message
  function showToast(msg) {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  }

  // Wishlist handler
  function handleToggleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("access_token");

    // Redirect to login if user is not logged in
    if (!token) {
      router.push("/login");
      return;
    }

    // Remove from wishlist
    if (isFavorited) {
      removeFromWishlist(productUuid);
      showToast("Removed from wishlist");
    }

    // Add to wishlist
    else {
      addToWishlist({
        ...product,
        productUuid,
      });

      showToast("Added to wishlist");
    }
  }

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">

      {/* =====================================================
          Toast Notification
      ===================================================== */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-xs animate-in fade-in zoom-in duration-150 whitespace-nowrap pointer-events-none">
          {toastMessage}
        </div>
      )}

      {/* =====================================================
          Product Image Section
      ===================================================== */}
      <Link
        href={`/products/${productUuid}`}
        className="relative w-full aspect-square bg-slate-50 flex items-center justify-center p-5 overflow-hidden"
      >
        <Image
          src={
            product.image_url || "/products/default.webp"
          }
          alt={product.name || "Product"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-108"
        />

        {/* =====================================================
            Category Badge
        ===================================================== */}
        {product.category && (
          <span className="absolute left-3 top-3 z-10 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
            {product.category}
          </span>
        )}

        {/* =====================================================
            Wishlist Button
        ===================================================== */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={
            isFavorited
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className={`absolute right-3 top-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer ${
            isFavorited
              ? "bg-rose-50 text-rose-600 ring-2 ring-rose-200"
              : "bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-500 hover:bg-white"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isFavorited
                ? "fill-rose-500 text-rose-500"
                : ""
            }`}
          />
        </button>

        {/* =====================================================
            Stock Badge
        ===================================================== */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-red-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
              Out of Stock
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-2 left-3 z-10 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
            Only {product.stock} left!
          </span>
        ) : null}
      </Link>

      {/* =====================================================
          Product Details
      ===================================================== */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">

        {/* ===================================================
            Rating
        =================================================== */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md text-[11px] font-bold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />

            {/* Admin-controlled rating */}
            <span>
              {Number(product.rating || 0).toFixed(1)}
            </span>
          </div>
        </div>

        {/* ===================================================
            Product Name
        =================================================== */}
        <Link
          href={`/products/${productUuid}`}
          className="group/title"
        >
          <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 min-h-10 group-hover/title:text-blue-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* ===================================================
            Price
        =================================================== */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg sm:text-xl font-extrabold text-slate-900">
            ₹{price.toLocaleString("en-IN")}
          </span>

          {price > 0 && (
            <>
              <span className="text-xs text-slate-400 line-through">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>

              <span className="text-[11px] font-bold text-emerald-600">
                20% off
              </span>
            </>
          )}
        </div>

        {/* ===================================================
            View Product Button
        =================================================== */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <Link
            href={`/products/${productUuid}`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-200"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
}