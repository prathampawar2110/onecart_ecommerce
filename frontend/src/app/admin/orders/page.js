"use client";

const API_URL = "http://127.0.0.1:8000";

import { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -------------------------------------------------------------------
  // Fetch Orders
  // -------------------------------------------------------------------

  useEffect(() => {
    async function fetchOrders() {
      try {
        setError("");

        const token = localStorage.getItem("access_token");

        // No token
        if (!token) {
          setError("Please login as an admin.");
          return;
        }

        const response = await fetch(`${API_URL}/admin/orders`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        console.log("Admin Orders:", data);

        if (!response.ok) {
          throw new Error(
            data.detail || "You are not authorized to access admin orders.",
          );
        }

        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch Admin Orders:", error);

        setError(error.message || "Failed to fetch admin orders.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // -------------------------------------------------------------------
  // Update Order Status
  // -------------------------------------------------------------------

  async function updateOrderStatus(orderUuid, newStatus) {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Please login as an admin.");
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/orders/${orderUuid}/status?status=${encodeURIComponent(
          newStatus,
        )}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update order status");
      }

      console.log("Order Status Updated:", data);

      // Update only changed order
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.orderUuid === orderUuid
            ? {
                ...order,
                status: newStatus,
              }
            : order,
        ),
      );
    } catch (error) {
      console.error("Failed to update order status:", error);

      alert(error.message);
    }
  }

  // -------------------------------------------------------------------
  // Status Classes
  // -------------------------------------------------------------------

  function getStatusClasses(status) {
    if (status === "Processing") {
      return `
        bg-yellow-50
        border-yellow-300
        text-yellow-700
      `;
    }

    if (status === "Dispatched") {
      return `
        bg-blue-50
        border-blue-300
        text-blue-700
      `;
    }

    return `
      bg-green-50
      border-green-300
      text-green-700
    `;
  }

  // -------------------------------------------------------------------
  // Status Dropdown
  // -------------------------------------------------------------------

  function StatusDropdown({ order }) {
    return (
      <select
        value={order.status}
        onChange={(event) =>
          updateOrderStatus(order.orderUuid, event.target.value)
        }
        disabled={order.status === "Delivered"}
        className={`
          w-full
          sm:w-auto
          min-w-35
          px-3
          py-2
          rounded-lg
          border
          font-semibold
          text-sm
          shadow-sm
          transition-all
          duration-200
          focus:outline-none
          focus:ring-2
          cursor-pointer

          ${getStatusClasses(order.status)}

          ${
            order.status === "Delivered"
              ? "cursor-not-allowed"
              : "hover:opacity-90"
          }
        `}
      >
        {order.status === "Processing" && (
          <>
            <option value="Processing">Processing</option>

            <option value="Dispatched">Dispatched</option>
          </>
        )}

        {order.status === "Dispatched" && (
          <>
            <option value="Dispatched">Dispatched</option>

            <option value="Delivered">Delivered</option>
          </>
        )}

        {order.status === "Delivered" && (
          <option value="Delivered">Delivered</option>
        )}
      </select>
    );
  }

  // -------------------------------------------------------------------
  // Loading
  // -------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <p className="text-lg sm:text-xl text-blue-500 text-center">
          Loading Orders...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Error
  // -------------------------------------------------------------------

  if (error) {
    return (
      <div className="min-h-[60vh] bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-red-600 mb-3">
              Access Denied
            </h1>

            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // Main UI
  // -------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* ============================================================= */}
      {/* Header & Orders */}
      {/* ============================================================= */}
      <div className="flex items-center justify-between">
   
        <div className="mb-6 sm:mb-8 sm:mt-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Orders</h1>

          <p className="text-gray-700 mt-1 text-sm sm:text-base">
            Manage OneCart customer orders
          </p>
        </div>

        <div className="w-full sm:w-auto inline-block bg-white rounded-xl shadow-md
          px-2 sm:px-4 py-1 border-l-4 border-blue-500 mb-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{orders.length}</p>
        </div>
      </div>

      {/* ============================================================= */}
      {/* No Orders */}
      {/* ============================================================= */}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-600 text-lg">No orders found.</p>
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* DESKTOP TABLE */}
          {/* ========================================================= */}

          <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="text-left px-5 py-4">Order ID</th>

                    <th className="text-left px-5 py-4">Customer</th>

                    <th className="text-left px-5 py-4">Product Name</th>

                    <th className="text-left px-5 py-4">Total</th>

                    <th className="text-left px-5 py-4">Status</th>

                    <th className="text-left px-5 py-4">Order Date</th>

                    <th className="text-left px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={order.orderUuid || `order-${index}`}
                      className="
                        border-b
                        border-gray-200
                        hover:bg-gray-50
                      "
                    >
                      {/* Order UUID */}

                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold text-black break-all">
                          {order.orderUuid}
                        </span>
                      </td>

                      {/* User Name */}

                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold text-black break-all">
                          {order.userName}
                        </span>
                      </td>

                      {/* Products */}

                      <td className="px-5 py-4 text-black">
                        <div className="space-y-1">
                          {order.items?.map((item, itemIndex) => (
                            <div
                              key={item.productUuid || itemIndex}
                              className="text-sm"
                            >
                              {item.productName || item.name || "Product"}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total */}

                      <td className="px-5 py-4 text-black font-semibold">
                        ₹{order.total_amount}
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        <span
                          className={`
                            inline-flex
                            px-3
                            py-1
                            rounded-full
                            text-sm
                            font-semibold
                            border

                            ${getStatusClasses(order.status)}
                          `}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Date */}

                      <td className="px-5 py-4 text-black whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>

                      {/* Action */}

                      <td className="px-5 py-4">
                        <StatusDropdown order={order} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================= */}
          {/* MOBILE + TABLET CARDS */}
          {/* ========================================================= */}

          <div className="lg:hidden space-y-4">
            {orders.map((order, index) => (
              <div
                key={order.orderUuid || `order-${index}`}
                className="
                  bg-white
                  rounded-xl
                  shadow-md
                  border
                  border-gray-200
                  p-4
                  sm:p-5
                "
              >
                {/* --------------------------------------------------- */}
                {/* Order Header */}
                {/* --------------------------------------------------- */}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Order ID</p>

                    <p className="text-sm font-semibold text-gray-800 break-all">
                      {order.orderUuid}
                    </p>
                  </div>

                  <span
                    className={`
                      self-start
                      inline-flex
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      sm:text-sm
                      font-semibold
                      border

                      ${getStatusClasses(order.status)}
                    `}
                  >
                    {order.status}
                  </span>
                </div>

                {/* --------------------------------------------------- */}
                {/* User UUID */}
                {/* --------------------------------------------------- */}

                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">Customer</p>

                  <p className="text-sm text-gray-800 break-all">
                    {order.userName || "Unknown User"}
                  </p>
                </div>

                {/* --------------------------------------------------- */}
                {/* Products */}
                {/* --------------------------------------------------- */}

                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Products</p>

                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {order.items?.map((item, itemIndex) => (
                      <div
                        key={item.productUuid || itemIndex}
                        className="
                            flex
                            justify-between
                            items-start
                            gap-3
                            text-sm
                          "
                      >
                        <span className="text-gray-800">
                          {item.productName || item.name || "Product"}

                          <span className="text-gray-500">
                            {" × "}
                            {item.quantity}
                          </span>
                        </span>

                        <span className="font-semibold text-gray-800 whitespace-nowrap">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --------------------------------------------------- */}
                {/* Total + Date */}
                {/* --------------------------------------------------- */}

                <div
                  className="
                    mt-4
                    pt-4
                    border-t
                    border-gray-200
                    flex
                    justify-between
                    items-center
                    gap-4
                  "
                >
                  <div>
                    <p className="text-xs text-gray-500">Date</p>

                    <p className="text-sm font-medium text-gray-800">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>

                    <p className="text-lg font-bold text-blue-600">
                      ₹{order.total_amount}
                    </p>
                  </div>
                </div>

                {/* --------------------------------------------------- */}
                {/* Action */}
                {/* --------------------------------------------------- */}

                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Update Status</p>

                  <StatusDropdown order={order} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}