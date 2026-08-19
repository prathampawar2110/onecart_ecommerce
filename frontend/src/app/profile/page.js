"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------
  // Address
  // ---------------------------------------------------------------

  const [addresses, setAddresses] = useState([]);

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [editingAddressUuid, setEditingAddressUuid] = useState(null);

  const [address, setAddress] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [addressLoading, setAddressLoading] = useState(false);

  // ---------------------------------------------------------------
  // Phone
  // ---------------------------------------------------------------

  const [phone, setPhone] = useState("");

  const [showPhoneForm, setShowPhoneForm] = useState(false);

  // ---------------------------------------------------------------
  // Messages
  // ---------------------------------------------------------------

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---------------------------------------------------------------
  // Purchase History
  // ---------------------------------------------------------------

  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);

  const [orders, setOrders] = useState([]);

  const [ordersLoading, setOrdersLoading] = useState(false);

  // ===============================================================
  // Temporary Messages
  // ===============================================================

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

  // ===============================================================
  // Get User Profile
  // ===============================================================

  useEffect(() => {
    async function getUserProfile() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load profile");
        }

        console.log("Profile:", data);

        setUser(data);

        setPhone(data.phone || "");

        setAddresses(data.addresses || []);
      } catch (error) {
        console.error("Profile Error:", error);

        localStorage.removeItem("access_token");

        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    getUserProfile();
  }, [router]);

  // ===============================================================
  // Address Form Reset
  // ===============================================================

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

  // ===============================================================
  // Add Address Button
  // ===============================================================

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

  // ===============================================================
  // Edit Address
  // ===============================================================

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

  // ===============================================================
  // Handle Address Input
  // ===============================================================

  function handleAddressChange(event) {
    const { name, value } = event.target;

    setAddress((previousAddress) => ({
      ...previousAddress,
      [name]: value,
    }));
  }

  // ===============================================================
  // Save Address
  // ===============================================================

  async function handleSaveAddress(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    // Basic validation

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
        throw new Error(data.detail || "Failed to save address");
      }

      // -----------------------------------------------------------
      // Add New Address
      // -----------------------------------------------------------

      if (!editingAddressUuid) {
        setAddresses((previousAddresses) => [
          ...previousAddresses,
          data.address,
        ]);

        showMessage("Address added successfully.");
      }

      // -----------------------------------------------------------
      // Update Existing Address
      // -----------------------------------------------------------
      else {
        setAddresses((previousAddresses) =>
          previousAddresses.map((savedAddress) =>
            savedAddress.addressUuid === editingAddressUuid
              ? data.address
              : savedAddress,
          ),
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

  // ===============================================================
  // Delete Address
  // ===============================================================

  async function handleDeleteAddress(addressUuid) {
    const confirmDelete = window.confirm(
      "Do you really want to delete this address?",
    );

    if (!confirmDelete) {
      return;
    }

    setMessage("");
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
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
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete address");
      }

      setAddresses((previousAddresses) =>
        previousAddresses.filter(
          (savedAddress) => savedAddress.addressUuid !== addressUuid,
        ),
      );

      showMessage("Address deleted successfully.");
    } catch (error) {
      console.error("Delete Address Error:", error);

      showError(error.message);
    }
  }

  // ===============================================================
  // Save Phone
  // ===============================================================

  async function handleSavePhone(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
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
        throw new Error(data.detail || "Failed to update phone");
      }

      setUser(data);

      setPhone(data.phone || "");

      showMessage("Phone number updated successfully.");

      setShowPhoneForm(false);
    } catch (error) {
      console.error("Phone Update Error:", error);

      showError(error.message);
    }
  }

  // ===============================================================
  // Purchase History
  // ===============================================================

  async function handlePurchaseHistory() {
    if (showPurchaseHistory) {
      setShowPurchaseHistory(false);
      return;
    }

    setOrdersLoading(true);

    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to get purchase history");
      }

      setOrders(data.slice(0, 4));

      setShowPurchaseHistory(true);
    } catch (error) {
      console.error("Purchase History Error:", error);

      showError(error.message);
    } finally {
      setOrdersLoading(false);
    }
  }

  // ===============================================================
  // Logout
  // ===============================================================

  function handleLogout() {
    const confirmLogout = window.confirm("Do you really want to logout?");

    if (!confirmLogout) {
      return;
    }

    localStorage.removeItem("access_token");

    window.dispatchEvent(new Event("auth-change"));

    router.push("/login");
  }

  // ===============================================================
  // Loading
  // ===============================================================

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <p className="text-lg sm:text-xl text-black text-center">
          Loading Profile...
        </p>
      </div>
    );
  }

  // ===============================================================
  // UI
  // ===============================================================

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-8">
          {/* ===================================================== */}
          {/* Header */}
          {/* ===================================================== */}

          <div className="mb-8">
            {/* Close / Back Button */}

            <button
              type="button"
              onClick={() => router.back()}
              className="
                mb-5
                inline-flex
                items-center
                gap-2
                px-4
                py-2
                border
                border-gray-300
                text-gray-700
                rounded-lg
                font-semibold
                hover:bg-gray-100
                transition
                cursor-pointer
              "
            >
              ← Close
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              My Profile
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage your account and saved addresses
            </p>
          </div>

          {/* ===================================================== */}
          {/* Messages */}
          {/* ===================================================== */}

          {message && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {user && (
            <>
              {/* ================================================= */}
              {/* Basic Information */}
              {/* ================================================= */}

              <div className="space-y-5">
                <div>
                  <p className="text-sm text-gray-500">Name</p>

                  <p className="text-lg font-semibold text-gray-800 capitalize wrap-break-words">
                    {user.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>

                  <p className="text-lg font-semibold text-gray-800 break-all">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Account Type</p>

                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>

              {/* ================================================= */}
              {/* Phone */}
              {/* ================================================= */}

              <div className="mt-8 border-t border-gray-200 pt-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Phone Number
                    </h2>

                    <p className="text-gray-700 mt-2">
                      {user.phone || "Not Added"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPhoneForm(!showPhoneForm)}
                    className="
                      w-full
                      sm:w-auto
                      px-5
                      py-2.5
                      bg-blue-600
                      text-white
                      rounded-lg
                      font-semibold
                      hover:bg-blue-700
                      transition
                      cursor-pointer
                    "
                  >
                    {showPhoneForm ? "Cancel" : "Edit Phone"}
                  </button>
                </div>

                {showPhoneForm && (
                  <form onSubmit={handleSavePhone} className="mt-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Enter phone number"
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

                    <button
                      type="submit"
                      className="
                        w-full
                        mt-4
                        bg-blue-600
                        text-white
                        py-3
                        rounded-lg
                        font-semibold
                        hover:bg-blue-700
                        transition
                        cursor-pointer
                      "
                    >
                      Save Phone
                    </button>
                  </form>
                )}
              </div>

              {/* ================================================= */}
              {/* Saved Addresses */}
              {/* ================================================= */}

              <div className="mt-8 border-t border-gray-200 pt-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Saved Addresses
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Save multiple addresses for faster checkout.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="
                      w-full
                      sm:w-auto
                      px-5
                      py-2.5
                      bg-blue-600
                      text-white
                      rounded-lg
                      font-semibold
                      hover:bg-blue-700
                      transition
                      cursor-pointer
                    "
                  >
                    + Add Address
                  </button>
                </div>

                {/* ------------------------------------------------ */}
                {/* Address Form */}
                {/* ------------------------------------------------ */}

                {showAddressForm && (
                  <form
                    onSubmit={handleSaveAddress}
                    className="
                      mb-6
                      border
                      border-blue-200
                      bg-blue-50
                      rounded-xl
                      p-5
                      sm:p-6
                    "
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-5">
                      {editingAddressUuid ? "Edit Address" : "Add New Address"}
                    </h3>

                    {/* Label */}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Label
                      </label>

                      <input
                        type="text"
                        name="label"
                        value={address.label}
                        onChange={handleAddressChange}
                        placeholder="Home / Work / Office"
                        className="
                          w-full
                          border
                          border-gray-300
                          rounded-lg
                          px-4
                          py-3
                          text-black
                          bg-white
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                        "
                      />
                    </div>

                    {/* Street */}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          bg-white
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                        "
                      />
                    </div>

                    {/* City + State */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            bg-white
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                          "
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            bg-white
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                          "
                        />
                      </div>
                    </div>

                    {/* Pincode */}

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          bg-white
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                        "
                      />
                    </div>

                    {/* Buttons */}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={addressLoading}
                        className="
                          flex-1
                          bg-blue-600
                          text-white
                          py-3
                          rounded-lg
                          font-semibold
                          hover:bg-blue-700
                          transition
                          cursor-pointer
                          disabled:opacity-60
                          disabled:cursor-not-allowed
                        "
                      >
                        {addressLoading
                          ? "Saving..."
                          : editingAddressUuid
                            ? "Update Address"
                            : "Save Address"}
                      </button>

                      <button
                        type="button"
                        onClick={resetAddressForm}
                        className="
                          flex-1
                          bg-gray-200
                          text-gray-700
                          py-3
                          rounded-lg
                          font-semibold
                          hover:bg-gray-300
                          transition
                          cursor-pointer
                        "
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* ------------------------------------------------ */}
                {/* Address List */}
                {/* ------------------------------------------------ */}

                {addresses.length === 0 ? (
                  <div
                    className="
                      bg-gray-50
                      border
                      border-gray-200
                      rounded-xl
                      p-6
                      text-center
                    "
                  >
                    <p className="text-gray-500">No saved addresses yet.</p>

                    <p className="text-sm text-gray-400 mt-1">
                      Add an address to use it during checkout.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {addresses.map((savedAddress) => (
                      <div
                        key={savedAddress.addressUuid}
                        className="
                          border
                          border-gray-200
                          rounded-xl
                          p-5
                          bg-gray-50
                        "
                      >
                        {/* Address Header */}

                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span
                              className="
                                inline-flex
                                px-3
                                py-1
                                rounded-full
                                bg-blue-100
                                text-blue-700
                                text-xs
                                font-bold
                              "
                            >
                              {savedAddress.label}
                            </span>
                          </div>
                        </div>

                        {/* Address */}

                        <div className="mt-4 text-gray-700 text-sm leading-6">
                          <p>{savedAddress.street}</p>

                          <p>
                            {savedAddress.city}, {savedAddress.state}
                          </p>

                          <p>{savedAddress.pincode}</p>
                        </div>

                        {/* Actions */}

                        <div
                          className="
                            flex
                            flex-col
                            sm:flex-row
                            gap-2
                            mt-5
                          "
                        >
                          <button
                            type="button"
                            onClick={() => handleEditAddress(savedAddress)}
                            className="
                              flex-1
                              border
                              border-blue-600
                              text-blue-600
                              py-2.5
                              rounded-lg
                              font-semibold
                              hover:bg-blue-600
                              hover:text-white
                              transition
                              cursor-pointer
                            "
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAddress(savedAddress.addressUuid)
                            }
                            className="
                              flex-1
                              border
                              border-red-500
                              text-red-500
                              py-2.5
                              rounded-lg
                              font-semibold
                              hover:bg-red-500
                              hover:text-white
                              transition
                              cursor-pointer
                            "
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ===================================================== */}
          {/* Purchase History */}
          {/* ===================================================== */}

          <div className="mt-8 border-t border-gray-200 pt-7">
            <button
              type="button"
              onClick={handlePurchaseHistory}
              className="
                w-full
                border
                border-blue-600
                text-blue-600
                py-3
                rounded-lg
                font-semibold
                hover:bg-blue-600
                hover:text-white
                transition
                cursor-pointer
              "
            >
              {showPurchaseHistory
                ? "Hide Purchase History"
                : "Purchase History"}
            </button>
          </div>

          {showPurchaseHistory && (
            <div className="mt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5">
                Purchase History
              </h2>

              {ordersLoading ? (
                <p className="text-gray-600">Loading purchase history...</p>
              ) : orders.length === 0 ? (
                <div
                  className="
                    bg-gray-50
                    border
                    border-gray-200
                    rounded-lg
                    p-6
                    text-center
                  "
                >
                  <p className="text-gray-600">No purchases yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.orderUuid}
                      className="
                        border
                        border-gray-200
                        rounded-lg
                        p-4
                        sm:p-5
                        bg-gray-50
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          sm:flex-row
                          sm:justify-between
                          sm:items-start
                          gap-3
                        "
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">Order ID</p>

                          <p
                            className="
                              font-semibold
                              text-gray-800
                              break-all
                              text-sm
                            "
                          >
                            #{order.orderUuid}
                          </p>
                        </div>

                        <span
                          className="
                            self-start
                            px-3
                            py-1
                            rounded-full
                            bg-blue-100
                            text-blue-700
                            text-sm
                            font-medium
                          "
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Products */}

                      <div className="mt-4 space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={item.productUuid || index}
                            className="
                              flex
                              justify-between
                              gap-3
                              text-gray-700
                              text-sm
                            "
                          >
                            <span>
                              {item.name}
                              {" × "}
                              {item.quantity}
                            </span>

                            <span className="font-medium whitespace-nowrap">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Payment */}

                      <div
                        className="
                          border-t
                          border-gray-200
                          mt-4
                          pt-4
                          flex
                          justify-between
                          gap-3
                          text-gray-700
                          text-sm
                        "
                      >
                        <span className="font-medium">Payment Method</span>

                        <span className="font-semibold text-right">
                          {order.payment_method === "cod"
                            ? "Cash on Delivery"
                            : order.payment_method === "upi"
                              ? "UPI"
                              : order.payment_method === "card"
                                ? "Card"
                                : order.payment_method}
                        </span>
                      </div>

                      {/* Total */}

                      <div
                        className="
                          border-t
                          border-gray-200
                          mt-3
                          pt-4
                          flex
                          justify-between
                          font-bold
                          text-gray-800
                        "
                      >
                        <span>Total</span>

                        <span>
                          ₹
                          {Number(order.total_amount || 0).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================== */}
          {/* Logout */}
          {/* ===================================================== */}

          <div className="mt-8">
            <button
              type="button"
              onClick={handleLogout}
              className="
                w-full
                border
                border-red-600
                text-red-600
                py-3
                rounded-lg
                font-semibold
                hover:bg-red-600
                hover:text-white
                transition
                cursor-pointer
              "
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}