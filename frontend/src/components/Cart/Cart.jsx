"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Minus,
  PackageOpen,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const router = useRouter();

  const [checkingLogin, setCheckingLogin] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartMessage, setCartMessage] = useState("");

  function getItemKey(item) {
    return `${item.productUuid}-${JSON.stringify(item.selectedVariants || {})}`;
  }

  useEffect(() => {
    async function checkLogin() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      setCheckingLogin(false);
    }

    checkLogin();
  }, [router]);

  function showMessage(message) {
    setCartMessage(message);

    setTimeout(() => {
      setCartMessage("");
    }, 3000);
  }

  const validSelectedItems = selectedItems.filter((key) =>
    cartItems.some((item) => getItemKey(item) === key),
  );

  function toggleItemSelection(item) {
    const itemKey = getItemKey(item);

    setSelectedItems((previousSelected) => {
      if (previousSelected.includes(itemKey)) {
        return previousSelected.filter((key) => key !== itemKey);
      }

      return [...previousSelected, itemKey];
    });
  }

  function toggleSelectAll() {
    if (validSelectedItems.length === cartItems.length) {
      setSelectedItems([]);
      return;
    }

    setSelectedItems(cartItems.map((item) => getItemKey(item)));
  }

  function increaseQuantity(item) {
    if (item.quantity < 4) {
      updateQuantity(
        item.productUuid,
        item.quantity + 1,
        item.selectedVariants || {},
      );

      showMessage("Cart quantity updated.");
    }
  }

  function decreaseQuantity(item) {
    if (item.quantity > 1) {
      updateQuantity(
        item.productUuid,
        item.quantity - 1,
        item.selectedVariants || {},
      );

      showMessage("Cart quantity updated.");
    }
  }

  async function handleRemove(item) {
    const itemKey = getItemKey(item);

    await removeFromCart(item.productUuid, item.selectedVariants || {});

    setSelectedItems((previousSelected) =>
      previousSelected.filter((key) => key !== itemKey),
    );

    showMessage("Product removed from cart.");
  }

  const selectedCartItems = cartItems.filter((item) =>
    validSelectedItems.includes(getItemKey(item)),
  );

  const totalAmount = selectedCartItems.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const totalQuantity = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  function handlePlaceOrder() {
    if (selectedCartItems.length === 0) {
      showMessage("Please select at least one product.");
      return;
    }

    sessionStorage.setItem("checkoutItems", JSON.stringify(selectedCartItems));
    router.push("/checkout");
  }

  function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  if (checkingLogin) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-36 rounded bg-slate-200 animate-pulse" />
          <div className="mt-6 h-64 rounded-lg bg-white shadow-sm animate-pulse" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <CartHeader
            itemCount={0}
            totalQuantity={0}
            onContinueShopping={() => router.push("/")}
          />

          <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
              <div className="flex flex-col items-start">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <PackageOpen className="h-7 w-7" />
                </span>

                <h2 className="mt-5 text-2xl font-bold text-slate-950">
                  Your cart is empty
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  Looks like you have not added anything yet. Explore OneCart
                  and pick the products you want to checkout.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="rounded-lg bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-950">
                  Shopping tip
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add products to cart first, then select only the items you
                  want to buy now before checkout.
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
        <CartHeader
          itemCount={cartItems.length}
          totalQuantity={totalQuantity}
          onContinueShopping={() => router.push("/")}
        />

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <main className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Cart Items
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Select the products you want to checkout.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:w-auto"
                >
                  <Check className="h-4 w-4" />
                  {validSelectedItems.length === cartItems.length
                    ? "Unselect All"
                    : "Select All"}
                </button>
              </div>
            </section>

            {cartItems.map((item) => {
              const itemKey = getItemKey(item);
              const isSelected = validSelectedItems.includes(itemKey);
              const lineTotal =
                Number(item.price || 0) * Number(item.quantity || 0);

              return (
                <article
                  key={itemKey}
                  className={`rounded-lg border bg-white p-4 shadow-sm transition sm:p-5 ${
                    isSelected
                      ? "border-blue-500 ring-4 ring-blue-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="grid gap-4 md:grid-cols-[auto_8rem_minmax(0,1fr)]">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(item)}
                        className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600"
                        aria-label={`Select ${item.name}`}
                      />
                    </div>

                    <div className="relative h-32 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 md:h-32 md:w-32">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-contain p-3"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-slate-950 wrap-break-words">
                            {item.name}
                          </h3>

                          <p className="mt-2 text-sm font-semibold text-blue-700">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        <p className="text-lg font-bold text-slate-950">
                          {formatCurrency(lineTotal)}
                        </p>
                      </div>

                      {item.selectedVariants &&
                        Object.keys(item.selectedVariants).length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {Object.entries(item.selectedVariants).map(
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

                      <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Quantity
                          </p>

                          <div className="mt-2 inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
                            <QuantityButton
                              label="Decrease quantity"
                              disabled={item.quantity <= 1}
                              onClick={() => decreaseQuantity(item)}
                            >
                              <Minus className="h-4 w-4" />
                            </QuantityButton>

                            <span className="min-w-10 text-center text-sm font-bold text-slate-950">
                              {item.quantity}
                            </span>

                            <QuantityButton
                              label="Increase quantity"
                              disabled={item.quantity >= 4}
                              onClick={() => increaseQuantity(item)}
                            >
                              <Plus className="h-4 w-4" />
                            </QuantityButton>
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            Maximum 4 per item
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </main>

          <aside className="lg:sticky lg:top-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Order Summary
              </h2>

              <div className="mt-5 space-y-4">
                <SummaryRow label="Cart total" value={formatCurrency(cartTotal)} />
                <SummaryRow
                  label="Selected items"
                  value={`${selectedCartItems.length}`}
                />
                <SummaryRow
                  label="Selected total"
                  value={formatCurrency(totalAmount)}
                  strong
                />
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={selectedCartItems.length === 0}
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${
                  selectedCartItems.length === 0
                    ? "cursor-not-allowed bg-slate-200 text-slate-500"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                You can checkout selected items now and keep the rest in your
                cart.
              </p>
            </section>
          </aside>
        </div>
      </div>

      {cartMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800 shadow-lg">
          {cartMessage}
        </div>
      )}
    </div>
  );
}

function CartHeader({ itemCount, totalQuantity, onContinueShopping }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          Shopping Cart
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
          My Cart
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          {itemCount === 0
            ? "Your saved products will appear here."
            : `${itemCount} item type${itemCount === 1 ? "" : "s"} and ${totalQuantity} total unit${totalQuantity === 1 ? "" : "s"} in cart.`}
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

function QuantityButton({ children, disabled, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className={strong ? "font-bold text-slate-950" : "text-sm text-slate-500"}>
        {label}
      </p>
      <p
        className={
          strong
            ? "text-xl font-bold text-slate-950"
            : "text-sm font-semibold text-slate-700"
        }
      >
        {value}
      </p>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { useCart } from "@/context/CartContext";

// export default function Cart() {
//   const { cartItems, removeFromCart, updateQuantity } = useCart();

//   const router = useRouter();

//   // --------------------------------------------------
//   // Login checking
//   // --------------------------------------------------

//   const [checkingLogin, setCheckingLogin] = useState(true);

//   // ⭐ CHANGED
//   // Store selected cart item keys
//   const [selectedItems, setSelectedItems] = useState([]);

//   // ⭐ CHANGED
//   // Bottom message
//   const [cartMessage, setCartMessage] = useState("");

//   // --------------------------------------------------
//   // Create unique key for each cart item
//   // --------------------------------------------------

//   // ⭐ CHANGED
//   // Product UUID alone is not enough because
//   // same product can exist with different variants.

//   function getItemKey(item) {
//     return `${item.productUuid}-${JSON.stringify(item.selectedVariants || {})}`;
//   }

//   // --------------------------------------------------
//   // Check Login
//   // --------------------------------------------------

//   useEffect(() => {
//     const token = localStorage.getItem("access_token");

//     if (!token) {
//       router.push("/login");

//       return;
//     }

//     setCheckingLogin(false);
//   }, [router]);

//   // --------------------------------------------------
//   // Keep selected items valid
//   // --------------------------------------------------

//   // ⭐ CHANGED
//   // If a product is removed from cart,
//   // remove its key from selectedItems also.

//   useEffect(() => {
//     setSelectedItems((previousSelected) =>
//       previousSelected.filter((key) =>
//         cartItems.some((item) => getItemKey(item) === key),
//       ),
//     );
//   }, [cartItems]);

//   // --------------------------------------------------
//   // Show Bottom Message
//   // --------------------------------------------------

//   function showMessage(message) {
//     setCartMessage(message);

//     setTimeout(() => {
//       setCartMessage("");
//     }, 3000);
//   }

//   // --------------------------------------------------
//   // Select / Unselect Product
//   // --------------------------------------------------

//   // ⭐ CHANGED

//   function toggleItemSelection(item) {
//     const itemKey = getItemKey(item);

//     setSelectedItems((previousSelected) => {
//       if (previousSelected.includes(itemKey)) {
//         return previousSelected.filter((key) => key !== itemKey);
//       }

//       return [...previousSelected, itemKey];
//     });
//   }

//   // --------------------------------------------------
//   // Select All Products
//   // --------------------------------------------------

//   // ⭐ CHANGED

//   function toggleSelectAll() {
//     if (selectedItems.length === cartItems.length) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems(cartItems.map((item) => getItemKey(item)));
//     }
//   }

//   // --------------------------------------------------
//   // Increase Quantity
//   // --------------------------------------------------

//   function increaseQuantity(item) {
//     if (item.quantity < 4) {
//       updateQuantity(
//         item.productUuid,
//         item.quantity + 1,
//         item.selectedVariants || {},
//       );

//       showMessage("Cart quantity updated successfully.");
//     }
//   }

//   // --------------------------------------------------
//   // Decrease Quantity
//   // --------------------------------------------------

//   function decreaseQuantity(item) {
//     if (item.quantity > 1) {
//       updateQuantity(
//         item.productUuid,
//         item.quantity - 1,
//         item.selectedVariants || {},
//       );

//       showMessage("Cart quantity updated successfully.");
//     }
//   }

//   // --------------------------------------------------
//   // Remove Product
//   // --------------------------------------------------

//   // ⭐ CHANGED
//   // Removes only the selected product + selected variants.

//   async function handleRemove(item) {
//     const itemKey = getItemKey(item);

//     await removeFromCart(item.productUuid, item.selectedVariants || {});

//     // Remove from selected items
//     setSelectedItems((previousSelected) =>
//       previousSelected.filter((key) => key !== itemKey),
//     );

//     showMessage("Product removed from cart.");
//   }

//   // --------------------------------------------------
//   // Selected Products
//   // --------------------------------------------------

//   // ⭐ CHANGED

//   const selectedCartItems = cartItems.filter((item) =>
//     selectedItems.includes(getItemKey(item)),
//   );

//   // --------------------------------------------------
//   // Calculate Total Amount
//   // --------------------------------------------------

//   // ⭐ CHANGED
//   // Total is now calculated ONLY for selected products.

//   const totalAmount = selectedCartItems.reduce(
//     (total, item) => total + item.price * item.quantity,
//     0,
//   );

//   // --------------------------------------------------
//   // Place Order
//   // --------------------------------------------------

//   // ⭐ CHANGED

//   function handlePlaceOrder() {
//     if (selectedCartItems.length === 0) {
//       showMessage("Please select at least one product.");

//       return;
//     }

//     // Store selected products temporarily
//     // so Checkout page can access them.

//     sessionStorage.setItem("checkoutItems", JSON.stringify(selectedCartItems));

//     router.push("/checkout");
//   }

//   // --------------------------------------------------
//   // Loading
//   // --------------------------------------------------

//   if (checkingLogin) {
//     return (
//       <div className="flex justify-center items-center min-h-[50vh]">
//         <p className="text-lg text-gray-600">Checking login...</p>
//       </div>
//     );
//   }

//   // --------------------------------------------------
//   // Empty Cart
//   // --------------------------------------------------

//   if (cartItems.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-100 px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-12">
//         <div className="max-w-5xl mx-auto">
//           <h1
//             className="
//             text-2xl
//             sm:text-3xl
//             font-bold
//             text-black
//             mb-6
//             sm:mb-8
//           "
//           >
//             My Cart
//           </h1>

//           <div
//             className="
//             bg-white
//             rounded-xl
//             shadow-lg
//             p-6
//             sm:p-8
//             md:p-10
//             text-center
//           "
//           >
//             <p
//               className="
//               text-lg
//               sm:text-xl
//               text-gray-600
//             "
//             >
//               Your cart is empty.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // --------------------------------------------------
//   // Cart UI
//   // --------------------------------------------------

//   return (
//     <div
//       className="
//       min-h-screen
//       bg-gray-100
//       px-3
//       sm:px-4
//       md:px-6
//       py-6
//       sm:py-8
//       md:py-10
//     "
//     >
//       <div
//         className="
//         max-w-5xl
//         mx-auto
//       "
//       >
//         {/* ------------------------------------------------ */}
//         {/* Heading */}
//         {/* ------------------------------------------------ */}

//         <div
//           className="
//           flex
//           flex-col
//           sm:flex-row
//           sm:items-center
//           sm:justify-between
//           gap-4
//           mb-5
//           sm:mb-6
//           md:mb-8
//         "
//         >
//           <h1
//             className="
//             text-2xl
//             sm:text-3xl
//             font-bold
//             text-black
//           "
//           >
//             My Cart
//           </h1>

//           {/* ⭐ CHANGED */}
//           {/* Select All */}

//           <button
//             type="button"
//             onClick={toggleSelectAll}
//             className="
//               text-blue-600
//               font-semibold
//               hover:text-blue-800
//               cursor-pointer
//             "
//           >
//             {selectedItems.length === cartItems.length
//               ? "Unselect All"
//               : "Select All"}
//           </button>
//         </div>

//         {/* ------------------------------------------------ */}
//         {/* Cart Products */}
//         {/* ------------------------------------------------ */}

//         <div className="space-y-5">
//           {cartItems.map((item) => {
//             const itemKey = getItemKey(item);

//             const isSelected = selectedItems.includes(itemKey);

//             return (
//               <div
//                 key={itemKey}
//                 className={`
//                   bg-white
//                   rounded-xl
//                   shadow-md
//                   p-5
//                   flex
//                   flex-col
//                   md:flex-row
//                   gap-6
//                   border-2
//                   transition

//                   ${isSelected ? "border-blue-500" : "border-transparent"}
//                 `}
//               >
//                 {/* ---------------------------------------- */}
//                 {/* Checkbox */}
//                 {/* ---------------------------------------- */}

//                 {/* ⭐ CHANGED */}

//                 <div
//                   className="
//                   flex
//                   items-start
//                   pt-2
//                 "
//                 >
//                   <input
//                     type="checkbox"
//                     checked={isSelected}
//                     onChange={() => toggleItemSelection(item)}
//                     className="
//                       w-5
//                       h-5
//                       cursor-pointer
//                     "
//                   />
//                 </div>

//                 {/* ---------------------------------------- */}
//                 {/* Product Image */}
//                 {/* ---------------------------------------- */}

//                 <div
//                   className="
//                   relative
//                   w-full
//                   md:w-40
//                   h-40
//                   shrink-0
//                   bg-gray-50
//                   rounded-lg
//                 "
//                 >
//                   <Image
//                     src={item.image_url}
//                     alt={item.name}
//                     fill
//                     className="object-contain p-3"
//                   />
//                 </div>

//                 {/* ---------------------------------------- */}
//                 {/* Product Information */}
//                 {/* ---------------------------------------- */}

//                 <div
//                   className="
//                   flex
//                   flex-col
//                   justify-between
//                   flex-1
//                 "
//                 >
//                   {/* Product Name + Price */}

//                   <div>
//                     <h2
//                       className="
//                       text-xl
//                       font-bold
//                       text-gray-800
//                     "
//                     >
//                       {item.name}
//                     </h2>

//                     <p
//                       className="
//                       text-lg
//                       font-semibold
//                       text-blue-600
//                       mt-2
//                     "
//                     >
//                       ₹ {item.price}
//                     </p>

//                     {/* -------------------------------- */}
//                     {/* Selected Variants */}
//                     {/* -------------------------------- */}

//                     {item.selectedVariants &&
//                       Object.keys(item.selectedVariants).length > 0 && (
//                         <div className="mt-4">
//                           <p
//                             className="
//                             text-sm
//                             font-semibold
//                             text-gray-700
//                             mb-2
//                           "
//                           >
//                             Selected Options
//                           </p>

//                           <div
//                             className="
//                             flex
//                             flex-wrap
//                             gap-2
//                           "
//                           >
//                             {Object.entries(item.selectedVariants).map(
//                               ([name, value]) => (
//                                 <span
//                                   key={name}
//                                   className="
//                                     px-3
//                                     py-1
//                                     bg-gray-100
//                                     border
//                                     border-gray-300
//                                     rounded-md
//                                     text-sm
//                                     text-gray-700
//                                   "
//                                 >
//                                   {name}: {value}
//                                 </span>
//                               ),
//                             )}
//                           </div>
//                         </div>
//                       )}
//                   </div>

//                   {/* -------------------------------- */}
//                   {/* Quantity + Remove */}
//                   {/* -------------------------------- */}

//                   <div
//                     className="
//                     flex
//                     flex-wrap
//                     items-center
//                     justify-between
//                     gap-4
//                     mt-6
//                   "
//                   >
//                     {/* Quantity */}

//                     <div>
//                       <p
//                         className="
//                         text-sm
//                         text-gray-500
//                         mb-2
//                       "
//                       >
//                         Quantity
//                       </p>

//                       <div
//                         className="
//                         flex
//                         items-center
//                         gap-3
//                       "
//                       >
//                         {/* Minus */}

//                         <button
//                           type="button"
//                           onClick={() => decreaseQuantity(item)}
//                           disabled={item.quantity <= 1}
//                           className="
//                             w-9
//                             h-9
//                             rounded-md
//                             bg-gray-200
//                             text-black
//                             text-xl
//                             font-bold
//                             hover:bg-gray-300
//                             disabled:opacity-40
//                             disabled:cursor-not-allowed
//                             cursor-pointer
//                           "
//                         >
//                           -
//                         </button>

//                         {/* Quantity */}

//                         <span
//                           className="
//                           min-w-8
//                           text-center
//                           text-lg
//                           font-semibold
//                           text-black
//                         "
//                         >
//                           {item.quantity}
//                         </span>

//                         {/* Plus */}

//                         <button
//                           type="button"
//                           onClick={() => increaseQuantity(item)}
//                           disabled={item.quantity >= 4}
//                           className="
//                             w-9
//                             h-9
//                             rounded-md
//                             bg-gray-200
//                             text-black
//                             text-xl
//                             font-bold
//                             hover:bg-gray-300
//                             disabled:opacity-40
//                             disabled:cursor-not-allowed
//                             cursor-pointer
//                           "
//                         >
//                           +
//                         </button>
//                       </div>

//                       <p
//                         className="
//                         text-xs
//                         text-gray-500
//                         mt-1
//                       "
//                       >
//                         Maximum 4
//                       </p>
//                     </div>

//                     {/* -------------------------------- */}
//                     {/* Remove Button */}
//                     {/* -------------------------------- */}

//                     <button
//                       type="button"
//                       onClick={() => handleRemove(item)}
//                       className="
//                         text-red-600
//                         font-semibold
//                         hover:text-red-800
//                         cursor-pointer
//                       "
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* ------------------------------------------------ */}
//         {/* Total Amount + Place Order */}
//         {/* ------------------------------------------------ */}

//         <div
//           className="
//           bg-white
//           rounded-xl
//           shadow-lg
//           mt-8
//           p-6
//           flex
//           flex-col
//           md:flex-row
//           items-center
//           justify-between
//           gap-5
//         "
//         >
//           {/* Total Amount - LEFT */}

//           <div>
//             <p
//               className="
//               text-gray-500
//               text-sm
//             "
//             >
//               Selected Products Total
//             </p>

//             <p
//               className="
//               text-3xl
//               font-bold
//               text-gray-800
//             "
//             >
//               ₹ {totalAmount}
//             </p>

//             {/* ⭐ CHANGED */}

//             <p
//               className="
//               text-sm
//               text-gray-500
//               mt-1
//             "
//             >
//               {selectedCartItems.length} product
//               {selectedCartItems.length !== 1 ? "s" : ""} selected
//             </p>
//           </div>

//           {/* Place Order - RIGHT */}

//           <button
//             type="button"
//             onClick={handlePlaceOrder}
//             disabled={selectedCartItems.length === 0}
//             className={`
//               px-8
//               py-3
//               rounded-lg
//               font-semibold
//               transition

//               ${
//                 selectedCartItems.length === 0
//                   ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                   : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
//               }
//             `}
//           >
//             Place Order
//           </button>
//         </div>
//       </div>

//       {/* ------------------------------------------------ */}
//       {/* Bottom Message */}
//       {/* ------------------------------------------------ */}

//       {/* ⭐ CHANGED */}

//       {cartMessage && (
//         <div
//           className="
//           fixed
//           bottom-6
//           left-1/2
//           -translate-x-1/2
//           z-50
//           bg-yellow-100
//           border
//           border-yellow-400
//           text-yellow-800
//           px-6
//           py-3
//           rounded-lg
//           shadow-lg
//           font-semibold
//         "
//         >
//           ⚠️ {cartMessage}
//         </div>
//       )}
//     </div>
//   );
// }