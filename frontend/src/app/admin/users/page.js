"use client";

const API_URL = "http://127.0.0.1:8000";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, UserRound, Users } from "lucide-react";

export default function AdminUsers() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

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
  // ⭐ NEW — SHORT USER ID FOR ADMIN DISPLAY
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

  // ==========================================================
  // ⭐ UPDATED — SEARCH SUPPORTS:
  // Name
  // Email
  // Role
  // Full UUID
  // Short User ID (USR-XXXXX)
  // ==========================================================
  const filteredUsers = users.filter((user) => {
    const search = searchText.toLowerCase();

    const shortUserId = formatUserId(user.userUuid).toLowerCase();

    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search) ||
      user.userUuid?.toLowerCase().includes(search) ||
      shortUserId.includes(search)
    );
  });

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
            View registered customers and administrator accounts.
          </p>
        </header>

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <section className="mt-5 grid gap-4 sm:grid-cols-3">

          {/* Total Users */}

          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total users
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {users.length}
                </p>
              </div>

              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Users className="h-5 w-5" />
              </span>
            </div>
          </article>

          {/* Customers */}

          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Customers
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {customerUsers}
                </p>
              </div>

              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <UserRound className="h-5 w-5" />
              </span>
            </div>
          </article>

          {/* Admins */}

          <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Admins
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {adminUsers}
                </p>
              </div>

              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                <ShieldCheck className="h-5 w-5" />
              </span>
            </div>
          </article>
        </section>

        {/* ======================================================
            SEARCH
        ====================================================== */}

        <section className="mt-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search by name, email, role or user ID"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </section>

        {/* ======================================================
            USERS
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

                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
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

                        {/* ⭐ CHANGED — SHORT USER ID */}

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
                        No users found
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

              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
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

                      {/* ⭐ CHANGED — SHORT USER ID */}

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
                  No users found
                </div>
              )}

            </div>
          </section>
        )}

      </div>
    </div>
  );
}