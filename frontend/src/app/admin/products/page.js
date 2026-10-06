"use client";

import { useEffect, useState } from "react";

import {
  Boxes,
  Edit3,
  ImageOff,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "@/services/productService";

import { getCategories } from "@/services/categoryService";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [variantFields, setVariantFields] = useState([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Product form
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    images: [],
    category: "",
    stock: "",
    rating: "",
    variants: {},
    variantPrices: {},
  });

  // --------------------------------------------------
  // Fetch Products and Categories
  // --------------------------------------------------

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productData = await getProducts();
        const categoriesData = await getCategories();

        setProducts(productData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);

        showMessage(
          error.message || "Failed to load products",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  function formatProductDate(date) {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  function getStockStatus(stockValue) {
    const stock = Number(stockValue || 0);

    if (stock === 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-50 text-red-700 ring-1 ring-red-200",
        dotClassName: "bg-red-500",
      };
    }

    if (stock <= 15) {
      return {
        label: "Low Stock",
        className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        dotClassName: "bg-amber-500",
      };
    }

    return {
      label: "In Stock",
      className:
        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      dotClassName: "bg-emerald-500",
    };
  }

  // --------------------------------------------------
  // Variant Functions
  // --------------------------------------------------

  function handleVariantChange(index, field, value) {
    setVariantFields((previousVariants) =>
      previousVariants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  }

  function addVariant() {
    setVariantFields((previousVariants) => [
      ...previousVariants,
      {
        id: crypto.randomUUID(),
        name: "",
        options: "",
      },
    ]);
  }

  function removeVariant(index) {
    setVariantFields((previousVariants) =>
      previousVariants.filter(
        (_, variantIndex) => variantIndex !== index
      )
    );
  }

  function getVariantCombinations() {
    const validVariants = variantFields
      .map((variant) => ({
        name: variant.name.trim(),
        options: variant.options
          .split(",")
          .map((option) => option.trim())
          .filter((option) => option !== ""),
      }))
      .filter(
        (variant) =>
          variant.name && variant.options.length > 0
      );

    if (validVariants.length === 0) {
      return [];
    }

    let combinations = [[]];

    validVariants.forEach((variant) => {
      const newCombinations = [];

      combinations.forEach((combination) => {
        variant.options.forEach((option) => {
          newCombinations.push([
            ...combination,
            option,
          ]);
        });
      });

      combinations = newCombinations;
    });

    return combinations;
  }

  function handleVariantPriceChange(combination, value) {
    const variantNames = variantFields
      .map((variant) => variant.name.trim())
      .filter((name) => name !== "");

    const combinationKey = combination
      .map(
        (option, index) =>
          `${variantNames[index]}=${option}`
      )
      .join("|");

    setProductForm((previousForm) => ({
      ...previousForm,
      variantPrices: {
        ...previousForm.variantPrices,
        [combinationKey]: value,
      },
    }));
  }

  function buildVariants() {
    const variants = {};

    variantFields.forEach((variant) => {
      const name = variant.name.trim();

      const options = variant.options
        .split(",")
        .map((option) => option.trim())
        .filter((option) => option !== "");

      if (name && options.length > 0) {
        variants[name] = options;
      }
    });

    return variants;
  }

  function buildVariantPrices() {
    const combinations = getVariantCombinations();

    const variantPrices = {};

    const variantNames = variantFields
      .map((variant) => variant.name.trim())
      .filter((name) => name !== "");

    combinations.forEach((combination) => {
      const combinationKey = combination
        .map(
          (option, index) =>
            `${variantNames[index]}=${option}`
        )
        .join("|");

      const price =
        productForm.variantPrices?.[combinationKey];

      if (
        price !== undefined &&
        price !== null &&
        price !== ""
      ) {
        variantPrices[combinationKey] = Number(price);
      }
    });

    return variantPrices;
  }

  // --------------------------------------------------
  // Form Functions
  // --------------------------------------------------

  function handleInputChange(event) {
    const { name, value } = event.target;

    setProductForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  function resetForm() {
    setProductForm({
      name: "",
      description: "",
      price: "",
      image_url: "",
      images: [],
      category: "",
      stock: "",
      rating: "",
      variants: {},
      variantPrices: {},
    });

    setVariantFields([]);
    setEditProduct(null);
    setShowForm(false);
  }

  function handleAddButton() {
    setEditProduct(null);
    setVariantFields([]);

    setProductForm({
      name: "",
      description: "",
      price: "",
      image_url: "",
      images: [],
      category: "",
      stock: "",
      rating: "",
      variants: {},
      variantPrices: {},
    });

    setShowForm(true);
  }

  // --------------------------------------------------
  // Messages
  // --------------------------------------------------

  function showMessage(messageText, type = "success") {
    setMessage(messageText);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  }

  // --------------------------------------------------
  // Refresh Products
  // --------------------------------------------------

  async function refreshProducts() {
    const updatedProducts = await getProducts();
    setProducts(updatedProducts);
  }

  // --------------------------------------------------
  // Add Product
  // --------------------------------------------------

  async function handleAddProduct() {
    try {
      const newProduct = {
        name: productForm.name,
        description: productForm.description,

        price: Number(productForm.price),

        image_url: productForm.image_url,

        images: productForm.images.filter(
          (url) => url.trim() !== ""
        ),

        category: productForm.category,

        stock: Number(productForm.stock),

        // ⭐ Admin controlled rating
        rating: Number(productForm.rating || 0),

        variants: buildVariants(),

        variantPrices: buildVariantPrices(),
      };

      await addProduct(newProduct);

      await refreshProducts();

      resetForm();

      showMessage("Product added successfully");
    } catch (error) {
      console.error("Failed to add product:", error);

      showMessage(
        error.message || "Failed to add product",
        "error"
      );
    }
  }

  // --------------------------------------------------
  // Update Product
  // --------------------------------------------------

  async function handleUpdateProduct() {
    try {
      const updatedProduct = {
        name: productForm.name,
        description: productForm.description,

        price: Number(productForm.price),

        image_url: productForm.image_url,

        images: productForm.images.filter(
          (url) => url.trim() !== ""
        ),

        category: productForm.category,

        stock: Number(productForm.stock),

        // ⭐ Admin controlled rating
        rating: Number(productForm.rating || 0),

        variants: buildVariants(),

        variantPrices: buildVariantPrices(),
      };

      await updateProduct(
        editProduct.productUuid,
        updatedProduct
      );

      await refreshProducts();

      resetForm();

      showMessage("Product updated successfully");
    } catch (error) {
      console.error(
        "Failed to update product:",
        error
      );

      showMessage(
        error.message || "Failed to update product",
        "error"
      );
    }
  }

  // --------------------------------------------------
  // Delete Product
  // --------------------------------------------------

  async function handleDeleteProduct(productUuid) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteProduct(productUuid);

      await refreshProducts();

      showMessage("Product deleted successfully");
    } catch (error) {
      console.error(
        "Delete Product error:",
        error
      );

      showMessage(
        error.message || "Failed to delete product",
        "error"
      );
    }
  }

  // --------------------------------------------------
  // Edit Product
  // --------------------------------------------------

  function handleEditProduct(product) {
    setEditProduct(product);

    setProductForm({
      name: product.name,
      description: product.description,

      price: product.price,

      image_url: product.image_url,

      images: Array.isArray(product.images)
        ? product.images
        : [],

      category: product.category,

      stock: product.stock,

      // ⭐ Load existing rating
      rating: product.rating ?? 0,

      variants: product.variants || {},

      variantPrices:
        product.variantPrices || {},
    });

    const existingVariants = Object.entries(
      product.variants || {}
    ).map(([name, options]) => ({
      id: crypto.randomUUID(),
      name,
      options: options.join(", "),
    }));

    setVariantFields(existingVariants);

    setShowForm(true);
  }

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredProducts = products.filter(
    (product) => {
      const search = searchText.toLowerCase();

      const stockStatus = getStockStatus(
        product.stock
      ).label.toLowerCase();

      return (
        product.name
          ?.toLowerCase()
          .includes(search) ||

        product.category
          ?.toLowerCase()
          .includes(search) ||

        String(product.price).includes(search) ||

        String(product.stock).includes(search) ||

        stockStatus.includes(search)
      );
    }
  );

  // --------------------------------------------------
  // Dashboard Statistics
  // --------------------------------------------------

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.stock || 0) > 0 &&
      Number(product.stock) <= 15
  ).length;

  const outOfStockProducts = products.filter(
    (product) =>
      Number(product.stock || 0) === 0
  ).length;

  const totalInventory = products.reduce(
    (total, product) =>
      total + Number(product.stock || 0),
    0
  );

  const variantCombinations =
    getVariantCombinations();

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-44 rounded bg-slate-200 animate-pulse" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-lg bg-white shadow-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      {/* Success / Error Message */}
      {message && (
        <div
          className={`fixed right-4 top-4 z-100 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${
            messageType === "error"
              ? "bg-red-600"
              : "bg-emerald-600"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mx-auto max-w-7xl">

        {/* --------------------------------------------------
            Header
        -------------------------------------------------- */}

        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Catalog
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Products
            </h1>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Manage inventory, pricing, variants, and product availability.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddButton}
            className="inline-flex w-full items-center justify-center gap-2 cursor-pointer rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 xl:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </header>

        {/* --------------------------------------------------
            Summary Cards
        -------------------------------------------------- */}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Package}
            label="Products"
            value={products.length}
            accent="bg-blue-50 text-blue-700"
          />

          <SummaryCard
            icon={Boxes}
            label="Inventory units"
            value={totalInventory}
            accent="bg-emerald-50 text-emerald-700"
          />

          <SummaryCard
            icon={TriangleAlert}
            label="Low stock"
            value={lowStockProducts}
            accent="bg-amber-50 text-amber-700"
          />

          <SummaryCard
            icon={ImageOff}
            label="Out of stock"
            value={outOfStockProducts}
            accent="bg-red-50 text-red-700"
          />
        </section>

        {/* --------------------------------------------------
            Search
        -------------------------------------------------- */}

        <section className="mt-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search product, category, price, stock or status"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </section>

        {/* --------------------------------------------------
            Product Form Modal
        -------------------------------------------------- */}

        {showForm && (
          <ProductFormModal
            editProduct={editProduct}
            productForm={productForm}
            categories={categories}
            variantFields={variantFields}
            variantCombinations={variantCombinations}
            onClose={resetForm}
            onInputChange={handleInputChange}
            onVariantChange={handleVariantChange}
            onAddVariant={addVariant}
            onRemoveVariant={removeVariant}
            onVariantPriceChange={
              handleVariantPriceChange
            }
            onSubmit={
              editProduct
                ? handleUpdateProduct
                : handleAddProduct
            }
            onAddImage={() =>
              setProductForm((prev) => ({
                ...prev,
                images: [
                  ...prev.images,
                  "",
                ],
              }))
            }
            onImageChange={(index, value) =>
              setProductForm((prev) => {
                const updated = [
                  ...prev.images,
                ];

                updated[index] = value;

                return {
                  ...prev,
                  images: updated,
                };
              })
            }
            onRemoveImage={(index) =>
              setProductForm((prev) => ({
                ...prev,
                images: prev.images.filter(
                  (_, i) => i !== index
                ),
              }))
            }
          />
        )}

        {/* --------------------------------------------------
            Products Table
        -------------------------------------------------- */}

        <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

          {/* ==================================================
              DESKTOP TABLE
          ================================================== */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-272">

              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Price
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Status
                  </th>

                  {/* ⭐ Rating Column */}
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Rating
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Updated
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const status =
                      getStockStatus(product.stock);

                    return (
                      <tr
                        key={product.productUuid}
                        className="transition hover:bg-slate-50"
                      >

                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-contain"
                            />

                            <div className="min-w-0">
                              <p className="max-w-[18rem] truncate font-semibold text-slate-950">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Created{" "}
                                {formatProductDate(
                                  product.createdAt
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                          {product.category}
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4 text-sm font-bold text-slate-950">
                          {formatCurrency(product.price)}
                        </td>

                        {/* Stock */}
                        <td className="px-5 py-4">
                          <span className="inline-flex min-w-10 justify-center rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                            {product.stock}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StockBadge status={status} />
                        </td>

                        {/* ⭐ Rating */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

                            <span className="text-sm font-semibold text-slate-700">
                              {Number(
                                product.rating || 0
                              ).toFixed(1)}
                            </span>
                          </div>
                        </td>

                        {/* Updated */}
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatProductDate(
                            product.updatedAt
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEditProduct(
                                  product
                                )
                              }
                              title="Edit product"
                              className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteProduct(
                                  product.productUuid
                                )
                              }
                              title="Delete product"
                              className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-700 transition hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      {searchText
                        ? "No products found"
                        : "No products available"}
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          {/* ==================================================
              MOBILE PRODUCT CARDS
          ================================================== */}

          <div className="divide-y divide-slate-100 md:hidden">

            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const status =
                  getStockStatus(product.stock);

                return (
                  <article
                    key={product.productUuid}
                    className="p-4 sm:p-5"
                  >

                    {/* Product Header */}
                    <div className="flex gap-3">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 object-contain"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-950 wrap-break-words">
                          {product.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    {/* Product Information */}
                    <div className="mt-4 grid grid-cols-2 gap-4">

                      {/* Price */}
                      <div>
                        <p className="text-xs text-slate-400">
                          Price
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-950">
                          {formatCurrency(
                            product.price
                          )}
                        </p>
                      </div>

                      {/* Stock */}
                      <div>
                        <p className="text-xs text-slate-400">
                          Stock
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-950">
                          {product.stock}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-xs text-slate-400">
                          Status
                        </p>

                        <div className="mt-1">
                          <StockBadge
                            status={status}
                          />
                        </div>
                      </div>

                      {/* ⭐ Rating */}
                      <div>
                        <p className="text-xs text-slate-400">
                          Rating
                        </p>

                        <div className="mt-1 flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

                          <span className="text-sm font-semibold text-slate-700">
                            {Number(
                              product.rating || 0
                            ).toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Updated */}
                      <div>
                        <p className="text-xs text-slate-400">
                          Updated
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {formatProductDate(
                            product.updatedAt
                          )}
                        </p>
                      </div>

                    </div>

                    {/* Mobile Actions */}
                    <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">

                      <button
                        type="button"
                        onClick={() =>
                          handleEditProduct(product)
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteProduct(
                            product.productUuid
                          )
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>

                    </div>

                  </article>
                );
              })
            ) : (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                {searchText
                  ? "No products found"
                  : "No products available"}
              </div>
            )}

          </div>
        </section>
      </div>
    </div>
  );
}

// ======================================================
// Summary Card
// ======================================================

function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </span>

      </div>
    </article>
  );
}

// ======================================================
// Stock Badge
// ======================================================

function StockBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${status.dotClassName}`}
      />

      {status.label}
    </span>
  );
}

// ======================================================
// Product Form Modal
// ======================================================

function ProductFormModal({
  editProduct,
  productForm,
  categories,
  variantFields,
  variantCombinations,
  onClose,
  onInputChange,
  onVariantChange,
  onAddVariant,
  onRemoveVariant,
  onVariantPriceChange,
  onSubmit,
  onAddImage,
  onImageChange,
  onRemoveImage,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-5">

      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-2xl">

        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">

          <div>
            <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
              {editProduct
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep product details, stock, variants, and pricing current.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Close form"
            className="inline-flex cursor-pointer h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        <div className="p-4 sm:p-6">

          {/* ==============================================
              Basic Product Information
          ============================================== */}

          <div className="grid gap-4 md:grid-cols-2">

            {/* Product Name */}
            <Field label="Product Name">
              <input
                type="text"
                name="name"
                value={productForm.name}
                onChange={onInputChange}
                placeholder="Enter product name"
                className={inputClassName}
              />
            </Field>

            {/* Category */}
            <Field label="Category">
              <select
                name="category"
                value={productForm.category}
                onChange={onInputChange}
                className={inputClassName}
              >
                <option value="">
                  Select category
                </option>

                {categories.map((category) => (
                  <option
                    key={
                      category.categoryUuid ||
                      category.name
                    }
                    value={category.name}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            {/* Base Price */}
            <Field label="Base Price">
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={productForm.price}
                onChange={onInputChange}
                placeholder="Enter base price"
                className={inputClassName}
              />
            </Field>

            {/* Stock */}
            <Field label="Stock">
              <input
                type="number"
                name="stock"
                min="0"
                value={productForm.stock}
                onChange={onInputChange}
                placeholder="Enter stock quantity"
                className={inputClassName}
              />
            </Field>

            {/* ⭐ Product Rating */}
            <Field label="Product Rating">
              <input
                type="number"
                name="rating"
                min="0"
                max="5"
                step="0.5"
                value={productForm.rating}
                onChange={onInputChange}
                placeholder="Enter rating (0 - 5)"
                className={inputClassName}
              />

              <p className="mt-1 text-xs text-slate-500">
                Enter a rating between 0 and 5. Example: 4.5
              </p>
            </Field>

            {/* Primary Image */}
            <Field
              label="Primary Image URL"
              className="md:col-span-2"
            >
              <input
                type="text"
                name="image_url"
                value={productForm.image_url}
                onChange={onInputChange}
                placeholder="Enter primary product image URL"
                className={inputClassName}
              />
            </Field>

            {/* ============================================
                Additional Images
            ============================================ */}

            <div className="md:col-span-2">

              <div className="mb-2 flex items-center justify-between">

                <label className="text-sm font-semibold text-slate-700">
                  Additional Images
                </label>

                <button
                  type="button"
                  onClick={onAddImage}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Image
                </button>

              </div>

              {productForm.images.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-400">
                  No additional images. Click &quot;Add Image&quot; to attach more views.
                </p>
              ) : (
                <div className="space-y-2">

                  {productForm.images.map(
                    (imgUrl, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2"
                      >

                        {imgUrl.trim() && (
                          <img
                            src={imgUrl}
                            alt={`Preview ${index + 1}`}
                            className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-contain bg-white"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        )}

                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(event) =>
                            onImageChange(
                              index,
                              event.target.value
                            )
                          }
                          placeholder={`Image URL ${
                            index + 1
                          }`}
                          className={`${inputClassName} flex-1`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            onRemoveImage(index)
                          }
                          title="Remove image"
                          className="inline-flex cursor-pointer h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                        >
                          <X className="h-4 w-4" />
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* Description */}
            <Field
              label="Description"
              className="md:col-span-2"
            >
              <textarea
                name="description"
                value={productForm.description}
                onChange={onInputChange}
                placeholder="Enter product description"
                rows="4"
                className={`${inputClassName} resize-y`}
              />
            </Field>

          </div>

          {/* ==============================================
              Variants
          ============================================== */}

          <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="font-bold text-slate-950">
                  Variants
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add options like Color, Size, Storage, or RAM.
                </p>
              </div>

              <button
                type="button"
                onClick={onAddVariant}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add Variant
              </button>

            </div>

            <div className="mt-4 space-y-3">

              {variantFields.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  No variants added.
                </div>
              ) : (
                variantFields.map(
                  (variant, index) => (
                    <div
                      key={variant.id}
                      className="rounded-lg border border-slate-200 bg-white p-4"
                    >

                      <div className="mb-3 flex items-center justify-between gap-3">

                        <p className="text-sm font-bold text-slate-950">
                          Variant {index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            onRemoveVariant(index)
                          }
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>

                      </div>

                      <div className="grid gap-3 md:grid-cols-2">

                        <input
                          type="text"
                          placeholder="Variant name"
                          value={variant.name}
                          onChange={(event) =>
                            onVariantChange(
                              index,
                              "name",
                              event.target.value
                            )
                          }
                          className={inputClassName}
                        />

                        <input
                          type="text"
                          placeholder="Options separated by comma"
                          value={variant.options}
                          onChange={(event) =>
                            onVariantChange(
                              index,
                              "options",
                              event.target.value
                            )
                          }
                          className={inputClassName}
                        />

                      </div>
                    </div>
                  )
                )
              )}

            </div>
          </section>

          {/* ==============================================
              Variant Prices
          ============================================== */}

          {variantCombinations.length > 0 && (
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">

              <h3 className="font-bold text-slate-950">
                Variant Prices
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Set a custom price for each generated combination.
              </p>

              <div className="mt-4 space-y-3">

                {variantCombinations.map(
                  (combination) => {
                    const variantNames =
                      variantFields
                        .map((variant) =>
                          variant.name.trim()
                        )
                        .filter(
                          (name) => name !== ""
                        );

                    const combinationKey =
                      combination
                        .map(
                          (option, index) =>
                            `${variantNames[index]}=${option}`
                        )
                        .join("|");

                    return (
                      <div
                        key={combinationKey}
                        className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-center"
                      >

                        <div className="flex flex-wrap gap-2">

                          {combination.map(
                            (option, index) => (
                              <span
                                key={`${combinationKey}-${index}`}
                                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200"
                              >
                                {variantNames[index]}:{" "}
                                {option}
                              </span>
                            )
                          )}

                        </div>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Price"
                          value={
                            productForm
                              .variantPrices?.[
                              combinationKey
                            ] ?? ""
                          }
                          onChange={(event) =>
                            onVariantPriceChange(
                              combination,
                              event.target.value
                            )
                          }
                          className={inputClassName}
                        />

                      </div>
                    );
                  }
                )}

              </div>
            </section>
          )}

          {/* ==============================================
              Modal Actions
          ============================================== */}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg cursor-pointer border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              className="rounded-lg cursor-pointer bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {editProduct
                ? "Update Product"
                : "Add Product"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

// ======================================================
// Field Component
// ======================================================

function Field({
  label,
  children,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-700">
        {label}
      </span>

      <span className="mt-2 block">
        {children}
      </span>
    </label>
  );
}

// ======================================================
// Input Styling
// ======================================================

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";