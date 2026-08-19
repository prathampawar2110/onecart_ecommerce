"use client";

const API_URL = "http://127.0.0.1:8000";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUsers() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------------------
  // Fetch Users
  // ----------------------------------------------------------------

  useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem("access_token");

      // No login
      if (!token) {
        router.push("/login");
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

        console.log("Admin Users:", data);

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to fetch users",
          );
        }

        setUsers(data);
      } catch (error) {
        console.error("Admin Users Error:", error);

        setError(error.message);

        // Unauthorized / non-admin
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [router]);

  // Created Date
  function formatCreatedDate(createdAt) {
    if (!createdAt) {
      return "N/A";
    }

    return new Date(createdAt).toLocaleDateString("en-IN" , {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ----------------------------------------------------------------
  // Loading
  // ----------------------------------------------------------------

  if (loading) {
    return (
      <div
        className="
          min-h-[60vh]
          flex
          justify-center
          items-center
          px-4
          pt-14
          sm:pt-16
        "
      >
        <p className="text-lg sm:text-xl text-gray-700 text-center">
          Loading Users...
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Error
  // ----------------------------------------------------------------

  if (error) {
    return (
      <div
        className="
          min-h-[60vh]
          bg-gray-100
          flex
          justify-center
          items-center
          px-4
          pt-14
          sm:pt-16
        "
      >
        <div
          className="
            w-full
            max-w-md
            bg-red-50
            border
            border-red-200
            rounded-xl
            p-5
            sm:p-6
            text-center
          "
        >
          <h2 className="text-xl sm:text-2xl font-bold text-red-700 mb-2">
            Unable to Load Users
          </h2>

          <p className="text-sm sm:text-base text-red-600 wrap-break-words">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Dashboard
  // ----------------------------------------------------------------

  return (
    <div
      className="
        min-h-screen
        bg-gray-100

        px-3
        sm:px-5
        md:px-6
        lg:px-8

        pt-6
        sm:pt-8
      "
    >
      {/* ========================================================== */}
      {/* Header */}
      {/* ========================================================== */}

      <div className="mb-6 sm:mb-8">

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Users
        </h1>

        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
          Manage OneCart customers and administrators
        </p>

      </div>

      {/* ========================================================== */}
      {/* User Count */}
      {/* ========================================================== */}

      <div className="mb-6">

        <div
          className="
            w-full
            sm:w-auto
            inline-block

            bg-white
            rounded-xl
            shadow-md

            px-5
            sm:px-6

            py-4

            border-l-4
            border-blue-500
          "
        >

          <p className="text-sm text-gray-500">
            Total Users
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
            {users.length}
          </p>

        </div>

      </div>

      {/* ========================================================== */}
      {/* No Users */}
      {/* ========================================================== */}

      {users.length === 0 ? (

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

          <p className="text-gray-500 text-sm sm:text-base">
            No users found.
          </p>

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

          {/* ====================================================== */}
          {/* Desktop Table */}
          {/* ====================================================== */}

          <div className="hidden md:block overflow-x-auto">

            <table className="w-full min-w-175">

              <thead className="bg-gray-900 text-white">

                <tr>

                  <th className="text-left px-4 lg:px-6 py-4">
                    User ID
                  </th>

                  <th className="text-left px-4 lg:px-6 py-4">
                    Name
                  </th>

                  <th className="text-left px-4 lg:px-6 py-4">
                    Email
                  </th>

                  <th className="text-left px-4 lg:px-6 py-4">
                    Role
                  </th>

                  <th className="text-left px-4 lg:px-6 py-4">
                    Created At
                  </th>

                </tr>

              </thead>

              <tbody>

                {users.map((user, index) => (

                  <tr
                    key={user.userUuid || `user-${index}`}
                    className="
                      border-b
                      border-gray-200
                      hover:bg-gray-50
                    "
                  >

                    {/* User UUID */}

                    <td className="px-4 lg:px-6 py-4 max-w-55">

                      <span
                        className="
                          text-xs
                          sm:text-sm
                          font-semibold
                          text-gray-800
                          break-all
                        "
                      >
                        {user.userUuid}
                      </span>

                    </td>

                    {/* Name */}

                    <td className="px-4 lg:px-6 py-4">

                      <span
                        className="
                          text-sm
                          font-medium
                          text-gray-800
                          capitalize
                          wrap-break-words
                        "
                      >
                        {user.name}
                      </span>

                    </td>

                    {/* Email */}

                    <td className="px-4 lg:px-6 py-4">

                      <span
                        className="
                          text-sm
                          text-gray-700
                          break-all
                        "
                      >
                        {user.email}
                      </span>

                    </td>

                    {/* Role */}

                    <td className="px-4 lg:px-6 py-4">

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
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        `}
                      >
                        {user.role}
                      </span>

                    </td>

                    {/* Created At */}
                    <td className="px-4 lg:px-6 py-4">
                      <span className="text-sm text-gray-800 whitespace-nowrap">
                        {formatCreatedDate(user.createdAt)}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* ====================================================== */}
          {/* Mobile User Cards */}
          {/* ====================================================== */}

          <div className="md:hidden divide-y divide-gray-200">

            {users.map((user, index) => (

              <div
                key={user.userUuid || `user-${index}`}
                className="
                  p-4
                  sm:p-5
                "
              >

                {/* Header */}

                <div
                  className="
                    flex
                    flex-col
                    xs:flex-row
                    xs:justify-between
                    xs:items-start
                    gap-3
                  "
                >

                  <div className="min-w-0">

                    <p className="text-xs text-gray-500 mb-1">
                      Name
                    </p>

                    <p
                      className="
                        text-base
                        font-semibold
                        text-gray-800
                        capitalize
                        wrap-break-words
                      "
                    >
                      {user.name}
                    </p>

                  </div>

                  {/* Role */}

                  <span
                    className={`
                      self-start
                      shrink-0
                      px-2.5
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      whitespace-nowrap

                      ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    `}
                  >
                    {user.role}
                  </span>

                </div>

                {/* Email */}

                <div className="mt-4">

                  <p className="text-xs text-gray-500 mb-1">
                    Email
                  </p>

                  <p
                    className="
                      text-sm
                      text-gray-700
                      break-all
                    "
                  >
                    {user.email}
                  </p>

                </div>

                {/* User UUID */}

                <div className="mt-4">

                  <p className="text-xs text-gray-500 mb-1">
                    User ID
                  </p>

                  <p
                    className="
                      text-xs
                      sm:text-sm
                      text-gray-700
                      break-all
                    "
                  >
                    {user.userUuid}
                  </p>

                </div>

                {/* Created At */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">
                    Created At
                  </p>

                  <p className="text-sm text-gray-700">
                    {formatCreatedDate(user.createdAt)}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  );
}