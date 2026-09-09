"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/services/orderService";
import {
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  Plus,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

export default function Checkout() {
  const { removeSelectedItems } = useCart();
  const router = useRouter();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressUuid, setSelectedAddressUuid] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Check login
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setCheckingLogin(false);
  }, [router]);

  // Load selected checkout items from sessionStorage
  useEffect(() => {
    const storedItems = sessionStorage.getItem("checkoutItems");
    if (!storedItems) {
      router.push("/cart");
      return;
    }

    try {
      const parsedItems = JSON.parse(storedItems);
      if (!parsedItems || parsedItems.length === 0) {
        router.push("/cart");
        return;
      }
      setCheckoutItems(parsedItems);
    } catch (err) {
      console.error("Failed to load checkout items:", err);
      router.push("/cart");
    }
  }, [router]);

  // Load saved addresses
  useEffect(() => {
    async function loadSavedAddresses() {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const response = await fetch("http://127.0.0.1:8000/users/me/addresses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Failed to load saved addresses");
        }

        setSavedAddresses(Array.isArray(data) ? data : []);

        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          setSelectedAddressUuid(first.addressUuid);
          setAddress({
            street: first.street || "",
            city: first.city || "",
            state: first.state || "",
            pincode: first.pincode || "",
          });
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error("Saved Address Error:", err);
        setError(err.message);
      }
    }

    loadSavedAddresses();
  }, []);

  const totalAmount = checkoutItems.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  function handleSelectAddress(selectedUuid) {
    const selected = savedAddresses.find((item) => item.addressUuid === selectedUuid);
    if (!selected) return;

    setSelectedAddressUuid(selectedUuid);
    setAddress({
      street: selected.street || "",
      city: selected.city || "",
      state: selected.state || "",
      pincode: selected.pincode || "",
    });
    setShowNewAddressForm(false);
  }

  function handleAddressChange(event) {
    const { name, value } = event.target;
    setSelectedAddressUuid("");
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleUseSavedAddress() {
    if (savedAddresses.length === 0) return;
    const first = savedAddresses[0];
    setSelectedAddressUuid(first.addressUuid);
    setAddress({
      street: first.street || "",
      city: first.city || "",
      state: first.state || "",
      pincode: first.pincode || "",
    });
    setShowNewAddressForm(false);
  }

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

  async function handlePlaceOrder(event) {
    event.preventDefault();
    setError("");

    if (checkoutItems.length === 0) {
      setError("No products selected for checkout.");
      return;
    }

    if (
      !address.street.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      setError("Please complete all shipping address fields.");
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setPlacingOrder(true);

      const orderItems = checkoutItems.map((item) => ({
        productUuid: item.productUuid,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url || null,
      }));

      const orderData = {
        items: orderItems,
        total_amount: totalAmount,
        shipping_address: address,
        payment_method: paymentMethod,
      };

      await createOrder(orderData);
      await removeSelectedItems(checkoutItems);
      sessionStorage.removeItem("checkoutItems");
      router.push("/order-success");
    } catch (err) {
      console.error("Place Order Error:", err);
      setError(err.message || "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  }

  if (checkingLogin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Checking authorization...</p>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-md w-full shadow-lg">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            No items selected
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Please select at least one item from your cart before checking out.
          </p>
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition cursor-pointer"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            Secure Checkout
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Review and Pay
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Confirm your delivery address and choose a payment method.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery & Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Shipping Address */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Shipping Address
                </h2>
              </div>

              {/* Saved Addresses List */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Select Delivery Address
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      + Add New Address
                    </button>
                  </div>

                  <div className="space-y-3">
                    {savedAddresses.map((item) => {
                      const isSelected = selectedAddressUuid === item.addressUuid;
                      return (
                        <label
                          key={item.addressUuid}
                          className={`block rounded-2xl border p-4 cursor-pointer transition ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="savedAddress"
                              value={item.addressUuid}
                              checked={isSelected}
                              onChange={(e) => handleSelectAddress(e.target.value)}
                              className="mt-1 w-4 h-4 text-blue-600"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-sm text-slate-900">
                                  {item.label || "Home Address"}
                                </p>
                                {isSelected && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                    Deliver Here
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                                {item.street}, {item.city}, {item.state} -{" "}
                                {item.pincode}
                              </p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* New Address Form */}
              {showNewAddressForm && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Enter Address
                    </h3>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={handleUseSavedAddress}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Use Saved Address
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Street / Flat / Apartment
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      placeholder="e.g. Flat 402, Sunshine Heights"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="e.g. Mumbai"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        placeholder="e.g. Maharashtra"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={address.pincode}
                        onChange={handleAddressChange}
                        placeholder="e.g. 400001"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "COD"
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-xs text-slate-500">
                      Pay cash upon delivery at your doorstep
                    </p>
                  </div>
                </label>

                {/* UPI */}
                <label
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "UPI"
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === "UPI"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">
                      UPI (GPay / PhonePe / Paytm)
                    </p>
                    <p className="text-xs text-slate-500">
                      Instant verification via any UPI App
                    </p>
                  </div>
                </label>

                {/* Card */}
                <label
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "CARD"
                      ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">
                      Credit / Debit Card
                    </p>
                    <p className="text-xs text-slate-500">
                      Visa, Mastercard, RuPay & Amex accepted
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
                Order Summary ({checkoutItems.length} items)
              </h2>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 py-3">
                    <div className="relative w-14 h-14 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                      <Image
                        src={item.image_url || "/products/default.webp"}
                        alt={item.name}
                        fill
                        className="object-contain p-1.5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Qty: {item.quantity} × ₹{Number(item.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-slate-900 shrink-0">
                      ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total Due</span>
                  <span className="text-blue-600 text-lg">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <span>{placingOrder ? "Placing Order..." : "Confirm & Place Order"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>256-Bit SSL Encrypted & Protected Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}