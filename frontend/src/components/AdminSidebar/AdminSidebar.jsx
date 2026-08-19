"use client";

import Link from "next/link";
import {
  LayoutDashboard, Package, Users, ShoppingCart, LogOut,
  SquarePlus, } from "lucide-react";

import { useState } from "react";
import { useRouter } from "next/navigation";

// =====================================================================================

export default function AdminSidebar() {
  const router = useRouter();

  // Logout confirmation popup
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);

    
  // LOGOUT
  
  function handleLogout() {
    localStorage.removeItem("access_token");

    setShowLogoutPopup(false);

    // setShowProfileMenu(false);

    // setIsLoggedIn(false);

    router.push("/login");
  }

  // =====================================================================================

  return (
    <aside
      className="
        fixed
        left-0
        top-14
        sm:top-16
        z-50
        h-[calc(100vh-56px)]
        sm:h-[calc(100vh-64px)]

        w-20
        sm:w-64

        bg-white
        text-black
        shadow-lg

        flex
        flex-col

        overflow-y-auto
      "
    >
      {/* ================================================================ */}
      {/* LOGO */}
      {/* ================================================================ */}

      <div
        className="
          p-3
          sm:p-6
          border-b
          border-gray-200
          shrink-0
        "
      >
        <h1
          className="
            text-lg
            sm:text-2xl
            font-bold
            text-center
            sm:text-left
          "
        >
          OneCart
        </h1>

        <p
          className="
            hidden
            sm:block
            text-sm
            text-black
            mt-1
          "
        >
          Admin Panel
        </p>
      </div>

      {/* ================================================================ */}
      {/* NAVIGATION */}
      {/* ================================================================ */}

      <nav
        className="
          flex-1
          p-2
          sm:p-4
          space-y-2
          bg-blue-100
        "
      >
        {/* Dashboard */}

        <Link
          href="/admin"
          title="Dashboard"
          className="
            flex
            items-center
            justify-center
            sm:justify-start
            gap-3

            px-3
            sm:px-4

            py-3

            rounded-lg

            hover:bg-yellow-300
            transition

            text-black
          "
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />

          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        {/* Categories */}

        <Link
          href="/admin/categories"
          title="Categories"
          className="
            flex
            items-center
            justify-center
            sm:justify-start
            gap-3

            px-3
            sm:px-4

            py-3

            rounded-lg

            hover:bg-yellow-300
            transition

            text-black
          "
        >
          <SquarePlus className="w-5 h-5 shrink-0" />

          <span className="hidden sm:inline">Categories</span>
        </Link>

        {/* Products */}

        <Link
          href="/admin/products"
          title="Products"
          className="
            flex
            items-center
            justify-center
            sm:justify-start
            gap-3

            px-3
            sm:px-4

            py-3

            rounded-lg

            hover:bg-yellow-300
            transition

            text-black
          "
        >
          <Package className="w-5 h-5 shrink-0" />

          <span className="hidden sm:inline">Products</span>
        </Link>

        {/* Orders */}

        <Link
          href="/admin/orders"
          title="Orders"
          className="
            flex
            items-center
            justify-center
            sm:justify-start
            gap-3

            px-3
            sm:px-4

            py-3

            rounded-lg

            hover:bg-yellow-300
            transition

            text-black
          "
        >
          <ShoppingCart className="w-5 h-5 shrink-0" />

          <span className="hidden sm:inline">Orders</span>
        </Link>

        {/* Users */}

        <Link
          href="/admin/users"
          title="Users"
          className="
            flex
            items-center
            justify-center
            sm:justify-start
            gap-3

            px-3
            sm:px-4

            py-3

            rounded-lg

            hover:bg-yellow-300
            transition

            text-black
          "
        >
          <Users className="w-5 h-5 shrink-0" />

          <span className="hidden sm:inline">Users</span>
        </Link>
      </nav>

      {/* ================================================================ */}
      {/* LOGOUT */}
      {/* ================================================================ */}

      <div
        className="
          p-2
          sm:p-4
          border-t
          border-gray-200
          shrink-0
        "
      >
        <button
          onClick={ ()=> setShowLogoutPopup(true) }
          title="Logout"
          className="
            w-full

            flex
            items-center
            justify-center
            sm:justify-start
            gap-3

            px-3
            sm:px-4

            py-3

            rounded-lg

            border-2
            border-red-500
            text-black

            hover:bg-red-600
            hover:text-white

            transition
            cursor-pointer
          "
        >
          <LogOut className="w-5 h-5 shrink-0" />

          <span className="hidden sm:inline">LogOut</span>
        </button>

      </div>

      

      {showLogoutPopup && (
        <div
          className="
            fixed
            inset-0

            z-100

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

              bg-white

              rounded-xl

              shadow-2xl

              p-6
            "
          >
            {/* Title */}

            <h2 className="text-xl font-bold text-gray-800">
              Logout
            </h2>

            {/* Message */}

            <p className="mt-2 text-gray-600">
              Are you sure you want to logout?
            </p>

            {/* Buttons */}

            <div className="flex gap-3 mt-6">
              {/* Cancel */}

              <button
                onClick={() => setShowLogoutPopup(false)}
                className="
                  flex-1

                  px-4
                  py-2.5

                  rounded-lg

                  border
                  border-gray-300

                  text-gray-700

                  hover:bg-gray-100

                  transition

                  cursor-pointer
                "
              >
                Cancel
              </button>

              {/* Confirm Logout */}

              <button
                onClick={handleLogout}
                className="
                  flex-1

                  px-4
                  py-2.5

                  rounded-lg

                  bg-red-500

                  text-white

                  hover:bg-red-600

                  transition

                  cursor-pointer
                "
              >
                Logout
              </button>
              
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}