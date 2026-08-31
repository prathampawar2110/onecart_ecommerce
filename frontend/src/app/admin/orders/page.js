"use client";

const API_URL = "http://127.0.0.1:8000";

import { useEffect, useState } from "react";
import { Clock3, PackageCheck, ReceiptText, Truck } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setError("");

        const token = localStorage.getItem("access_token");

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

        if (!response.ok) {
          throw new Error(
            data.detail || "You are not authorized to access admin orders.",
          );
        }

        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (error) {
        console.error("Failed to fetch Admin Orders:", error);
        setError(error.message || "Failed to fetch admin orders.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

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

  function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  function formatDate(date) {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ==========================================================
  // ⭐ NEW — SHORT ORDER ID FOR ADMIN DISPLAY
  // ==========================================================
  function formatOrderId(orderUuid) {
    if (!orderUuid) {
      return "N/A";
    }

    return `ORD-${orderUuid.slice(-5).toUpperCase()}`;
  }

  function getStatusClasses(status) {
    if (status === "Processing") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (status === "Dispatched") {
      return "border-sky-200 bg-sky-50 text-sky-700";
    }

    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  function StatusDropdown({ order }) {
    return (
      <select
        value={order.status}
        onChange={(event) =>
          updateOrderStatus(order.orderUuid, event.target.value)
        }
        disabled={order.status === "Delivered"}
        className={`
          w-full min-w-36 rounded-lg border px-3 py-2 text-sm font-bold
          shadow-sm outline-none transition focus:ring-4
          ${
            order.status === "Delivered"
              ? "cursor-not-allowed opacity-80"
              : "cursor-pointer hover:opacity-90"
          }
          ${getStatusClasses(order.status)}
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

  const processingOrders = orders.filter(
    (order) => order.status === "Processing",
  ).length;

  const dispatchedOrders = orders.filter(
    (order) => order.status === "Dispatched",
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered",
  ).length;

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0,
  );

  const summaryCards = [
    {
      label: "Total orders",
      value: orders.length,
      icon: ReceiptText,
      className: "bg-slate-100 text-slate-700",
    },
    {
      label: "Processing",
      value: processingOrders,
      icon: Clock3,
      className: "bg-amber-50 text-amber-700",
    },
    {
      label: "Dispatched",
      value: dispatchedOrders,
      icon: Truck,
      className: "bg-sky-50 text-sky-700",
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      icon: PackageCheck,
      className: "bg-emerald-50 text-emerald-700",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-40 rounded bg-slate-200 animate-pulse" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-lg bg-white shadow-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-red-700">Access Denied</h1>

          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-slate-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Fulfillment
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Review, process, dispatch, and close customer orders.
          </p>
        </header>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {card.value}
                    </p>
                  </div>

                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.className}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Order Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Total booked value: {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </section>

        {orders.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-600">
              No orders found.
            </p>
          </div>
        ) : (
          <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-248">
                <thead className="bg-slate-950 text-white">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      Order ID
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      Products
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      Total
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      Update
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {orders.map((order, index) => (
                    <tr
                      key={order.orderUuid || `order-${index}`}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        {/* ⭐ CHANGED — show short order ID */}
                        <p className="text-sm font-semibold text-slate-950">
                          {formatOrderId(order.orderUuid)}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {order.userName || "Unknown User"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="max-w-[18rem] space-y-1">
                          {order.items?.map((item, itemIndex) => (
                            <p
                              key={item.productUuid || itemIndex}
                              className="truncate text-sm text-slate-500"
                            >
                              {item.productName || item.name || "Product"}

                              <span className="text-slate-400">
                                {" "}
                                x {item.quantity}
                              </span>
                            </p>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-950">
                        {formatCurrency(order.total_amount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusDropdown order={order} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {orders.map((order, index) => (
                <article
                  key={order.orderUuid || `mobile-order-${index}`}
                  className="p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Order
                      </p>

                      {/* ⭐ CHANGED — show short order ID */}
                      <p className="mt-1 text-sm font-bold text-slate-950">
                        {formatOrderId(order.orderUuid)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Products
                    </p>

                    <div className="mt-2 space-y-2">
                      {order.items?.map((item, itemIndex) => (
                        <div
                          key={item.productUuid || itemIndex}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span className="text-slate-700">
                            {item.productName || item.name || "Product"}

                            <span className="text-slate-400">
                              {" "}
                              x {item.quantity}
                            </span>
                          </span>

                          <span className="font-semibold text-slate-950">
                            {formatCurrency(
                              Number(item.price || 0) *
                                Number(item.quantity || 0),
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Customer</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {order.userName || "Unknown User"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Total</p>

                      <p className="mt-1 text-sm font-bold text-slate-950">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Date</p>

                      <p className="mt-1 text-sm text-slate-700">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Update</p>

                      <div className="mt-1">
                        <StatusDropdown order={order} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}