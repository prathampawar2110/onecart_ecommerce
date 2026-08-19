"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useCart } from "@/context/CartContext";
import { createOrder } from "@/services/orderService";

export default function Checkout() {
  // -------------------------------------------------------------------
  // Cart
  // -------------------------------------------------------------------

  const { removeSelectedItems } = useCart();

  const router = useRouter();

  // -------------------------------------------------------------------
  // Checkout Items
  // -------------------------------------------------------------------

  const [checkoutItems, setCheckoutItems] = useState([]);

  // -------------------------------------------------------------------
  // Login / Order State
  // -------------------------------------------------------------------

  const [checkingLogin, setCheckingLogin] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [error, setError] = useState("");

  // -------------------------------------------------------------------
  // Payment Method
  // -------------------------------------------------------------------

  const [paymentMethod, setPaymentMethod] = useState("COD");

  // -------------------------------------------------------------------
  // Saved Addresses
  // -------------------------------------------------------------------

  const [savedAddresses, setSavedAddresses] = useState([]);

  const [selectedAddressUuid, setSelectedAddressUuid] = useState("");

  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // -------------------------------------------------------------------
  // Shipping Address
  // -------------------------------------------------------------------

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // -------------------------------------------------------------------
  // Check Login
  // -------------------------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");

      return;
    }

    setCheckingLogin(false);
  }, [router]);

  // -------------------------------------------------------------------
  // Load Selected Checkout Items
  // -------------------------------------------------------------------

  useEffect(() => {
    const storedItems = sessionStorage.getItem("checkoutItems");

    // Nothing selected from Cart
    if (!storedItems) {
      router.push("/cart");

      return;
    }

    try {
      const parsedItems = JSON.parse(storedItems);

      // Selected list is empty
      if (!parsedItems || parsedItems.length === 0) {
        router.push("/cart");

        return;
      }

      setCheckoutItems(parsedItems);
    } catch (error) {
      console.error("Failed to load checkout items:", error);

      router.push("/cart");
    }
  }, [router]);

  // -------------------------------------------------------------------
  // Load Saved Addresses
  // -------------------------------------------------------------------

  useEffect(() => {
    async function loadSavedAddresses() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");

        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/users/me/addresses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        console.log("Saved Addresses:", data);

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load saved addresses");
        }

        setSavedAddresses(data);

        // ---------------------------------------------------------------
        // Automatically select first saved address
        // ---------------------------------------------------------------

        if (data.length > 0) {
          const firstAddress = data[0];

          setSelectedAddressUuid(firstAddress.addressUuid);

          setAddress({
            street: firstAddress.street || "",
            city: firstAddress.city || "",
            state: firstAddress.state || "",
            pincode: firstAddress.pincode || "",
          });
        } else {
          // No saved address
          setShowNewAddressForm(true);
        }
      } catch (error) {
        console.error("Saved Address Error:", error);

        setError(error.message);
      }
    }

    loadSavedAddresses();
  }, [router]);

  // -------------------------------------------------------------------
  // Calculate Total
  // -------------------------------------------------------------------

  const totalAmount = checkoutItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // -------------------------------------------------------------------
  // Select Saved Address
  // -------------------------------------------------------------------

  function handleSelectAddress(selectedUuid) {
    const selectedAddress = savedAddresses.find(
      (item) => item.addressUuid === selectedUuid,
    );

    if (!selectedAddress) {
      return;
    }

    setSelectedAddressUuid(selectedUuid);

    setAddress({
      street: selectedAddress.street || "",
      city: selectedAddress.city || "",
      state: selectedAddress.state || "",
      pincode: selectedAddress.pincode || "",
    });

    setShowNewAddressForm(false);
  }

  // -------------------------------------------------------------------
  // Address Change
  // -------------------------------------------------------------------

  function handleAddressChange(event) {
    const { name, value } = event.target;

    // When user manually changes address,
    // it is no longer a saved-address selection.
    setSelectedAddressUuid("");

    setAddress((currentAddress) => ({
      ...currentAddress,
      [name]: value,
    }));
  }

  // -------------------------------------------------------------------
  // Use First Saved Address
  // -------------------------------------------------------------------

  function handleUseSavedAddress() {
    if (savedAddresses.length === 0) {
      return;
    }

    const firstAddress = savedAddresses[0];

    setSelectedAddressUuid(firstAddress.addressUuid);

    setAddress({
      street: firstAddress.street || "",
      city: firstAddress.city || "",
      state: firstAddress.state || "",
      pincode: firstAddress.pincode || "",
    });

    setShowNewAddressForm(false);
  }

  // -------------------------------------------------------------------
  // Add New Address Mode
  // -------------------------------------------------------------------

  function handleAddNewAddress() {
    setShowNewAddressForm(true);

    setSelectedAddressUuid("");

    setAddress({
      street: "",
      city: "",
      state: "",
      pincode: "",
    });
  }

  // -------------------------------------------------------------------
  // Place Order
  // -------------------------------------------------------------------

  async function handlePlaceOrder(event) {
    event.preventDefault();

    setError("");

    // ---------------------------------------------------------------
    // Check selected checkout items
    // ---------------------------------------------------------------

    if (checkoutItems.length === 0) {
      setError("No products selected for checkout.");

      return;
    }

    // ---------------------------------------------------------------
    // Validate address
    // ---------------------------------------------------------------

    if (
      !address.street.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      setError("Please enter your complete shipping address.");

      return;
    }

    // ---------------------------------------------------------------
    // Check Login
    // ---------------------------------------------------------------

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");

      return;
    }

    try {
      setPlacingOrder(true);

      // -------------------------------------------------------------
      // Prepare selected order items
      // -------------------------------------------------------------

      const orderItems = checkoutItems.map((item) => ({
        productUuid: item.productUuid,

        name: item.name,

        price: item.price,

        quantity: item.quantity,

        image_url: item.image_url || null,
      }));

      // -------------------------------------------------------------
      // Order Data
      // -------------------------------------------------------------

      const orderData = {
        items: orderItems,

        total_amount: totalAmount,

        shipping_address: address,

        payment_method: paymentMethod,
      };

      console.log("Sending Order:", orderData);

      // -------------------------------------------------------------
      // Create Order
      // -------------------------------------------------------------

      const data = await createOrder(orderData);

      console.log("Order Response:", data);

      // -------------------------------------------------------------
      // Remove only selected products from cart
      // -------------------------------------------------------------

      await removeSelectedItems(checkoutItems);

      // -------------------------------------------------------------
      // Remove checkout session
      // -------------------------------------------------------------

      sessionStorage.removeItem("checkoutItems");

      // -------------------------------------------------------------
      // Redirect
      // -------------------------------------------------------------

      router.push("/order-success");
    } catch (error) {
      console.error("Place Order Error:", error);

      setError(error.message || "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  }

  // -------------------------------------------------------------------
  // Login Checking
  // -------------------------------------------------------------------

  if (checkingLogin) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-lg text-gray-600">Checking login...</p>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Empty Checkout
  // -------------------------------------------------------------------

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-10 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              No Products Selected
            </h1>

            <p className="text-gray-600 mb-6">
              Please select a product from your cart before placing an order.
            </p>

            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="
                bg-blue-600
                text-white
                px-6
                py-3
                rounded-lg
                font-semibold
                hover:bg-blue-700
                transition
                cursor-pointer
              "
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Checkout UI
  // -------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}

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
          Checkout
        </h1>

        {/* Error */}

        {error && (
          <div
            className="
              mb-6
              bg-red-50
              border
              border-red-200
              text-red-700
              rounded-lg
              p-4
            "
          >
            {error}
          </div>
        )}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
            lg:gap-8
          "
        >
          {/* ========================================================= */}
          {/* LEFT SIDE - SHIPPING ADDRESS */}
          {/* ========================================================= */}

          <div
            className="
              bg-white
              rounded-xl
              shadow-lg
              p-5
              sm:p-6
            "
          >
            <h2
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-gray-800
                mb-6
              "
            >
              Shipping Address
            </h2>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              {/* ===================================================== */}
              {/* SAVED ADDRESSES */}
              {/* ===================================================== */}

              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Saved Addresses
                  </h3>

                  <div className="space-y-3">
                    {savedAddresses.map((savedAddress) => (
                      <label
                        key={savedAddress.addressUuid}
                        className={`
                          block
                          border
                          rounded-lg
                          p-4
                          cursor-pointer
                          transition
                          ${
                            selectedAddressUuid === savedAddress.addressUuid
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-300 hover:border-blue-400"
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="savedAddress"
                            value={savedAddress.addressUuid}
                            checked={
                              selectedAddressUuid === savedAddress.addressUuid
                            }
                            onChange={(event) =>
                              handleSelectAddress(event.target.value)
                            }
                            className="
                              w-5
                              h-5
                              mt-1
                              shrink-0
                            "
                          />

                          <div className="flex-1 min-w-0">
                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-3
                              "
                            >
                              <p className="font-semibold text-gray-800">
                                {savedAddress.label || "Address"}
                              </p>

                              {selectedAddressUuid ===
                                savedAddress.addressUuid && (
                                <span
                                  className="
                                    text-xs
                                    sm:text-sm
                                    font-semibold
                                    text-blue-600
                                    shrink-0
                                  "
                                >
                                  Selected
                                </span>
                              )}
                            </div>

                            <p className="text-gray-600 mt-1 wrap-break-words">
                              {savedAddress.street}
                            </p>

                            <p className="text-gray-600">
                              {savedAddress.city}, {savedAddress.state}
                            </p>

                            <p className="text-gray-600">
                              {savedAddress.pincode}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Add New Address */}

                  <button
                    type="button"
                    onClick={handleAddNewAddress}
                    className="
                      mt-4
                      w-full
                      border
                      border-blue-600
                      text-blue-600
                      py-3
                      rounded-lg
                      font-semibold
                      hover:bg-blue-50
                      transition
                      cursor-pointer
                    "
                  >
                    + Add New Address
                  </button>
                </div>
              )}

              {/* ===================================================== */}
              {/* NEW ADDRESS FORM */}
              {/* ===================================================== */}

              {showNewAddressForm && (
                <div
                  className="
                    border-t
                    border-gray-200
                    pt-6
                    mt-6
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      gap-3
                      mb-5
                    "
                  >
                    <h3 className="text-lg font-bold text-gray-800">
                      Enter New Address
                    </h3>

                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={handleUseSavedAddress}
                        className="
                          text-sm
                          text-blue-600
                          hover:text-blue-800
                          font-semibold
                          cursor-pointer
                          text-left
                          sm:text-right
                        "
                      >
                        Use Saved Address
                      </button>
                    )}
                  </div>

                  {/* Street */}

                  <div className="mb-5">
                    <label
                      className="
                        block
                        text-sm
                        font-medium
                        text-gray-700
                        mb-2
                      "
                    >
                      Street / House Address
                    </label>

                    <input
                      type="text"
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      placeholder="Enter your address"
                      className="
                        w-full
                        border
                        border-gray-300
                        rounded-lg
                        px-4
                        py-3
                        text-black
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                    />
                  </div>

                  {/* City */}

                  <div className="mb-5">
                    <label
                      className="
                        block
                        text-sm
                        font-medium
                        text-gray-700
                        mb-2
                      "
                    >
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      placeholder="Enter city"
                      className="
                        w-full
                        border
                        border-gray-300
                        rounded-lg
                        px-4
                        py-3
                        text-black
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                    />
                  </div>

                  {/* State */}

                  <div className="mb-5">
                    <label
                      className="
                        block
                        text-sm
                        font-medium
                        text-gray-700
                        mb-2
                      "
                    >
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      placeholder="Enter state"
                      className="
                        w-full
                        border
                        border-gray-300
                        rounded-lg
                        px-4
                        py-3
                        text-black
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                    />
                  </div>

                  {/* Pincode */}

                  <div>
                    <label
                      className="
                        block
                        text-sm
                        font-medium
                        text-gray-700
                        mb-2
                      "
                    >
                      Pincode
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={address.pincode}
                      onChange={handleAddressChange}
                      placeholder="Enter pincode"
                      className="
                        w-full
                        border
                        border-gray-300
                        rounded-lg
                        px-4
                        py-3
                        text-black
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                      "
                    />
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* PAYMENT METHOD */}
              {/* ===================================================== */}

              <div className="pt-4">
                <h2
                  className="
                    text-xl
                    font-bold
                    text-gray-800
                    mb-4
                  "
                >
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {/* COD */}

                  <label
                    className="
                      flex
                      items-start
                      gap-3
                      border
                      border-gray-300
                      rounded-lg
                      p-4
                      cursor-pointer
                      hover:bg-gray-50
                    "
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      className="w-5 h-5 mt-1 shrink-0"
                    />

                    <div>
                      <p className="font-semibold text-gray-800">
                        Cash on Delivery
                      </p>

                      <p className="text-sm text-gray-500">
                        Pay when your order is delivered
                      </p>
                    </div>
                  </label>

                  {/* UPI */}

                  <label
                    className="
                      flex
                      items-start
                      gap-3
                      border
                      border-gray-300
                      rounded-lg
                      p-4
                      cursor-pointer
                      hover:bg-gray-50
                    "
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      className="w-5 h-5 mt-1 shrink-0"
                    />

                    <div>
                      <p className="font-semibold text-gray-800">UPI</p>

                      <p className="text-sm text-gray-500">Pay using UPI</p>
                    </div>
                  </label>

                  {/* Card */}

                  <label
                    className="
                      flex
                      items-start
                      gap-3
                      border
                      border-gray-300
                      rounded-lg
                      p-4
                      cursor-pointer
                      hover:bg-gray-50
                    "
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CARD"
                      checked={paymentMethod === "CARD"}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                      className="w-5 h-5 mt-1 shrink-0"
                    />

                    <div>
                      <p className="font-semibold text-gray-800">Card</p>

                      <p className="text-sm text-gray-500">
                        Pay using debit or credit card
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* ===================================================== */}
              {/* PLACE ORDER */}
              {/* ===================================================== */}

              <button
                type="submit"
                disabled={placingOrder}
                className="
                  w-full
                  bg-blue-600
                  text-white
                  py-3
                  rounded-lg
                  font-semibold
                  hover:bg-blue-700
                  transition
                  cursor-pointer
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE - ORDER SUMMARY */}
          {/* ========================================================= */}

          <div
            className="
              bg-white
              rounded-xl
              shadow-lg
              p-5
              sm:p-6
            "
          >
            <h2
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-gray-800
                mb-6
              "
            >
              Order Summary
            </h2>

            <div className="space-y-5">
              {checkoutItems.map((item) => (
                <div
                  key={`
                    ${item.productUuid}-
                    ${JSON.stringify(item.selectedVariants || {})}
                  `}
                  className="
                    flex
                    gap-3
                    sm:gap-4
                    border-b
                    border-gray-200
                    pb-5
                  "
                >
                  {/* Product Image */}

                  <div
                    className="
                      relative
                      w-16
                      h-16
                      sm:w-20
                      sm:h-20
                      shrink-0
                      bg-gray-50
                      rounded-lg
                    "
                  >
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Product Details */}

                  <div className="flex-1 min-w-0">
                    <h3
                      className="
                        font-semibold
                        text-gray-800
                        wrap-break-words
                      "
                    >
                      {item.name}
                    </h3>

                    <p
                      className="
                        text-sm
                        text-gray-500
                        mt-1
                      "
                    >
                      ₹ {item.price} × {item.quantity}
                    </p>

                    {/* Variants */}

                    {item.selectedVariants &&
                      Object.keys(item.selectedVariants).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.entries(item.selectedVariants).map(
                            ([name, value]) => (
                              <span
                                key={name}
                                className="
                                inline-block
                                text-xs
                                bg-gray-100
                                border
                                border-gray-200
                                rounded
                                px-2
                                py-1
                                text-orange-600
                              "
                              >
                                {name}: {value}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                  </div>

                  {/* Item Total */}

                  <div
                    className="
                      font-semibold
                      text-gray-800
                      whitespace-nowrap
                      text-sm
                      sm:text-base
                    "
                  >
                    ₹ {item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}

            <div
              className="
                border-t
                border-gray-200
                mt-6
                pt-5
                flex
                justify-between
                items-center
                gap-4
              "
            >
              <span
                className="
                  text-lg
                  sm:text-xl
                  font-bold
                  text-gray-800
                "
              >
                Total
              </span>

              <span
                className="
                  text-xl
                  sm:text-2xl
                  font-bold
                  text-blue-600
                  whitespace-nowrap
                "
              >
                ₹ {totalAmount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}