"use client";

import { useEffect, useState } from "react";

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categoryService";

export default function AdminCategories() {
  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Search
  const [searchText, setSearchText] = useState("");

  // Add/Edit form
  const [showForm, setShowForm] = useState(false);

  const [categoryName, setCategoryName] = useState("");

  const [editCategory, setEditCategory] = useState(null);

  // --------------------------------------------------
  // Format Category Date
  // --------------------------------------------------

  function formatCategoryDate(date) {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // --------------------------------------------------
  // Fetch Categories
  // --------------------------------------------------

  async function fetchCategories() {
    try {
      setLoading(true);
      setError("");

      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);

      setError(error.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Add Category
  // --------------------------------------------------

  async function handleAddCategory() {
    const name = categoryName.trim();

    if (!name) {
      setError("Please enter a category name");
      return;
    }

    try {
      setError("");

      await addCategory(name);

      await fetchCategories();

      setCategoryName("");

      setShowForm(false);
    } catch (error) {
      console.error("Add Category Error:", error);

      setError(error.message || "Failed to add category");
    }
  }

  // --------------------------------------------------
  // Edit Category
  // --------------------------------------------------

  function handleEditCategory(category) {
    setEditCategory(category);

    setCategoryName(category.name);

    setShowForm(true);

    setError("");
  }

  // --------------------------------------------------
  // Update Category
  // --------------------------------------------------

  async function handleUpdateCategory() {
    const name = categoryName.trim();

    if (!name) {
      setError("Please enter a category name");
      return;
    }

    try {
      setError("");

      await updateCategory(editCategory.categoryUuid, name);

      await fetchCategories();

      setCategoryName("");

      setEditCategory(null);

      setShowForm(false);
    } catch (error) {
      console.error("Update Category Error:", error);

      setError(error.message || "Failed to update category");
    }
  }

  // --------------------------------------------------
  // Delete Category
  // --------------------------------------------------

  async function handleDeleteCategory(categoryUuid) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");

      await deleteCategory(categoryUuid);

      await fetchCategories();
    } catch (error) {
      console.error("Delete Category Error:", error);

      setError(error.message || "Failed to delete category");
    }
  }

  // --------------------------------------------------
  // Open Add Form
  // --------------------------------------------------

  function handleAddButton() {
    setEditCategory(null);

    setCategoryName("");

    setError("");

    setShowForm(true);
  }

  // --------------------------------------------------
  // Cancel Form
  // --------------------------------------------------

  function handleCancel() {
    setShowForm(false);

    setEditCategory(null);

    setCategoryName("");

    setError("");
  }

  // --------------------------------------------------
  // useEffect
  // --------------------------------------------------

  useEffect(() => {
    fetchCategories();
  }, []);

  // --------------------------------------------------
  // Filter Categories
  // --------------------------------------------------

  const filteredCategories = categories.filter((category) => {
    const search = searchText.toLowerCase();

    return (
      category.name.toLowerCase().includes(search) ||
      category.slug.toLowerCase().includes(search)
    );
  });

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <p className="text-lg sm:text-xl text-blue-600 text-center">
          Loading Categories...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 px-3 pt-8 pb-5 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8">
      {/* ========================================================== */}
      {/* Header */}
      {/* ========================================================== */}

      <div
        className="
          flex
          flex-col
          xl:flex-row
          xl:items-center
          gap-4
          mb-6
          sm:mb-8
        "
      >
        {/* Title */}

        <div className="shrink-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Categories
          </h1>

          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage your OneCart categories
          </p>
        </div>

        {/* Search */}

        <div className="w-full xl:flex-1 xl:mx-4">
          <input
            type="text"
            placeholder="Search category..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="
              w-full
              px-4
              py-3
              border
              border-gray-300
              rounded-lg
              text-black
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />
        </div>

        {/* Add Button */}

        <button
          onClick={handleAddButton}
          className="
            w-full
            xl:w-auto
            bg-blue-600
            text-white
            px-5
            py-3
            rounded-lg
            font-semibold
            hover:bg-blue-700
            transition
            cursor-pointer
            whitespace-nowrap
          "
        >
          + Add Category
        </button>
      </div>

      {/* ========================================================== */}
      {/* Error */}
      {/* ========================================================== */}

      {error && (
        <div
          className="
            bg-red-100
            border
            border-red-300
            text-red-700
            px-4
            py-3
            rounded-lg
            mb-6
            text-sm
            sm:text-base
          "
        >
          {error}
        </div>
      )}

      {/* ========================================================== */}
      {/* Add / Edit Form */}
      {/* ========================================================== */}

      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 sm:mb-6">
            {editCategory ? "Edit Category" : "Add New Category"}
          </h2>

          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Category Name
            </label>

            <input
              type="text"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="Enter category name"
              className="
                w-full
                px-4
                py-3
                border
                border-gray-300
                rounded-lg
                text-black
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          {/* Buttons */}

          <div
            className="
              flex
              flex-col-reverse
              sm:flex-row
              justify-end
              gap-3
              mt-6
            "
          >
            <button
              type="button"
              onClick={handleCancel}
              className="
                w-full
                sm:w-auto
                px-5
                py-3
                border
                border-gray-300
                rounded-lg
                text-gray-700
                hover:bg-gray-100
                transition
                cursor-pointer
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={editCategory ? handleUpdateCategory : handleAddCategory}
              className="
                w-full
                sm:w-auto
                px-5
                py-3
                bg-blue-600
                text-white
                rounded-lg
                font-semibold
                hover:bg-blue-700
                transition
                cursor-pointer
              "
            >
              {editCategory ? "Update Category" : "Add Category"}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* Desktop Category Table */}
      {/* ========================================================== */}

      <div className="hidden sm:block bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="text-left px-4 sm:px-6 py-4">Category Name</th>

                <th className="text-left px-4 sm:px-6 py-4">Slug</th>

                <th className="text-left px-4 sm:px-6 py-4">Created</th>

                <th className="text-left px-4 sm:px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr
                    key={category.categoryUuid}
                    className="
                      border-b
                      border-gray-200
                      hover:bg-gray-50
                    "
                  >
                    {/* Name */}

                    <td className="px-4 sm:px-6 py-4">
                      <span className="font-semibold text-gray-800">
                        {category.name}
                      </span>
                    </td>

                    {/* Slug */}

                    <td className="px-4 sm:px-6 py-4 text-gray-600">
                      {category.slug}
                    </td>

                    {/* Created Date */}

                    <td className="px-4 sm:px-6 py-4">
                      <span className="text-sm text-gray-700 whitespace-nowrap">
                        {formatCategoryDate(category.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="
                            px-3
                            py-2
                            bg-blue-100
                            text-blue-600
                            rounded-lg
                            hover:bg-blue-200
                            cursor-pointer
                            text-sm
                            font-medium
                          "
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteCategory(category.categoryUuid)
                          }
                          className="
                            px-3
                            py-2
                            bg-red-100
                            text-red-600
                            rounded-lg
                            hover:bg-red-200
                            cursor-pointer
                            text-sm
                            font-medium
                          "
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="
                      px-6
                      py-10
                      text-center
                      text-gray-500
                    "
                  >
                    {searchText
                      ? "No categories found"
                      : "No categories available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================== */}
      {/* Mobile Category Cards */}
      {/* ========================================================== */}

      <div className="sm:hidden space-y-4">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div
              key={category.categoryUuid}
              className="
                bg-white
                rounded-xl
                shadow-md
                p-4
                border
                border-gray-100
              "
            >
              {/* Category Information */}

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Category Name</p>

                <p className="text-base font-semibold text-gray-800">
                  {category.name}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Slug</p>

                <p className="text-sm text-gray-600 break-all">
                  {category.slug}
                </p>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Created</p>

                  <p className="text-sm text-gray-700">
                    {formatCategoryDate(category.createdAt)}
                  </p>
                </div>
              </div>

              {/* Actions */}

              <div className="flex gap-3">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="
                    flex-1
                    px-3
                    py-2.5
                    bg-blue-100
                    text-blue-600
                    rounded-lg
                    hover:bg-blue-200
                    cursor-pointer
                    font-medium
                  "
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteCategory(category.categoryUuid)}
                  className="
                    flex-1
                    px-3
                    py-2.5
                    bg-red-100
                    text-red-600
                    rounded-lg
                    hover:bg-red-200
                    cursor-pointer
                    font-medium
                  "
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            className="
              bg-white
              rounded-xl
              shadow-md
              px-6
              py-10
              text-center
              text-gray-500
            "
          >
            {searchText ? "No categories found" : "No categories available"}
          </div>
        )}
      </div>
    </div>
  );
}