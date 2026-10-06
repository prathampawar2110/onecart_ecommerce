"use client";

const API_URL = "http://127.0.0.1:8000";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  PackageCheck,
  ReceiptText,
  Search,
  Truck,
  X,
} from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      key: "all",
      label: "Total orders",
      value: orders.length,
      icon: ReceiptText,
      activeRing: "ring-2 ring-slate-950 border-transparent",
      iconBg: "bg-slate-100 text-slate-700",
      badge: "All Orders",
    },
    {
      key: "Processing",
      label: "Processing",
      value: processingOrders,
      icon: Clock3,
      activeRing: "ring-2 ring-amber-500 border-transparent",
      iconBg: "bg-amber-50 text-amber-700",
      badge: "Needs Processing",
    },
    {
      key: "Dispatched",
      label: "Dispatched",
      value: dispatchedOrders,
      icon: Truck,
      activeRing: "ring-2 ring-sky-500 border-transparent",
      iconBg: "bg-sky-50 text-sky-700",
      badge: "On the way",
    },
    {
      key: "Delivered",
      label: "Delivered",
      value: deliveredOrders,
      icon: PackageCheck,
      activeRing: "ring-2 ring-emerald-500 border-transparent",
      iconBg: "bg-emerald-50 text-emerald-700",
      badge: "Completed",
    },
  ];

  // --------------------------------------------------
  // Filter & Search Logic
  // --------------------------------------------------

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      const shortOrderId = formatOrderId(order.orderUuid).toLowerCase();
      const matchesId =
        order.orderUuid?.toLowerCase().includes(search) ||
        shortOrderId.includes(search);
      const matchesUser = order.userName?.toLowerCase().includes(search);
      const matchesProducts = order.items?.some((item) =>
        (item.productName || item.name || "").toLowerCase().includes(search)
      );

      if (!matchesId && !matchesUser && !matchesProducts) {
        return false;
      }
    }

    return true;
  });

  // --------------------------------------------------
  // Pagination Calculations
  // --------------------------------------------------

  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }

  function handleItemsPerPageChange(event) {
    const newLimit = Number(event.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-lg bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
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
            Review, process, dispatch, and close customer orders. Click cards below to filter.
          </p>
        </header>

        {/* --------------------------------------------------
            Interactive Filter Cards
        -------------------------------------------------- */}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const isSelected = statusFilter === card.key;

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => {
                  setStatusFilter(card.key);
                  setCurrentPage(1);
                }}
                className={`relative flex cursor-pointer flex-col justify-between rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:shadow-md ${
                  isSelected
                    ? `${card.activeRing} bg-slate-50/50 shadow-md`
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {card.label}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {card.value}
                    </p>
                  </div>

                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400">
                    {card.badge}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-blue-200">
                      Active Filter
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </section>

        {/* --------------------------------------------------
            Search & Filter Status Bar
        -------------------------------------------------- */}

        {/* <section className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID, customer name, or product name..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-950 shadow-xs outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            Active filter pill
            {statusFilter !== "all" && (
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                <span>Filter: <strong>{statusFilter}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="cursor-pointer text-slate-400 hover:text-slate-600"
                  title="Clear filter"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="text-xs font-medium text-slate-500">
              Total Revenue: <strong className="text-slate-950">{formatCurrency(totalRevenue)}</strong>
            </div>
          </div>
        </section> */}

        {/* --------------------------------------------------
            Orders Table / Cards
        -------------------------------------------------- */}

        {orders.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-600">
              No orders found.
            </p>
          </div>
        ) : (
          <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {/* Desktop View */}
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
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order, index) => (
                      <tr
                        key={order.orderUuid || `order-${index}`}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
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
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-10 text-center text-sm text-slate-500"
                      >
                        {searchText || statusFilter !== "all"
                          ? "No orders match your filter criteria."
                          : "No orders available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="divide-y divide-slate-100 lg:hidden">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order, index) => (
                  <article
                    key={order.orderUuid || `mobile-order-${index}`}
                    className="p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Order
                        </p>

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
                ))
              ) : (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  {searchText || statusFilter !== "all"
                    ? "No orders match your filter criteria."
                    : "No orders available."}
                </div>
              )}
            </div>

            {/* ==================================================
                PAGINATION CONTROLS
            ================================================== */}

            {totalItems > 0 && (
              <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Pagination Info & Page Size Selector */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span>
                    Showing{" "}
                    <span className="font-bold text-slate-900">
                      {startIndex + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-slate-900">
                      {endIndex}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-slate-900">
                      {totalItems}
                    </span>{" "}
                    orders
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Rows per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-1.5 self-center sm:self-auto">
                  {/* First Page */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(1)}
                    disabled={safeCurrentPage === 1}
                    title="First page"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>

                  {/* Previous Page */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    title="Previous page"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        return (
                          p === 1 ||
                          p === totalPages ||
                          Math.abs(p - safeCurrentPage) <= 1
                        );
                      })
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) {
                          acc.push("ellipsis-" + p);
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item) => {
                        if (typeof item === "string") {
                          return (
                            <span
                              key={item}
                              className="px-1 text-xs font-bold text-slate-400"
                            >
                              ...
                            </span>
                          );
                        }

                        const isActive = item === safeCurrentPage;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => handlePageChange(item)}
                            className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg px-2.5 text-xs font-bold transition shadow-xs ${
                              isActive
                                ? "bg-slate-950 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                  </div>

                  {/* Next Page */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    title="Next page"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    title="Last page"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}