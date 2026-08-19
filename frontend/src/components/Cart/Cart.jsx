"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const router = useRouter();

  // --------------------------------------------------
  // Login checking
  // --------------------------------------------------

  const [checkingLogin, setCheckingLogin] = useState(true);

  // ⭐ CHANGED
  // Store selected cart item keys
  const [selectedItems, setSelectedItems] = useState([]);

  // ⭐ CHANGED
  // Bottom message
  const [cartMessage, setCartMessage] = useState("");

  // --------------------------------------------------
  // Create unique key for each cart item
  // --------------------------------------------------

  // ⭐ CHANGED
  // Product UUID alone is not enough because
  // same product can exist with different variants.

  function getItemKey(item) {
    return `${item.productUuid}-${JSON.stringify(item.selectedVariants || {})}`;
  }

  // --------------------------------------------------
  // Check Login
  // --------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");

      return;
    }

    setCheckingLogin(false);
  }, [router]);

  // --------------------------------------------------
  // Keep selected items valid
  // --------------------------------------------------

  // ⭐ CHANGED
  // If a product is removed from cart,
  // remove its key from selectedItems also.

  useEffect(() => {
    setSelectedItems((previousSelected) =>
      previousSelected.filter((key) =>
        cartItems.some((item) => getItemKey(item) === key),
      ),
    );
  }, [cartItems]);

  // --------------------------------------------------
  // Show Bottom Message
  // --------------------------------------------------

  function showMessage(message) {
    setCartMessage(message);

    setTimeout(() => {
      setCartMessage("");
    }, 3000);
  }

  // --------------------------------------------------
  // Select / Unselect Product
  // --------------------------------------------------

  // ⭐ CHANGED

  function toggleItemSelection(item) {
    const itemKey = getItemKey(item);

    setSelectedItems((previousSelected) => {
      if (previousSelected.includes(itemKey)) {
        return previousSelected.filter((key) => key !== itemKey);
      }

      return [...previousSelected, itemKey];
    });
  }

  // --------------------------------------------------
  // Select All Products
  // --------------------------------------------------

  // ⭐ CHANGED

  function toggleSelectAll() {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => getItemKey(item)));
    }
  }

  // --------------------------------------------------
  // Increase Quantity
  // --------------------------------------------------

  function increaseQuantity(item) {
    if (item.quantity < 4) {
      updateQuantity(
        item.productUuid,
        item.quantity + 1,
        item.selectedVariants || {},
      );

      showMessage("Cart quantity updated successfully.");
    }
  }

  // --------------------------------------------------
  // Decrease Quantity
  // --------------------------------------------------

  function decreaseQuantity(item) {
    if (item.quantity > 1) {
      updateQuantity(
        item.productUuid,
        item.quantity - 1,
        item.selectedVariants || {},
      );

      showMessage("Cart quantity updated successfully.");
    }
  }

  // --------------------------------------------------
  // Remove Product
  // --------------------------------------------------

  // ⭐ CHANGED
  // Removes only the selected product + selected variants.

  async function handleRemove(item) {
    const itemKey = getItemKey(item);

    await removeFromCart(item.productUuid, item.selectedVariants || {});

    // Remove from selected items
    setSelectedItems((previousSelected) =>
      previousSelected.filter((key) => key !== itemKey),
    );

    showMessage("Product removed from cart.");
  }

  // --------------------------------------------------
  // Selected Products
  // --------------------------------------------------

  // ⭐ CHANGED

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(getItemKey(item)),
  );

  // --------------------------------------------------
  // Calculate Total Amount
  // --------------------------------------------------

  // ⭐ CHANGED
  // Total is now calculated ONLY for selected products.

  const totalAmount = selectedCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // --------------------------------------------------
  // Place Order
  // --------------------------------------------------

  // ⭐ CHANGED

  function handlePlaceOrder() {
    if (selectedCartItems.length === 0) {
      showMessage("Please select at least one product.");

      return;
    }

    // Store selected products temporarily
    // so Checkout page can access them.

    sessionStorage.setItem("checkoutItems", JSON.stringify(selectedCartItems));

    router.push("/checkout");
  }

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (checkingLogin) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-lg text-gray-600">Checking login...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // Empty Cart
  // --------------------------------------------------

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-12">
        <div className="max-w-5xl mx-auto">
          <h1
            className="
            text-2xl
            sm:text-3xl
            font-bold
            text-black
            mb-6
            sm:mb-8
          "
          >
            My Cart
          </h1>

          <div
            className="
            bg-white
            rounded-xl
            shadow-lg
            p-6
            sm:p-8
            md:p-10
            text-center
          "
          >
            <p
              className="
              text-lg
              sm:text-xl
              text-gray-600
            "
            >
              Your cart is empty.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Cart UI
  // --------------------------------------------------

  return (
    <div
      className="
      min-h-screen
      bg-gray-100
      px-3
      sm:px-4
      md:px-6
      py-6
      sm:py-8
      md:py-10
    "
    >
      <div
        className="
        max-w-5xl
        mx-auto
      "
      >
        {/* ------------------------------------------------ */}
        {/* Heading */}
        {/* ------------------------------------------------ */}

        <div
          className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
          mb-5
          sm:mb-6
          md:mb-8
        "
        >
          <h1
            className="
            text-2xl
            sm:text-3xl
            font-bold
            text-black
          "
          >
            My Cart
          </h1>

          {/* ⭐ CHANGED */}
          {/* Select All */}

          <button
            type="button"
            onClick={toggleSelectAll}
            className="
              text-blue-600
              font-semibold
              hover:text-blue-800
              cursor-pointer
            "
          >
            {selectedItems.length === cartItems.length
              ? "Unselect All"
              : "Select All"}
          </button>
        </div>

        {/* ------------------------------------------------ */}
        {/* Cart Products */}
        {/* ------------------------------------------------ */}

        <div className="space-y-5">
          {cartItems.map((item) => {
            const itemKey = getItemKey(item);

            const isSelected = selectedItems.includes(itemKey);

            return (
              <div
                key={itemKey}
                className={`
                  bg-white
                  rounded-xl
                  shadow-md
                  p-5
                  flex
                  flex-col
                  md:flex-row
                  gap-6
                  border-2
                  transition

                  ${isSelected ? "border-blue-500" : "border-transparent"}
                `}
              >
                {/* ---------------------------------------- */}
                {/* Checkbox */}
                {/* ---------------------------------------- */}

                {/* ⭐ CHANGED */}

                <div
                  className="
                  flex
                  items-start
                  pt-2
                "
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItemSelection(item)}
                    className="
                      w-5
                      h-5
                      cursor-pointer
                    "
                  />
                </div>

                {/* ---------------------------------------- */}
                {/* Product Image */}
                {/* ---------------------------------------- */}

                <div
                  className="
                  relative
                  w-full
                  md:w-40
                  h-40
                  shrink-0
                  bg-gray-50
                  rounded-lg
                "
                >
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-contain p-3"
                  />
                </div>

                {/* ---------------------------------------- */}
                {/* Product Information */}
                {/* ---------------------------------------- */}

                <div
                  className="
                  flex
                  flex-col
                  justify-between
                  flex-1
                "
                >
                  {/* Product Name + Price */}

                  <div>
                    <h2
                      className="
                      text-xl
                      font-bold
                      text-gray-800
                    "
                    >
                      {item.name}
                    </h2>

                    <p
                      className="
                      text-lg
                      font-semibold
                      text-blue-600
                      mt-2
                    "
                    >
                      ₹ {item.price}
                    </p>

                    {/* -------------------------------- */}
                    {/* Selected Variants */}
                    {/* -------------------------------- */}

                    {item.selectedVariants &&
                      Object.keys(item.selectedVariants).length > 0 && (
                        <div className="mt-4">
                          <p
                            className="
                            text-sm
                            font-semibold
                            text-gray-700
                            mb-2
                          "
                          >
                            Selected Options
                          </p>

                          <div
                            className="
                            flex
                            flex-wrap
                            gap-2
                          "
                          >
                            {Object.entries(item.selectedVariants).map(
                              ([name, value]) => (
                                <span
                                  key={name}
                                  className="
                                    px-3
                                    py-1
                                    bg-gray-100
                                    border
                                    border-gray-300
                                    rounded-md
                                    text-sm
                                    text-gray-700
                                  "
                                >
                                  {name}: {value}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* -------------------------------- */}
                  {/* Quantity + Remove */}
                  {/* -------------------------------- */}

                  <div
                    className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-4
                    mt-6
                  "
                  >
                    {/* Quantity */}

                    <div>
                      <p
                        className="
                        text-sm
                        text-gray-500
                        mb-2
                      "
                      >
                        Quantity
                      </p>

                      <div
                        className="
                        flex
                        items-center
                        gap-3
                      "
                      >
                        {/* Minus */}

                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item)}
                          disabled={item.quantity <= 1}
                          className="
                            w-9
                            h-9
                            rounded-md
                            bg-gray-200
                            text-black
                            text-xl
                            font-bold
                            hover:bg-gray-300
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            cursor-pointer
                          "
                        >
                          -
                        </button>

                        {/* Quantity */}

                        <span
                          className="
                          min-w-8
                          text-center
                          text-lg
                          font-semibold
                          text-black
                        "
                        >
                          {item.quantity}
                        </span>

                        {/* Plus */}

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item)}
                          disabled={item.quantity >= 4}
                          className="
                            w-9
                            h-9
                            rounded-md
                            bg-gray-200
                            text-black
                            text-xl
                            font-bold
                            hover:bg-gray-300
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            cursor-pointer
                          "
                        >
                          +
                        </button>
                      </div>

                      <p
                        className="
                        text-xs
                        text-gray-500
                        mt-1
                      "
                      >
                        Maximum 4
                      </p>
                    </div>

                    {/* -------------------------------- */}
                    {/* Remove Button */}
                    {/* -------------------------------- */}

                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="
                        text-red-600
                        font-semibold
                        hover:text-red-800
                        cursor-pointer
                      "
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ------------------------------------------------ */}
        {/* Total Amount + Place Order */}
        {/* ------------------------------------------------ */}

        <div
          className="
          bg-white
          rounded-xl
          shadow-lg
          mt-8
          p-6
          flex
          flex-col
          md:flex-row
          items-center
          justify-between
          gap-5
        "
        >
          {/* Total Amount - LEFT */}

          <div>
            <p
              className="
              text-gray-500
              text-sm
            "
            >
              Selected Products Total
            </p>

            <p
              className="
              text-3xl
              font-bold
              text-gray-800
            "
            >
              ₹ {totalAmount}
            </p>

            {/* ⭐ CHANGED */}

            <p
              className="
              text-sm
              text-gray-500
              mt-1
            "
            >
              {selectedCartItems.length} product
              {selectedCartItems.length !== 1 ? "s" : ""} selected
            </p>
          </div>

          {/* Place Order - RIGHT */}

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={selectedCartItems.length === 0}
            className={`
              px-8
              py-3
              rounded-lg
              font-semibold
              transition

              ${
                selectedCartItems.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              }
            `}
          >
            Place Order
          </button>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* Bottom Message */}
      {/* ------------------------------------------------ */}

      {/* ⭐ CHANGED */}

      {cartMessage && (
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
        "
        >
          ⚠️ {cartMessage}
        </div>
      )}
    </div>
  );
}