"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


import {
  ArrowLeft,
  Edit3,
  LogOut,
  MapPin,
  PackageCheck,
  Phone,
  Plus,
  ReceiptText,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function Profile() {
  const router = useRouter();

  // ==========================================================
  // PROFILE STATE
  // ==========================================================

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // ADDRESS STATE
  // ==========================================================

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressUuid, setEditingAddressUuid] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  const [address, setAddress] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  // ==========================================================
  // PHONE STATE
  // ==========================================================

  const [phone, setPhone] = useState("");
  const [showPhoneForm, setShowPhoneForm] = useState(false);

  // ==========================================================
  // MESSAGE / ERROR STATE
  // ==========================================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================================
  // PURCHASE HISTORY STATE
  // ==========================================================

  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // ==========================================================
  // LOGOUT STATE
  // ==========================================================

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ==========================================================
  // GET USER PROFILE
  // ==========================================================

  useEffect(() => {
    async function getUserProfile() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        // ------------------------------------------------------
        // GET USER PROFILE
        // ------------------------------------------------------

        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        
        console.log("CREATED AT:", data[0]?.created_at);
        console.log("TYPE:", typeof data[0]?.created_at);

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load profile"
          );
        }

        setUser(data);
        setPhone(data.phone || "");
        setAddresses(data.addresses || []);

        // ------------------------------------------------------
        // GET ORDERS FOR ORDER COUNT
        // ------------------------------------------------------

        try {
          const orderResponse = await fetch(
            `${API_URL}/orders/my-orders`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const orderData = await orderResponse.json();

          if (orderResponse.ok && Array.isArray(orderData)) {
            // Store the total number of orders
            setOrderCount(orderData.length);
          }
        } catch (orderError) {
          console.error(
            "Order Count Error:",
            orderError
          );
        }
      } catch (error) {
        console.error("Profile Error:", error);

        localStorage.removeItem("access_token");

        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    getUserProfile();
  }, [router]);

  function formatOrderId(orderUuid) {
    if (!orderUuid) {
      return "N/A";
    }

    return `ORD-${orderUuid.slice(-5).toUpperCase()}`;
  }

  // ==========================================================
  // MESSAGE HELPERS
  // ==========================================================

  function showMessage(text) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function showError(text) {
    setError(text);

    setTimeout(() => {
      setError("");
    }, 4000);
  }

  // ==========================================================
  // ADDRESS FUNCTIONS
  // ==========================================================

  function resetAddressForm() {
    setAddress({
      label: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
    });

    setEditingAddressUuid(null);
    setShowAddressForm(false);
  }

  function handleAddAddress() {
    setMessage("");
    setError("");

    setAddress({
      label: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
    });

    setEditingAddressUuid(null);
    setShowAddressForm(true);
  }

  function handleEditAddress(savedAddress) {
    setMessage("");
    setError("");

    setAddress({
      label: savedAddress.label || "",
      street: savedAddress.street || "",
      city: savedAddress.city || "",
      state: savedAddress.state || "",
      pincode: savedAddress.pincode || "",
    });

    setEditingAddressUuid(savedAddress.addressUuid);

    setShowAddressForm(true);
  }

  function handleAddressChange(event) {
    const { name, value } = event.target;

    setAddress((previousAddress) => ({
      ...previousAddress,
      [name]: value,
    }));
  }

  async function handleSaveAddress(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (
      !address.label.trim() ||
      !address.street.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      showError("Please fill all address fields.");
      return;
    }

    setAddressLoading(true);

    try {
      const url = editingAddressUuid
        ? `${API_URL}/users/me/addresses/${editingAddressUuid}`
        : `${API_URL}/users/me/addresses`;

      const method = editingAddressUuid ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(address),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to save address"
        );
      }

      if (!editingAddressUuid) {
        setAddresses((previousAddresses) => [
          ...previousAddresses,
          data.address,
        ]);

        showMessage("Address added successfully.");
      } else {
        setAddresses((previousAddresses) =>
          previousAddresses.map((savedAddress) =>
            savedAddress.addressUuid === editingAddressUuid
              ? data.address
              : savedAddress
          )
        );

        showMessage("Address updated successfully.");
      }

      resetAddressForm();
    } catch (error) {
      console.error("Save Address Error:", error);
      showError(error.message);
    } finally {
      setAddressLoading(false);
    }
  }

  async function handleDeleteAddress(addressUuid) {
    const confirmDelete = window.confirm(
      "Do you really want to delete this address?"
    );

    if (!confirmDelete) {
      return;
    }

    setMessage("");
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/users/me/addresses/${addressUuid}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete address"
        );
      }

      setAddresses((previousAddresses) =>
        previousAddresses.filter(
          (savedAddress) =>
            savedAddress.addressUuid !== addressUuid
        )
      );

      showMessage("Address deleted successfully.");
    } catch (error) {
      console.error("Delete Address Error:", error);
      showError(error.message);
    }
  }

  // ==========================================================
  // PHONE FUNCTIONS
  // ==========================================================

  async function handleSavePhone(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update phone"
        );
      }

      setUser(data);
      setPhone(data.phone || "");
      setShowPhoneForm(false);

      showMessage("Phone number updated successfully.");
    } catch (error) {
      console.error("Phone Update Error:", error);
      showError(error.message);
    }
  }

  // ==========================================================
  // PURCHASE HISTORY
  // ==========================================================

  async function handlePurchaseHistory() {
    if (showPurchaseHistory) {
      setShowPurchaseHistory(false);
      return;
    }

    setOrdersLoading(true);
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("ORDERS FROM API:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to get purchase history"
        );
      }

      // Only show latest 4 orders in purchase history
      setOrders(data.slice(0, 4));

      // Keep the total order count updated
      setOrderCount(data.length);

      setShowPurchaseHistory(true);
    } catch (error) {
      console.error(
        "Purchase History Error:",
        error
      );

      showError(error.message);
    } finally {
      setOrdersLoading(false);
    }
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  function handleLogout() {
    setShowLogoutModal(true);
  }

  function confirmLogout() {
    localStorage.removeItem("access_token");

    window.dispatchEvent(new Event("auth-change"));

    setShowLogoutModal(false);

    router.replace("/login");
  }

  function cancelLogout() {
    setShowLogoutModal(false);
  }

  // ==========================================================
  // UTILITY FUNCTIONS
  // ==========================================================

  function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  function formatPaymentMethod(paymentMethod) {
    if (paymentMethod === "cod") {
      return "Cash on Delivery";
    }

    if (paymentMethod === "upi") {
      return "UPI";
    }

    if (paymentMethod === "card") {
      return "Card";
    }

    return paymentMethod || "N/A";
  }
  //--------------------------------------------------------
  function formatOrder(createdAt) {
    if (!createdAt) {
      return "Date not available";
    }

    const date = new Date(createdAt)

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleString("en-IN" , {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getInitial(name) {
    return (
      name?.trim()?.charAt(0)?.toUpperCase() || "U"
    );
  }

  // ==========================================================
  // LOADING UI
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />

          <div className="mt-6 grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <div className="h-80 animate-pulse rounded-lg bg-white shadow-sm" />

            <div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => router.back()}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-slate-300
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-700
            shadow-sm
            transition
            hover:bg-slate-100
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {user && (
          <div className="mt-5 grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">

            {/* =================================================
                LEFT SIDEBAR
            ================================================== */}

            <aside className="space-y-5">

              {/* PROFILE CARD */}

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col items-center text-center">

                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-950 text-3xl font-bold text-white">
                    {getInitial(user.name)}
                  </div>

                  <h1 className="mt-4 text-2xl font-bold capitalize text-slate-950">
                    {user.name}
                  </h1>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {user.email}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700 ring-1 ring-blue-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {user.role}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">

                  <MiniStat
                    label="Addresses"
                    value={addresses.length}
                  />

                  {/* IMPORTANT:
                      Use orderCount instead of orders.length
                  */}

                  <MiniStat
                    label="Orders"
                    value={orderCount}
                  />

                </div>
              </section>

              {/* ACCOUNT ACTIONS */}

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">

                <h2 className="text-base font-bold text-slate-950">
                  Account Actions
                </h2>

                <div className="mt-4 space-y-3">

                  {/* PURCHASE HISTORY */}

                  <button
                    type="button"
                    onClick={handlePurchaseHistory}
                    className="
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      border
                      border-blue-600
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      text-blue-700
                      transition
                      hover:bg-blue-50
                    "
                  >
                    <ReceiptText className="h-4 w-4" />

                    {showPurchaseHistory
                      ? "Hide Orders"
                      : "Purchase History"}
                  </button>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      border
                      border-red-500
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      text-red-600
                      transition
                      hover:bg-red-50
                    "
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>

                </div>
              </section>
            </aside>

            {/* =================================================
                MAIN CONTENT
            ================================================== */}

            <main className="space-y-5">

              {/* PROFILE DETAILS */}

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                      Account
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-950">
                      Profile Details
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Manage your account details for faster checkout.
                    </p>
                  </div>

                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">

                  <InfoTile
                    icon={UserRound}
                    label="Name"
                    value={user.name}
                    capitalize
                  />

                  <InfoTile
                    label="Email"
                    value={user.email}
                  />

                  <InfoTile
                    icon={ShieldCheck}
                    label="Account Type"
                    value={user.role}
                    capitalize
                  />

                </div>
              </section>

              {/* PHONE */}

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-3">

                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <Phone className="h-5 w-5" />
                    </span>

                    <div>
                      <h2 className="text-lg font-bold text-slate-950">
                        Phone Number
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {user.phone || "No phone number added"}
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPhoneForm(!showPhoneForm)
                    }
                    className="
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      bg-blue-600
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-blue-700
                      sm:w-auto
                    "
                  >
                    {showPhoneForm ? (
                      <>
                        <X className="h-4 w-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4" />
                        Edit Phone
                      </>
                    )}
                  </button>

                </div>

                {showPhoneForm && (
                  <form
                    onSubmit={handleSavePhone}
                    className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                  >
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      placeholder="Enter phone number"
                      className={inputClassName}
                    />

                    <button
                      type="submit"
                      className="rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Save Phone
                    </button>
                  </form>
                )}

              </section>

              {/* =================================================
                  SAVED ADDRESSES
              ================================================== */}

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <div className="flex items-center gap-3">

                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <MapPin className="h-5 w-5" />
                      </span>

                      <div>
                        <h2 className="text-lg font-bold text-slate-950">
                          Saved Addresses
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Keep delivery addresses ready for checkout.
                        </p>
                      </div>

                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      bg-slate-950
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-slate-800
                      sm:w-auto
                    "
                  >
                    <Plus className="h-4 w-4" />
                    Add Address
                  </button>

                </div>

                {/* ADDRESS FORM */}

                {showAddressForm && (
                  <form
                    onSubmit={handleSaveAddress}
                    className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-5"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <h3 className="font-bold text-slate-950">
                          {editingAddressUuid
                            ? "Edit Address"
                            : "Add Address"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          All fields are required for delivery.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={resetAddressForm}
                        title="Close address form"
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500"
                      >
                        <X className="h-4 w-4" />
                      </button>

                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">

                      <Field label="Label">
                        <input
                          type="text"
                          name="label"
                          value={address.label}
                          onChange={handleAddressChange}
                          placeholder="Home / Work / Office"
                          className={inputClassName}
                        />
                      </Field>

                      <Field label="Pincode">
                        <input
                          type="text"
                          name="pincode"
                          value={address.pincode}
                          onChange={handleAddressChange}
                          placeholder="Enter pincode"
                          className={inputClassName}
                        />
                      </Field>

                      <Field
                        label="Street / House Address"
                        className="sm:col-span-2"
                      >
                        <input
                          type="text"
                          name="street"
                          value={address.street}
                          onChange={handleAddressChange}
                          placeholder="Enter your address"
                          className={inputClassName}
                        />
                      </Field>

                      <Field label="City">
                        <input
                          type="text"
                          name="city"
                          value={address.city}
                          onChange={handleAddressChange}
                          placeholder="Enter city"
                          className={inputClassName}
                        />
                      </Field>

                      <Field label="State">
                        <input
                          type="text"
                          name="state"
                          value={address.state}
                          onChange={handleAddressChange}
                          placeholder="Enter state"
                          className={inputClassName}
                        />
                      </Field>

                    </div>

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                      <button
                        type="button"
                        onClick={resetAddressForm}
                        className="
                          rounded-lg
                          border
                          border-slate-300
                          bg-white
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          text-slate-700
                          transition
                          hover:bg-slate-100
                        "
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={addressLoading}
                        className="
                          rounded-lg
                          bg-blue-600
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-blue-700
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >
                        {addressLoading
                          ? "Saving..."
                          : editingAddressUuid
                            ? "Update Address"
                            : "Save Address"}
                      </button>

                    </div>
                  </form>
                )}

                {/* ADDRESS LIST */}

                {addresses.length === 0 ? (
                  <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                    <p className="font-semibold text-slate-700">
                      No saved addresses yet.
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Add one to make checkout faster.
                    </p>

                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 xl:grid-cols-2">

                    {addresses.map((savedAddress) => (
                      <article
                        key={savedAddress.addressUuid}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
                            {savedAddress.label}
                          </span>

                          <MapPin className="h-5 w-5 shrink-0 text-slate-400" />

                        </div>

                        <div className="mt-4 text-sm leading-6 text-slate-600">

                          <p className="font-semibold text-slate-900">
                            {savedAddress.street}
                          </p>

                          <p>
                            {savedAddress.city},{" "}
                            {savedAddress.state}
                          </p>

                          <p>{savedAddress.pincode}</p>

                        </div>

                        <div className="mt-5 flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEditAddress(savedAddress)
                            }
                            className="
                              inline-flex
                              flex-1
                              items-center
                              justify-center
                              gap-2
                              rounded-lg
                              bg-blue-50
                              px-3
                              py-2.5
                              text-sm
                              font-semibold
                              text-blue-700
                              transition
                              hover:bg-blue-100
                            "
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAddress(
                                savedAddress.addressUuid
                              )
                            }
                            className="
                              inline-flex
                              flex-1
                              items-center
                              justify-center
                              gap-2
                              rounded-lg
                              bg-red-50
                              px-3
                              py-2.5
                              text-sm
                              font-semibold
                              text-red-700
                              transition
                              hover:bg-red-100
                            "
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>

                        </div>
                      </article>
                    ))}

                  </div>
                )}

              </section>

              {/* =================================================
                  PURCHASE HISTORY
              ================================================== */}

              {showPurchaseHistory && (
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                  <div className="flex items-center gap-3">

                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                      <PackageCheck className="h-5 w-5" />
                    </span>

                    <div>
                      <h2 className="text-lg font-bold text-slate-950">
                        Purchase History
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Recent orders from your account.
                      </p>
                    </div>

                  </div>

                  {ordersLoading ? (
                    <div className="mt-5 h-24 animate-pulse rounded-lg bg-slate-100" />
                  ) : orders.length === 0 ? (
                    <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      No purchases yet.
                    </div>
                  ) : (
                    <div className="mt-5 space-y-4">

                      {orders.map((order) => (
                        <article
                          key={order.orderUuid}
                          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                        >

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                            <div className="min-w-0">

                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Order ID
                              </p>

                              <p className="mt-1 break-all text-sm font-bold text-slate-950">
                                {formatOrderId(order.orderUuid)}
                              </p>

                            </div>

                            <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
                              {order.status}
                            </span>

                            {/* <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200">
                              {formatOrder(order.datetime)}
                            </span> */}

                          </div>

                          <div className="mt-4 space-y-2">

                            {order.items.map((item, index) => (
                              <div
                                key={
                                  item.productUuid || index
                                }
                                className="flex justify-between gap-3 text-sm text-slate-600"
                              >

                                <span>
                                  {item.productName ||
                                    item.name ||
                                    "Product"}

                                  {" x "}

                                  {item.quantity}
                                </span>

                                <span className="font-semibold text-slate-950">
                                  {formatCurrency(
                                    Number(item.price || 0) *
                                      Number(item.quantity || 0)
                                  )}
                                </span>

                              </div>
                            ))}

                          </div>

                          <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">

                            <div>
                              <p className="text-xs text-slate-400">
                                Payment
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-700">
                                {formatPaymentMethod(
                                  order.payment_method
                                )}
                              </p>
                            </div>

                            <div className="sm:text-right">
                              <p className="text-xs text-slate-400">
                                Total
                              </p>

                              <p className="mt-1 text-lg font-bold text-slate-950">
                                {formatCurrency(
                                  order.total_amount
                                )}
                              </p>
                            </div>

                          </div>

                        </article>
                      ))}

                    </div>
                  )}

                </section>
              )}

            </main>
          </div>
        )}
      </div>

      {/* ========================================================
          LOGOUT CONFIRMATION MODAL
      ========================================================= */}

      {showLogoutModal && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            px-4
          "
        >

          <div
            className="
              w-full
              max-w-sm
              rounded-xl
              bg-white
              p-6
              shadow-2xl
            "
          >

            <h2 className="text-xl font-bold text-slate-950">
              Logout
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to logout?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">

              <button
                type="button"
                onClick={cancelLogout}
                className="
                  flex-1
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:bg-slate-100
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmLogout}
                className="
                  flex-1
                  rounded-lg
                  bg-red-500
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-600
                "
              >
                Logout
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MINI STAT COMPONENT
// ============================================================

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center">

      <p className="text-lg font-bold text-slate-950">
        {value}
      </p>

      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

    </div>
  );
}

// ============================================================
// INFO TILE COMPONENT
// ============================================================

function InfoTile({
  icon: Icon = UserRound,
  label,
  value,
  capitalize = false,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-slate-400">

        <Icon className="h-4 w-4" />

        <p className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </p>

      </div>

      <p
        className={`mt-3 break-all text-sm font-bold text-slate-950 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value || "N/A"}
      </p>

    </div>
  );
}

// ============================================================
// FORM FIELD COMPONENT
// ============================================================

function Field({
  label,
  children,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>

      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <span className="mt-2 block">
        {children}
      </span>

    </label>
  );
}

// ============================================================
// INPUT STYLE
// ============================================================

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";