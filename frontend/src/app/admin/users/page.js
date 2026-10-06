"use client";

const API_URL = "http://127.0.0.1:8000";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

export default function AdminUsers() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Pagination
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/admin/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to fetch users");
        }

        setUsers(data);
      } catch (error) {
        console.error("Admin Users Error:", error);
        setError(error.message);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

  function formatCreatedDate(createdAt) {
    if (!createdAt) {
      return "N/A";
    }

    return new Date(createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ==========================================================
  // SHORT USER ID FOR ADMIN DISPLAY
  // ==========================================================
  function formatUserId(userUuid) {
    if (!userUuid) {
      return "N/A";
    }

    return `USR-${userUuid.slice(-5).toUpperCase()}`;
  }

  function getRoleClasses(role) {
    if (role === "admin") {
      return "bg-violet-50 text-violet-700 ring-1 ring-violet-200";
    }

    return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
  }

  const adminUsers = users.filter(
    (user) => user.role === "admin",
  ).length;

  const customerUsers = users.filter(
    (user) => user.role !== "admin",
  ).length;

  const summaryCards = [
    {
      key: "all",
      label: "Total users",
      value: users.length,
      icon: Users,
      activeRing: "ring-2 ring-slate-950 border-transparent",
      iconBg: "bg-blue-50 text-blue-700",
      badge: "All Accounts",
    },
    {
      key: "customer",
      label: "Customers",
      value: customerUsers,
      icon: UserRound,
      activeRing: "ring-2 ring-emerald-500 border-transparent",
      iconBg: "bg-emerald-50 text-emerald-700",
      badge: "Customer Accounts",
    },
    {
      key: "admin",
      label: "Admins",
      value: adminUsers,
      icon: ShieldCheck,
      activeRing: "ring-2 ring-violet-500 border-transparent",
      iconBg: "bg-violet-50 text-violet-700",
      badge: "Admin Privileges",
    },
  ];

  // ==========================================================
  // FILTER & SEARCH LOGIC
  // ==========================================================
  const filteredUsers = users.filter((user) => {
    // Role filter
    if (roleFilter === "customer" && user.role === "admin") {
      return false;
    }
    if (roleFilter === "admin" && user.role !== "admin") {
      return false;
    }

    // Search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      const shortUserId = formatUserId(user.userUuid).toLowerCase();

      return (
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search) ||
        user.userUuid?.toLowerCase().includes(search) ||
        shortUserId.includes(search)
      );
    }

    return true;
  });

  // ==========================================================
  // PAGINATION CALCULATIONS
  // ==========================================================
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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
        <div className="h-8 w-36 rounded bg-slate-200 animate-pulse" />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, index) => (
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-xl font-bold text-red-700">
            Unable to Load Users
          </h2>

          <p className="mt-2 text-sm text-red-600 wrap-break-words">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="border-b border-slate-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Customers
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            View registered customers and administrator accounts. Click cards below to filter.
          </p>
        </header>

        {/* ======================================================
            INTERACTIVE FILTER CARDS
        ====================================================== */}

        <section className="mt-5 grid gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const isSelected = roleFilter === card.key;

            return (
              <button
                key={card.key}
                type="button"
                onClick={() => {
                  setRoleFilter(card.key);
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

        {/* ======================================================
            SEARCH & FILTER STATUS BAR
        ====================================================== */}

        <section className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search by name, email, role or user ID..."
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-950 shadow-xs outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {roleFilter !== "all" && (
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <span>Filter: <strong className="capitalize">{roleFilter}s</strong></span>
              <button
                type="button"
                onClick={() => {
                  setRoleFilter("all");
                  setCurrentPage(1);
                }}
                className="cursor-pointer text-slate-400 hover:text-slate-600"
                title="Clear filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* ======================================================
            USERS TABLE / CARDS
        ====================================================== */}

        {users.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-600">
              No users found.
            </p>
          </div>
        ) : (
          <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

            {/* ==================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-208">

                <thead className="bg-slate-950 text-white">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      User
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      Role
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      User ID
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user, index) => (
                      <tr
                        key={user.userUuid || `user-${index}`}
                        className="transition hover:bg-slate-50"
                      >

                        {/* User */}

                        <td className="px-5 py-4">
                          <p className="font-semibold capitalize text-slate-950">
                            {user.name}
                          </p>
                        </td>

                        {/* Email */}

                        <td className="px-5 py-4">
                          <p className="max-w-[18rem] truncate text-sm text-slate-500">
                            {user.email}
                          </p>
                        </td>

                        {/* Role */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${getRoleClasses(
                              user.role,
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* SHORT USER ID */}

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-700">
                            {formatUserId(user.userUuid)}
                          </p>
                        </td>

                        {/* Created */}

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatCreatedDate(user.createdAt)}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-sm text-slate-500"
                      >
                        {searchText || roleFilter !== "all"
                          ? "No users match your filter criteria."
                          : "No users found"}
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>

            {/* ==================================================
                MOBILE USER CARDS
            ================================================== */}

            <div className="divide-y divide-slate-100 md:hidden">

              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => (
                  <article
                    key={user.userUuid || `mobile-user-${index}`}
                    className="p-4 sm:p-5"
                  >

                    {/* Header */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="font-bold capitalize text-slate-950">
                          {user.name}
                        </p>

                        <p className="mt-1 break-all text-sm text-slate-500">
                          {user.email}
                        </p>

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${getRoleClasses(
                          user.role,
                        )}`}
                      >
                        {user.role}
                      </span>

                    </div>

                    {/* User ID */}

                    <div className="mt-4">
                      <p className="text-xs text-slate-400">
                        User ID
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatUserId(user.userUuid)}
                      </p>
                    </div>

                    {/* Created */}

                    <div className="mt-4">
                      <p className="text-xs text-slate-400">
                        Created
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {formatCreatedDate(user.createdAt)}
                      </p>
                    </div>

                  </article>
                ))
              ) : (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  {searchText || roleFilter !== "all"
                    ? "No users match your filter criteria."
                    : "No users found"}
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
                    users
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