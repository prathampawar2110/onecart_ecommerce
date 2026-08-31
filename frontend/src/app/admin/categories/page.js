"use client";

import { useEffect, useState } from "react";
import { Edit3, FolderTree, Plus, Search, Trash2 } from "lucide-react";

import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/categoryService";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editCategory, setEditCategory] = useState(null);

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

  useEffect(() => {
    async function loadCategories() {
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

    loadCategories();
  }, []);

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

  function handleEditCategory(category) {
    setEditCategory(category);
    setCategoryName(category.name);
    setShowForm(true);
    setError("");
  }

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

  function handleAddButton() {
    setEditCategory(null);
    setCategoryName("");
    setError("");
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditCategory(null);
    setCategoryName("");
    setError("");
  }

  const filteredCategories = categories.filter((category) => {
    const search = searchText.toLowerCase();

    return (
      category.name.toLowerCase().includes(search) ||
      category.slug.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-48 rounded bg-slate-200 animate-pulse" />
        <div className="mt-6 h-80 rounded-lg bg-white shadow-sm animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Catalog
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Categories
            </h1>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Organize the storefront catalog into clear shopping paths.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddButton}
            className="inline-flex w-full items-center cursor-pointer justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 xl:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-5.5 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search by category or slug"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total categories
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {categories.length}
                </p>
              </div>

              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <FolderTree className="h-3 w-3" />
              </span>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold text-slate-950">
              {editCategory ? "Edit Category" : "Add Category"}
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Category Name
                </label>

                <input
                  type="text"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="Enter category name"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-slate-300 cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={editCategory ? handleUpdateCategory : handleAddCategory}
                className="rounded-lg bg-blue-600 px-4 py-3 cursor-pointer text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {editCategory ? "Update" : "Create"}
              </button>
            </div>
          </section>
        )}

        <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Slug
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Created
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr
                      key={category.categoryUuid}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">
                          {category.name}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {category.slug}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatCategoryDate(category.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditCategory(category)}
                            title="Edit category"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteCategory(category.categoryUuid)
                            }
                            title="Delete category"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer bg-red-50 text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-10 text-center text-sm text-slate-500"
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

          <div className="divide-y divide-slate-100 sm:hidden">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <article key={category.categoryUuid} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-950">
                        {category.name}
                      </p>
                      <p className="mt-1 break-all text-sm text-slate-500">
                        {category.slug}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => handleEditCategory(category)}
                        title="Edit category"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"
                      >
                        <Edit3 className="h-4 w-4 cursor-pointer" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteCategory(category.categoryUuid)
                        }
                        title="Delete category"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-medium text-slate-400">
                    Created {formatCategoryDate(category.createdAt)}
                  </p>
                </article>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                {searchText ? "No categories found" : "No categories available"}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}