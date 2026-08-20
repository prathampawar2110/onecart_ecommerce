"use client";

const API_URL = "http://127.0.0.1:8000";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ users , setUsers ] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  // ----------------------------------------------------------------
  // Check Admin + Load Dashboard Data
  // ----------------------------------------------------------------

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("access_token");

      // No Login
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // ----------------------------------------------------------
        // 1. Check Admin Access
        // ----------------------------------------------------------

        const adminResponse = await fetch(`${API_URL}/admin/test`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const adminData = await adminResponse.json();

        if (!adminResponse.ok) {
          throw new Error(adminData.detail || "Admin access denied");
        }

        // Get Users
        
        const usersResponse = await fetch (`${API_URL}/admin/users` , {
          headers : {
            Authorization : `Bearer ${token}`,
          },
        }
        );

        if ( !usersResponse.ok ) {
          throw new Error("Failed to fetch users");
        }

        const usersData = await usersResponse.json();

        // ----------------------------------------------------------
        // 2. Get Products
        // ----------------------------------------------------------

        const productsResponse = await fetch(`${API_URL}/products`);

        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }

        const productsData = await productsResponse.json();

        // ----------------------------------------------------------
        // 3. Get Orders
        // ----------------------------------------------------------

        const ordersResponse = await fetch(`${API_URL}/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!ordersResponse.ok) {
          throw new Error("Failed to fetch orders");
        }

        const ordersData = await ordersResponse.json();

        // ----------------------------------------------------------
        // Store Data
        // ----------------------------------------------------------

        setUsers(usersData);
        setProducts(productsData);
        setOrders(ordersData);

        console.log("Admin Dashboard Products:", productsData);
        console.log("Admin Dashboard Orders:", ordersData);
      } catch (error) {
        console.error("Admin Dashboard Error:", error);

        setError(error.message);

        // Unauthorized / Forbidden
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  // ----------------------------------------------------------------
  // Dashboard Calculations
  // ----------------------------------------------------------------

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

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total_amount || 0),
    0,
  );

  // Latest 5 orders
  const recentOrders = orders.slice(0, 5);

  // ----------------------------------------------------------------
  // Loading
  // ----------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-base sm:text-lg md:text-xl text-gray-700 text-center">
          Checking Admin Access...
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Error
  // ----------------------------------------------------------------

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 sm:p-6 text-center max-w-md w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-2">
            Access Denied
          </h2>

          <p className="text-sm sm:text-base text-red-600 wrap-break-words">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Dashboard UI
  // ----------------------------------------------------------------

  return (
    <div className="bg-gray-100 px-3 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8">
      {/* ========================================================== */}
      {/* Header */}
      {/* ========================================================== */}

      <div className="mb-5 sm:mb-7 lg:mb-8 sm:mt-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Welcome to the OneCart Admin Panel
        </p>
      </div>

      {/* ========================================================== */}
      {/* Welcome Section */}
      {/* ========================================================== */}

      <div
        className="
          bg-white
          rounded-xl
          shadow-md
          p-4
          sm:p-6
          md:p-8
          mb-5
          sm:mb-6
        "
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Welcome Admin 👋
        </h2>

        <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
          From here you can manage products, users and orders.
        </p>
      </div>

      {/* ========================================================== */}
      {/* Main Statistics */}
      {/* ========================================================== */}

      <div
        className="
          grid
          grid-cols-1
          min-[400px]:grid-cols-2
          lg:grid-cols-3
          gap-4
          sm:gap-5
          lg:gap-6
        "
      >

        {/* -------------------------------------------------------- */}
        {/* Total Users */}
        {/* -------------------------------------------------------- */}
        {/* <div className=" bg-white
              rounded-xl
              shadow-md
              p-4
              sm:p-5
              lg:p-6
              border-l-4
              border-yellow-500
              min-w-0">

              <p className="text-sm font-medium text-gray-500">Total Users</p>
          
            <p className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2">
              {totalUsers}
            </p>
          
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Users in OneCart
            </p>
        </div> */}

        {/* -------------------------------------------------------- */}
        {/* Total Products */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            bg-white
            rounded-xl
            shadow-md
            p-4
            sm:p-5
            lg:p-6
            border-l-4
            border-blue-500
            min-w-0
          "
        >
          <p className="text-sm font-medium text-gray-500">Total Products</p>

          <p className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2">
            {totalProducts}
          </p>

          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Products in OneCart
          </p>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Total Orders */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            bg-white
            rounded-xl
            shadow-md
            p-4
            sm:p-5
            lg:p-6
            border-l-4
            border-purple-500
            min-w-0
          "
        >
          <p className="text-sm font-medium text-gray-500">Total Orders</p>

          <p className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2">
            {totalOrders}
          </p>

          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Customer orders
          </p>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Revenue */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            bg-white
            rounded-xl
            shadow-md
            p-4
            sm:p-5
            lg:p-6
            border-l-4
            border-green-500
            min-w-0
          "
        >
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>

          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-2 wrap-break-words">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>

          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            From all orders
          </p>
        </div>
      </div>

      {/* ========================================================== */}
      {/* Order Status Cards */}
      {/* ========================================================== */}

      <div className="mt-6 sm:mt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
          Order Status
        </h2>

        <div
          className="
            grid
            grid-cols-1
            min-[400px]:grid-cols-2
            lg:grid-cols-3
            gap-4
            sm:gap-5
            lg:gap-6
          "
        >
          {/* Processing */}

          <div
            className="
              bg-yellow-50
              border
              border-yellow-200
              rounded-xl
              p-4
              sm:p-5
              min-w-0
            "
          >
            <p className="text-sm font-medium text-yellow-700">Processing</p>

            <p className="text-3xl font-bold text-yellow-800 mt-2">
              {processingOrders}
            </p>
          </div>

          {/* Dispatched */}

          <div
            className="
              bg-blue-50
              border
              border-blue-200
              rounded-xl
              p-4
              sm:p-5
              min-w-0
            "
          >
            <p className="text-sm font-medium text-blue-700">Dispatched</p>

            <p className="text-3xl font-bold text-blue-800 mt-2">
              {dispatchedOrders}
            </p>
          </div>

          {/* Delivered */}

          <div
            className="
              bg-green-50
              border
              border-green-200
              rounded-xl
              p-4
              sm:p-5
              min-w-0
            "
          >
            <p className="text-sm font-medium text-green-700">Delivered</p>

            <p className="text-3xl font-bold text-green-800 mt-2">
              {deliveredOrders}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* Recent Orders */}
      {/* ========================================================== */}

      <div className="mt-6 sm:mt-8">
        {/* Section Header */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-3
            mb-4
          "
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Recent Orders
          </h2>

          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            className="
              w-full
              sm:w-auto
              px-4
              py-2.5
              bg-blue-600
              text-white
              rounded-lg
              text-sm
              font-semibold
              hover:bg-blue-700
              transition
              cursor-pointer
            "
          >
            View All Orders
          </button>
        </div>

        {/* -------------------------------------------------------- */}
        {/* No Orders */}
        {/* -------------------------------------------------------- */}

        {recentOrders.length === 0 ? (
          <div
            className="
              bg-white
              rounded-xl
              shadow-md
              p-6
              sm:p-8
              text-center
            "
          >
            <p className="text-gray-500 text-sm sm:text-base">No orders yet.</p>
          </div>
        ) : (
          <div
            className="
              bg-white
              rounded-xl
              shadow-md
              overflow-hidden
            "
          >
            {/* ==================================================== */}
            {/* Desktop Table */}
            {/* ==================================================== */}

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-175">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="text-left px-5 py-4">Order ID</th>

                    <th className="text-left px-5 py-4">User Name</th>

                    <th className="text-left px-5 py-4">Total</th>

                    <th className="text-left px-5 py-4">Status</th>

                    <th className="text-left px-5 py-4">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr
                      key={order.orderUuid || `order-${index}`}
                      className="
                        border-b
                        border-gray-200
                        hover:bg-gray-50
                      "
                    >
                      {/* Order ID */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-800 font-medium break-all">
                          {order.orderUuid}
                        </span>
                      </td>

                      {/* User */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700 wrap-break-words">
                          {order.userName || "Unknown User"}
                        </span>
                      </td>

                      {/* Total */}

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                          ₹
                          {Number(order.total_amount || 0).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        <span
                          className={`
                            inline-flex
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-semibold
                            whitespace-nowrap

                            ${
                              order.status === "Processing"
                                ? "bg-yellow-100 text-yellow-700"
                                : order.status === "Dispatched"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                            }
                          `}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Date */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700 whitespace-nowrap">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ==================================================== */}
            {/* Mobile + Tablet Cards */}
            {/* ==================================================== */}

            <div className="lg:hidden divide-y divide-gray-200">
              {recentOrders.map((order, index) => (
                <div
                  key={order.orderUuid || `order-${index}`}
                  className="
                    p-4
                    sm:p-5
                  "
                >
                  {/* ------------------------------------------------ */}
                  {/* Order Header */}
                  {/* ------------------------------------------------ */}

                  <div
                    className="
                      flex
                      flex-col
                      min-[400px]:flex-row
                      min-[400px]:justify-between
                      min-[400px]:items-start
                      gap-3
                    "
                  >
                    {/* Order ID */}

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Order ID</p>

                      <p className="text-sm font-semibold text-gray-800 break-all">
                        {order.orderUuid}
                      </p>
                    </div>

                    {/* Status */}

                    <span
                      className={`
                        self-start
                        shrink-0
                        inline-flex
                        px-2.5
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        whitespace-nowrap

                        ${
                          order.status === "Processing"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "Dispatched"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                        }
                      `}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* ------------------------------------------------ */}
                  {/* Order Information */}
                  {/* ------------------------------------------------ */}

                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-1
                      min-[400px]:grid-cols-2
                      gap-4
                    "
                  >
                    {/* User */}

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 mb-1">User</p>

                      <p className="text-sm text-gray-700 wrap-break-words">
                        {order.userName || "Unknown User"}
                      </p>
                    </div>

                    {/* Total */}

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total</p>

                      <p className="text-sm font-semibold text-gray-800">
                        ₹
                        {Number(order.total_amount || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    {/* Date */}

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>

                      <p className="text-sm text-gray-700">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Products */}

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Products</p>

                      <p className="text-sm text-gray-700">
                        {order.items?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}