"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  SquarePlus,
  Users,
} from "lucide-react";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: SquarePlus,
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
    },
  ];

  function handleLogout() {
    localStorage.removeItem("access_token");
    setShowLogoutPopup(false);
    router.replace("/login");
  }

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 z-40 flex w-16 flex-col overflow-y-auto overflow-x-hidden border-r border-slate-200 bg-white shadow-sm sm:w-60">
        <div className="shrink-0 border-b border-slate-200 p-3 sm:p-5">
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-bold text-white">
              OC
            </div>

            <div className="hidden min-w-0 sm:block">
              <h1 className="truncate text-lg font-bold text-slate-950">
                OneCart
              </h1>

              <p className="text-xs font-medium text-slate-500">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-2 sm:p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`
                  flex items-center justify-center gap-3 rounded-lg px-3 py-3
                  text-sm font-semibold transition sm:justify-start
                  ${
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }
                `}
              >
                <Icon className="h-5 w-5 shrink-0" />

                <span className="hidden truncate sm:inline">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-2 sm:p-3">
          <button
            type="button"
            onClick={() => setShowLogoutPopup(true)}
            title="Logout"
            className="flex cursor-pointer w-full items-center justify-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700 sm:justify-start"
          >
            <LogOut className="h-5 w-5 shrink-0" />

            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </aside>

      {showLogoutPopup && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-950">Logout</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to logout from the admin panel?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutPopup(false)}
                className="flex-1 cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 cursor-pointer rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
