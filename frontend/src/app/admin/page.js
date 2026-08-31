"use client";

const API_URL = "http://127.0.0.1:8000";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Boxes,
  Clock3,
  IndianRupee,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const [usersResponse, productsResponse, ordersResponse] =
          await Promise.all([
            fetch(`${API_URL}/admin/users`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch(`${API_URL}/products`),

            fetch(`${API_URL}/admin/orders`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const usersData = await usersResponse.json();
        const productsData = await productsResponse.json();
        const ordersData = await ordersResponse.json();

        if (!usersResponse.ok) {
          throw new Error(usersData.detail || "Failed to fetch users");
        }

        if (!productsResponse.ok) {
          throw new Error(productsData.detail || "Failed to fetch products");
        }

        if (!ordersResponse.ok) {
          throw new Error(ordersData.detail || "Failed to fetch orders");
        }

        // setUsers(usersData);
        // setProducts(productsData);
        // setOrders(ordersData);

        setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
        setProducts(
          Array.isArray(productsData)
            ? productsData
            : productsData.products || [],
        );
        setOrders(
          Array.isArray(ordersData) ? ordersData : ordersData.orders || [],
        );
        
      } catch (error) {
        console.error("Admin Dashboard Error:", error);

        setError(error.message);

        router.replace("/");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const totalUsers = users.length;
  const totalProducts = products.length;
  const totalOrders = orders.length;

  const processingOrders = orders.filter(
    (order) => order.status === "Processing",
  ).length;

  const dispatchedOrders = orders.filter(
    (order) => order.status === "Dispatched",
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered",
  ).length;

  const activeOrders = processingOrders + dispatchedOrders;

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0,
  );

  const activeOrderValue = orders
    .filter((order) => order.status !== "Delivered")
    .reduce((total, order) => total + Number(order.total_amount || 0), 0);

  const averageOrderValue =
    totalOrders === 0 ? 0 : Math.round(totalRevenue / totalOrders);

  const fulfillmentRate =
    totalOrders === 0 ? 0 : Math.round((deliveredOrders / totalOrders) * 100);

  const lowStockProducts = products.filter(
    (product) => Number(product.stock || 0) > 0 && Number(product.stock) <= 15,
  ).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock || 0) === 0,
  ).length;

  const recentOrders = orders.slice(0, 5);

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

  function formatOrderId(orderUuid) {
    if (!orderUuid) {
      return "N/A";
    }

    return `ORD-${orderUuid.slice(-5).toUpperCase()}`;
  }

  function getStatusClasses(status) {
    if (status === "Processing") {
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    }

    if (status === "Dispatched") {
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    }

    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }

  const metricCards = [
    {
      label: "Revenue",
      value: formatCurrency(totalRevenue),
      note: `${formatCurrency(averageOrderValue)} average order value`,
      icon: IndianRupee,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Orders",
      value: totalOrders,
      note: `${activeOrders} active orders need attention`,
      icon: ReceiptText,
      accent: "bg-blue-50 text-blue-700",
    },
    {
      label: "Products",
      value: totalProducts,
      note: `${lowStockProducts + outOfStockProducts} products need stock review`,
      icon: Boxes,
      accent: "bg-violet-50 text-violet-700",
    },
    {
      label: "Customers",
      value: totalUsers,
      note: "Registered OneCart users",
      icon: Users,
      accent: "bg-orange-50 text-orange-700",
    },
  ];

  const statusCards = [
    {
      label: "Processing",
      value: processingOrders,
      note: "Pack and prepare",
      icon: Clock3,
      className: "border-amber-200 bg-amber-50 text-amber-900",
      iconClassName: "bg-amber-100 text-amber-700",
    },
    {
      label: "Dispatched",
      value: dispatchedOrders,
      note: "In transit",
      icon: Truck,
      className: "border-sky-200 bg-sky-50 text-sky-900",
      iconClassName: "bg-sky-100 text-sky-700",
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      note: `${fulfillmentRate}% fulfillment rate`,
      icon: PackageCheck,
      className: "border-emerald-200 bg-emerald-50 text-emerald-900",
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-52 rounded bg-slate-200 animate-pulse" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-36 rounded-lg bg-white shadow-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-6">
        <div className="bg-white border border-red-200 rounded-lg p-5 sm:p-6 text-center max-w-md w-full shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-2">
            Unable to Load Dashboard
          </h2>

          <p className="text-sm sm:text-base text-red-600 wrap-break-words">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              OneCart Admin
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Commerce Overview
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base">
              Track revenue, fulfillment, inventory health, and the latest
              customer orders from one operational view.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="inline-flex items-center justify-center gap-2 cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <ShoppingBag className="h-4 w-4" />
              Products
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/orders")}
              className="inline-flex items-center justify-center gap-2 cursor-pointer rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <ReceiptText className="h-4 w-4" />
              Orders
            </button>
          </div>
        </header>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                key={metric.label}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {metric.label}
                    </p>

                    <p className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">
                      {metric.value}
                    </p>
                  </div>

                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${metric.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                <p className="mt-4 text-sm leading-5 text-slate-500">
                  {metric.note}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Fulfillment Pipeline
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Open work, dispatched orders, and completed deliveries.
                </p>
              </div>

              <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {activeOrders} active
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {statusCards.map((status) => {
                const Icon = status.icon;

                return (
                  <article
                    key={status.label}
                    className={`rounded-lg border p-4 ${status.className}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {status.label}
                        </p>

                        <p className="mt-3 text-3xl font-bold">
                          {status.value}
                        </p>
                      </div>

                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${status.iconClassName}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>

                    <p className="mt-3 text-sm opacity-75">{status.note}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Store Health
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Quick signals for daily admin checks.
                </p>
              </div>

              <WalletCards className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Active order value
                  </p>

                  <p className="text-xs text-slate-400">
                    Processing and dispatched
                  </p>
                </div>

                <p className="text-sm font-bold text-slate-950">
                  {formatCurrency(activeOrderValue)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Low stock
                  </p>

                  <p className="text-xs text-slate-400">
                    15 units or fewer
                  </p>
                </div>

                <p className="text-sm font-bold text-amber-700">
                  {lowStockProducts}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Out of stock
                  </p>

                  <p className="text-xs text-slate-400">
                    Needs replenishment
                  </p>
                </div>

                <p className="text-sm font-bold text-red-600">
                  {outOfStockProducts}
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-5">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest customer orders for quick review and follow-up.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin/orders")}
              className="inline-flex w-full items-center justify-center gap-2 cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              View all
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-600">
                No orders yet.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-176">
                  <thead className="bg-slate-950 text-white">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                        Order
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                        Items
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
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((order, index) => (
                      <tr
                        key={order.orderUuid || `order-${index}`}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="max-w-70 truncate text-sm font-semibold text-slate-900">
                            {formatOrderId(order.orderUuid)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-700">
                            {order.userName || "Unknown User"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-500">
                            {order.items?.length || 0}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-950">
                            {formatCurrency(order.total_amount)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-500">
                            {formatDate(order.created_at)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {recentOrders.map((order, index) => (
                  <article
                    key={order.orderUuid || `mobile-order-${index}`}
                    className="p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Order
                        </p>

                        <p className="mt-1 break-all text-sm font-bold text-slate-950">
                          {formatOrderId(order.orderUuid)}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
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
                        <p className="text-xs text-slate-400">Items</p>

                        <p className="mt-1 text-sm text-slate-700">
                          {order.items?.length || 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Date</p>

                        <p className="mt-1 text-sm text-slate-700">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}