"use client";

import { useEffect, useState } from "react";
import {
  Boxes,
  Edit3,
  ImageOff,
  Package,
  Plus,
  Search,
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

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    images: [],
    category: "",
    stock: "",
    variants: {},
    variantPrices: {},
  });

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productData = await getProducts();
        const categoriesData = await getCategories();

        setProducts(productData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        showMessage(error.message || "Failed to load products", "error");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

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
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      dotClassName: "bg-emerald-500",
    };
  }

  function handleVariantChange(index, field, value) {
    setVariantFields((previousVariants) =>
      previousVariants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
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
      previousVariants.filter((_, variantIndex) => variantIndex !== index),
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
      .filter((variant) => variant.name && variant.options.length > 0);

    if (validVariants.length === 0) {
      return [];
    }

    let combinations = [[]];

    validVariants.forEach((variant) => {
      const newCombinations = [];

      combinations.forEach((combination) => {
        variant.options.forEach((option) => {
          newCombinations.push([...combination, option]);
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
      .map((option, index) => `${variantNames[index]}=${option}`)
      .join("|");

    setProductForm((previousForm) => ({
      ...previousForm,
      variantPrices: {
        ...previousForm.variantPrices,
        [combinationKey]: value,
      },
    }));
  }

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
      variants: {},
      variantPrices: {},
    });

    setVariantFields([]);
    setEditProduct(null);
    setShowForm(false);
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
        .map((option, index) => `${variantNames[index]}=${option}`)
        .join("|");

      const price = productForm.variantPrices?.[combinationKey];

      if (price !== undefined && price !== null && price !== "") {
        variantPrices[combinationKey] = Number(price);
      }
    });

    return variantPrices;
  }

  function showMessage(messageText, type = "success") {
    setMessage(messageText);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  }

  async function refreshProducts() {
    const updatedProducts = await getProducts();
    setProducts(updatedProducts);
  }

  async function handleAddProduct() {
    try {
      const newProduct = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        image_url: productForm.image_url,
        images: productForm.images.filter((url) => url.trim() !== ""),
        category: productForm.category,
        stock: Number(productForm.stock),
        variants: buildVariants(),
        variantPrices: buildVariantPrices(),
      };

      await addProduct(newProduct);
      await refreshProducts();
      resetForm();
      showMessage("Product added successfully");
    } catch (error) {
      console.error("Failed to add product:", error);
      showMessage(error.message || "Failed to add product", "error");
    }
  }

  async function handleUpdateProduct() {
    try {
      const updatedProduct = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        image_url: productForm.image_url,
        images: productForm.images.filter((url) => url.trim() !== ""),
        category: productForm.category,
        stock: Number(productForm.stock),
        variants: buildVariants(),
        variantPrices: buildVariantPrices(),
      };

      await updateProduct(editProduct.productUuid, updatedProduct);
      await refreshProducts();
      resetForm();
      showMessage("Product updated successfully");
    } catch (error) {
      console.error("Failed to update product:", error);
      showMessage(error.message || "Failed to update product", "error");
    }
  }

  async function handleDeleteProduct(productUuid) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteProduct(productUuid);
      await refreshProducts();
      showMessage("Product deleted successfully");
    } catch (error) {
      console.error("Delete Product error:", error);
      showMessage(error.message || "Failed to delete product", "error");
    }
  }

  function handleEditProduct(product) {
    setEditProduct(product);

    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      images: Array.isArray(product.images) ? product.images : [],
      category: product.category,
      stock: product.stock,
      variants: product.variants || {},
      variantPrices: product.variantPrices || {},
    });

    const existingVariants = Object.entries(product.variants || {}).map(
      ([name, options]) => ({
        id: crypto.randomUUID(),
        name,
        options: options.join(", "),
      }),
    );

    setVariantFields(existingVariants);
    setShowForm(true);
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
      variants: {},
      variantPrices: {},
    });
    setShowForm(true);
  }

  const filteredProducts = products.filter((product) => {
    const search = searchText.toLowerCase();
    const stockStatus = getStockStatus(product.stock).label.toLowerCase();

    return (
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search) ||
      String(product.price).includes(search) ||
      String(product.stock).includes(search) ||
      stockStatus.includes(search)
    );
  });

  const lowStockProducts = products.filter(
    (product) => Number(product.stock || 0) > 0 && Number(product.stock) <= 15,
  ).length;
  const outOfStockProducts = products.filter(
    (product) => Number(product.stock || 0) === 0,
  ).length;
  const totalInventory = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0,
  );

  const variantCombinations = getVariantCombinations();

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

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      {message && (
        <div
          className={`fixed right-4 top-4 z-100 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-lg ${
            messageType === "error" ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mx-auto max-w-7xl">
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

        <section className="mt-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search product, category, price, stock or status"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-950 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </section>

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
            onVariantPriceChange={handleVariantPriceChange}
            onSubmit={editProduct ? handleUpdateProduct : handleAddProduct}
            onAddImage={() =>
              setProductForm((prev) => ({
                ...prev,
                images: [...prev.images, ""],
              }))
            }
            onImageChange={(index, value) =>
              setProductForm((prev) => {
                const updated = [...prev.images];
                updated[index] = value;
                return { ...prev, images: updated };
              })
            }
            onRemoveImage={(index) =>
              setProductForm((prev) => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index),
              }))
            }
          />
        )}

        <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

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
                    const status = getStockStatus(product.stock);

                    return (
                      <tr
                        key={product.productUuid}
                        className="transition hover:bg-slate-50"
                      >
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
                                Created {formatProductDate(product.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-600">
                          {product.category}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-950">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex min-w-10 justify-center rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StockBadge status={status} />
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatProductDate(product.updatedAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product)}
                              title="Edit product"
                              className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteProduct(product.productUuid)
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
                      colSpan="7"
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      {searchText ? "No products found" : "No products available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const status = getStockStatus(product.stock);

                return (
                  <article key={product.productUuid} className="p-4 sm:p-5">
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

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Price</p>
                        <p className="mt-1 text-sm font-bold text-slate-950">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Stock</p>
                        <p className="mt-1 text-sm font-bold text-slate-950">
                          {product.stock}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Status</p>
                        <div className="mt-1">
                          <StockBadge status={status} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Updated</p>
                        <p className="mt-1 text-sm text-slate-700">
                          {formatProductDate(product.updatedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteProduct(product.productUuid)
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
                {searchText ? "No products found" : "No products available"}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
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

function StockBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
    >
      <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
      {status.label}
    </span>
  );
}

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
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
              {editProduct ? "Edit Product" : "Add Product"}
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
          <div className="grid gap-4 md:grid-cols-2">
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

            <Field label="Category">
              <select
                name="category"
                value={productForm.category}
                onChange={onInputChange}
                className={inputClassName}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option
                    key={category.categoryUuid || category.name}
                    value={category.name}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

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

            <Field label="Primary Image URL" className="md:col-span-2">
              <input
                type="text"
                name="image_url"
                value={productForm.image_url}
                onChange={onInputChange}
                placeholder="Enter primary product image URL"
                className={inputClassName}
              />
            </Field>

            {/* EXTRA IMAGES */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
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
                  {productForm.images.map((imgUrl, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {imgUrl.trim() && (
                        <img
                          src={imgUrl}
                          alt={`Preview ${index + 1}`}
                          className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-contain bg-white"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <input
                        type="text"
                        value={imgUrl}
                        onChange={(e) => onImageChange(index, e.target.value)}
                        placeholder={`Image URL ${index + 1}`}
                        className={`${inputClassName} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveImage(index)}
                        title="Remove image"
                        className="inline-flex cursor-pointer h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Field label="Description" className="md:col-span-2">
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

          <section className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-slate-950">Variants</h3>
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
                variantFields.map((variant, index) => (
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
                        onClick={() => onRemoveVariant(index)}
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
                          onVariantChange(index, "name", event.target.value)
                        }
                        className={inputClassName}
                      />

                      <input
                        type="text"
                        placeholder="Options separated by comma"
                        value={variant.options}
                        onChange={(event) =>
                          onVariantChange(index, "options", event.target.value)
                        }
                        className={inputClassName}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {variantCombinations.length > 0 && (
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-bold text-slate-950">Variant Prices</h3>
              <p className="mt-1 text-sm text-slate-500">
                Set a custom price for each generated combination.
              </p>

              <div className="mt-4 space-y-3">
                {variantCombinations.map((combination) => {
                  const variantNames = variantFields
                    .map((variant) => variant.name.trim())
                    .filter((name) => name !== "");

                  const combinationKey = combination
                    .map((option, index) => `${variantNames[index]}=${option}`)
                    .join("|");

                  return (
                    <div
                      key={combinationKey}
                      className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-center"
                    >
                      <div className="flex flex-wrap gap-2">
                        {combination.map((option, index) => (
                          <span
                            key={`${combinationKey}-${index}`}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-200"
                          >
                            {variantNames[index]}: {option}
                          </span>
                        ))}
                      </div>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={productForm.variantPrices?.[combinationKey] ?? ""}
                        onChange={(event) =>
                          onVariantPriceChange(combination, event.target.value)
                        }
                        className={inputClassName}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

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
              {editProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";


// "use client";

// import { useEffect, useState } from "react";

// import {
//   getProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
// } from "@/services/productService";

// import { getCategories } from "@/services/categoryService";

// export default function AdminProducts() {
//   // ============================================================
//   // State
//   // ============================================================

//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [categories, setCategories] = useState([]);

//   // Search
//   const [searchText, setSearchText] = useState("");

//   // Add / Edit form
//   const [showForm, setShowForm] = useState(false);

//   const [productForm, setProductForm] = useState({
//     name: "",
//     description: "",
//     price: "",
//     image_url: "",
//     category: "",
//     stock: "",
//     variants: {},
//     variantPrices: {},
//   });

//   // Edit product
//   const [editProduct, setEditProduct] = useState(null);

//   // Product variants
//   const [variantFields, setVariantFields] = useState([]);

//   // Message State
//   const [message , setMessage] = useState("");
//   const [messageType , setMessageType] = useState("");

//   // Format Product Date
//   function formatProductDate(date) {
//     if (!date) {
//       return "N/A";
//     }
//     return new Date(date).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   }

//   // ============================================================
//   // Product Stock Status
//   // ============================================================

//   function getStockStatus(stock) {
//     if (stock === 0) {
//       return {
//         label: "Out of Stock",
//         className: "bg-red-50 text-red-700 border-red-200",
//         dotClassName: "bg-red-500",
//       };
//     }

//     if (stock <= 15) {
//       return {
//         label: "Low Stock",
//         className: "bg-orange-50 text-orange-700 border-orange-200",
//         dotClassName: "bg-orange-500",
//       };
//     }

//     return {
//       label: "In Stock",
//       className: "bg-green-50 text-green-700 border-green-200",
//       dotClassName: "bg-green-500",
//     };
//   }

//   // ============================================================
//   // Variant Functions
//   // ============================================================

//   function handleVariantChange(index, field, value) {
//     setVariantFields((previousVariants) =>
//       previousVariants.map((variant, variantIndex) =>
//         variantIndex === index
//           ? {
//               ...variant,
//               [field]: value,
//             }
//           : variant,
//       ),
//     );
//   }
//   function addVariant() {
//     setVariantFields((previousVariants) => [
//       ...previousVariants,
//       {
//         id: crypto.randomUUID(),
//         name: "",
//         options: "",
//       },
//     ]);
//   }

//   function removeVariant(index) {
//     setVariantFields((previousVariants) =>
//       previousVariants.filter((_, variantIndex) => variantIndex !== index),
//     );
//   }

//   // ============================================================
//   // Get Variant Combinations
//   // ============================================================

//   function getVariantCombinations() {
//     const validVariants = variantFields
//       .map((variant) => ({
//         name: variant.name.trim(),

//         options: variant.options
//           .split(",")
//           .map((option) => option.trim())
//           .filter((option) => option !== ""),
//       }))
//       .filter((variant) => variant.name && variant.options.length > 0);

//     // No variants
//     if (validVariants.length === 0) {
//       return [];
//     }

//     // Start with one empty combination
//     let combinations = [[]];

//     validVariants.forEach((variant) => {
//       const newCombinations = [];

//       combinations.forEach((combination) => {
//         variant.options.forEach((option) => {
//           newCombinations.push([...combination, option]);
//         });
//       });

//       combinations = newCombinations;
//     });

//     return combinations;
//   }

//   // ============================================================
//   // Variant Price Change
//   // ============================================================

//   function handleVariantPriceChange(combination, value) {
//     const variantNames = variantFields
//       .map((variant) => variant.name.trim())
//       .filter((name) => name !== "");

//     const combinationKey = combination
//       .map((option, index) => `${variantNames[index]}=${option}`)
//       .join("|");

//     setProductForm((previousForm) => ({
//       ...previousForm,

//       variantPrices: {
//         ...previousForm.variantPrices,
//         [combinationKey]: value,
//       },
//     }));
//   }

//   // ============================================================
//   // Product Input
//   // ============================================================

//   function handleInputChange(event) {
//     const { name, value } = event.target;

//     setProductForm((previousForm) => ({
//       ...previousForm,
//       [name]: value,
//     }));
//   }

//   // ============================================================
//   // Reset Form
//   // ============================================================

//   function resetForm() {
//     setProductForm({
//       name: "",
//       description: "",
//       price: "",
//       image_url: "",
//       category: "",
//       stock: "",
//       variants: {},
//       variantPrices: {},
//     });

//     setVariantFields([]);
//     setEditProduct(null);
//     setShowForm(false);
//   }

//   // ============================================================
//   // Build Variants
//   // ============================================================

//   function buildVariants() {
//     const variants = {};

//     variantFields.forEach((variant) => {
//       const name = variant.name.trim();

//       const options = variant.options
//         .split(",")
//         .map((option) => option.trim())
//         .filter((option) => option !== "");

//       if (name && options.length > 0) {
//         variants[name] = options;
//       }
//     });

//     return variants;
//   }

//   // ============================================================
//   // Build Variant Prices
//   // ============================================================

//   function buildVariantPrices() {
//     const combinations = getVariantCombinations();

//     const variantPrices = {};

//     const variantNames = variantFields
//       .map((variant) => variant.name.trim())
//       .filter((name) => name !== "");

//     combinations.forEach((combination) => {
//       const combinationKey = combination
//         .map((option, index) => `${variantNames[index]}=${option}`)
//         .join("|");

//       // IMPORTANT:
//       // Read the price using the same key that
//       // handleVariantPriceChange() uses.
//       const price = productForm.variantPrices?.[combinationKey];

//       if (price !== undefined && price !== null && price !== "") {
//         variantPrices[combinationKey] = Number(price);
//       }
//     });

//     return variantPrices;
//   }

//   //============================================================
//   // Message display after inserting/updating product
//   //============================================================

//   function showMessage(message, type = "success") {
//     setMessage(message);
//     setMessageType(type);

//     setTimeout( ()=> {
//       setMessage("");
//       setMessageType("");
//     }, 3000);
//   }

//   // ============================================================
//   // Add Product
//   // ============================================================

//   async function handleAddProduct() {
//     const variants = buildVariants();
//     const variantPrices = buildVariantPrices();

//     try {
//       const newProduct = {
//         name: productForm.name,
//         description: productForm.description,
//         price: Number(productForm.price),
//         image_url: productForm.image_url,
//         category: productForm.category,
//         stock: Number(productForm.stock),
//         variants: variants,
//         variantPrices: variantPrices,
//       };

//       const data = await addProduct(newProduct);

//       const updatedProducts = await getProducts();
//       setProducts(updatedProducts);

//       // close form
//       resetForm();

//       // Show Message
//       showMessage("Product Added Successfully");
//     } catch (error) {
//       console.error("Failed to add product:", error);
//     }
//   }

//   // ============================================================
//   // Update Product
//   // ============================================================

//   async function handleUpdateProduct() {
//     const variants = buildVariants();
//     const variantPrices = buildVariantPrices();

//     try {
//       const updatedProduct = {
//         name: productForm.name,
//         description: productForm.description,
//         price: Number(productForm.price),
//         image_url: productForm.image_url,
//         category: productForm.category,
//         stock: Number(productForm.stock),
//         variants: variants,
//         variantPrices: variantPrices,
//       };
      
//       await updateProduct(editProduct.productUuid, updatedProduct);

//       const updatedProducts = await getProducts();
//       setProducts(updatedProducts);

//       // close modal
//       resetForm();

//       // Show Message
//       showMessage("Product Updated Successfully!");

//     } catch (error) {
//       console.error("Failed to update product:", error);
//     }
//   }

//   // ============================================================
//   // Delete Product
//   // ============================================================

//   async function handleDeleteProduct(productUuid) {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this product?",
//     );

//     if (!confirmDelete) {
//       return;
//     }

//     try {
//       await deleteProduct(productUuid);

//       const updatedProducts = await getProducts();
//       setProducts(updatedProducts);

//       showMessage("Product Deleted Successfully!")
//     } catch (error) {
//       console.error("Delete Product error:", error);
//     }
//   }

//   // ============================================================
//   // Edit Product
//   // ============================================================

//   function handleEditProduct(product) {
//     setEditProduct(product);

//     setProductForm({
//       name: product.name,
//       description: product.description,
//       price: product.price,
//       image_url: product.image_url,
//       category: product.category,
//       stock: product.stock,
//       variants: product.variants || {},
//       variantPrices: product.variantPrices || {},
//     });

//     const existingVariants = Object.entries(product.variants || {}).map(
//       ([name, options]) => ({
//         id: crypto.randomUUID(),
//         name: name,
//         options: options.join(", "),
//       }),
//     );

//     setVariantFields(existingVariants);

//     setShowForm(true);
//   }

//   // ============================================================
//   // Open Add Product Form
//   // ============================================================

//   function handleAddButton() {
//     setEditProduct(null);

//     setVariantFields([]);

//     setProductForm({
//       name: "",
//       description: "",
//       price: "",
//       image_url: "",
//       category: "",
//       stock: "",
//       variants: {},
//       variantPrices: {},
//     });

//     setShowForm(true);
//   }

//   // ============================================================
//   // Fetch Products + Categories
//   // ============================================================

//   useEffect(() => {
//     async function fetchProducts() {
//       try {
//         const productData = await getProducts();
//         const categoriesData = await getCategories();

//         console.log("Admin Products:", productData);
//         console.log("Admin Categories:", categoriesData);

//         setProducts(productData);
//         setCategories(categoriesData);
//       } catch (error) {
//         console.error("Failed to fetch admin data:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchProducts();
//   }, []);

//   // ============================================================
//   // Filter Products
//   // ============================================================

//   const filteredProducts = products.filter((product) => {
//     const search = searchText.toLowerCase();

//     let status = "";

//     if (product.stock === 0) {
//       status = "Out of Stock";
//     } else if (product.stock <= 10) {
//       status = "Low Stock";
//     } else {
//       status = "In Stock";
//     }

//     return (
//       product.name.toLowerCase().includes(search) ||
//       product.category.toLowerCase().includes(search) ||
//       String(product.price).includes(search) ||
//       String(product.stock).includes(search) ||
//       status.toLowerCase().includes(search)
//     );
//   });

//   // ============================================================
//   // Loading
//   // ============================================================

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen px-4">
//         <p className="text-lg sm:text-xl text-blue-600 text-center">
//           Loading Products...
//         </p>
//       </div>
//     );
//   }

//   // ============================================================
//   // UI
//   // ============================================================

//   return (
//     <div className="min-h-screen bg-gray-100 px-3 pt-8 pb-6 sm:px-6">

//       {/* Message */}
//       {message && (
//         <div
//           className={`fixed top-5 right-5 z100 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${
//             messageType === "error"
//             ? "bg-red-600"
//             : "bg-green-600"
//           }`}
//         >
//           {message}
//         </div>
//       )}
    
//       {/* ====================================================== */}
//       {/* Header */}
//       {/* ====================================================== */}

//       <div
//         className="
//           flex
//           flex-col
//           xl:flex-row
//           xl:items-center
//           gap-4
//           mb-6
//           sm:mb-8
//         "
//       >
//         {/* Title */}

//         <div className="shrink-0">
//           <h1
//             className="
//               text-2xl
//               sm:text-3xl
//               font-bold
//               text-gray-800
//             "
//           >
//             Products
//           </h1>

//           <p className="text-gray-500 mt-1 text-sm sm:text-base">
//             Manage your OneCart products
//           </p>
//         </div>

//         {/* Search */}

//         <div className="w-full xl:flex-1 xl:mx-4">
//           <input
//             type="text"
//             placeholder="Search product, category, price, stock or status..."
//             value={searchText}
//             onChange={(event) => setSearchText(event.target.value)}
//             className="
//               w-full
//               px-4
//               py-3
//               border
//               border-gray-300
//               rounded-lg
//               text-black
//               bg-white
//               focus:outline-none
//               focus:ring-2
//               focus:ring-blue-500
//             "
//           />
//         </div>

//         {/* Add Product */}

//         <button
//           onClick={handleAddButton}
//           className="
//             w-full
//             xl:w-auto
//             bg-blue-600
//             text-white
//             px-5
//             py-3
//             rounded-lg
//             font-semibold
//             hover:bg-blue-700
//             transition
//             cursor-pointer
//             whitespace-nowrap
//           "
//         >
//           + Add Product
//         </button>
//       </div>

//       {/* ====================================================== */}
//       {/* Add / Edit Form */}
//       {/* ====================================================== */}

//       {showForm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

//           <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-5 relative">
//           <h2
//             className="
//               text-xl
//               sm:text-2xl
//               font-bold
//               text-gray-800
//               mb-5
//               sm:mb-6
//             "
//           >
//             {editProduct ? "Edit Product" : "Add New Product"}
//           </h2>

//           <div
//             className="
//               grid
//               grid-cols-1
//               md:grid-cols-2
//               gap-4
//               sm:gap-5
//             "
//           >
//             {/* Product Name */}

//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Product Name
//               </label>

//               <input
//                 type="text"
//                 name="name"
//                 value={productForm.name}
//                 onChange={handleInputChange}
//                 placeholder="Enter product name"
//                 className="
//                   w-full
//                   px-4
//                   py-3
//                   border
//                   border-gray-300
//                   rounded-lg
//                   text-black
//                   focus:outline-none
//                   focus:ring-2
//                   focus:ring-blue-500
//                 "
//               />
//             </div>

//             {/* Category */}

//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Category
//               </label>

//               <select
//                 name="category"
//                 value={productForm.category}
//                 onChange={handleInputChange}
//                 className="
//                   w-full
//                   px-4
//                   py-3
//                   border
//                   border-gray-300
//                   rounded-lg
//                   text-black
//                   bg-white
//                   focus:outline-none
//                   focus:ring-2
//                   focus:ring-blue-500
//                 "
//               >
//                 <option value="">Select category</option>

//                 {categories.map((category) => (
//                   <option key={category.categoryUuid || category.name} 
//                   value={category.name}>
//                     {category.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Base Price */}

//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Base Price
//               </label>

//               <input
//                 type="number"
//                 name="price"
//                 min="0"
//                 step="0.01"
//                 value={productForm.price}
//                 onChange={handleInputChange}
//                 placeholder="Enter base price"
//                 className="
//                   w-full
//                   px-4
//                   py-3
//                   border
//                   border-gray-300
//                   rounded-lg
//                   text-black
//                   focus:outline-none
//                   focus:ring-2
//                   focus:ring-blue-500
//                 "
//               />

//               <p className="text-xs text-gray-500 mt-1">
//                 Used as the default/base product price.
//               </p>
//             </div>

//             {/* Stock */}

//             <div>
//               <label className="block mb-2 font-medium text-gray-700">
//                 Stock
//               </label>

//               <input
//                 type="number"
//                 name="stock"
//                 min="0"
//                 value={productForm.stock}
//                 onChange={handleInputChange}
//                 placeholder="Enter stock quantity"
//                 className="
//                   w-full
//                   px-4
//                   py-3
//                   border
//                   border-gray-300
//                   rounded-lg
//                   text-black
//                   focus:outline-none
//                   focus:ring-2
//                   focus:ring-blue-500
//                 "
//               />
//             </div>

//             {/* ================================================== */}
//             {/* Product Variants */}
//             {/* ================================================== */}

//             <div className="md:col-span-2">
//               <label className="block mb-2 font-medium text-gray-700">
//                 Product Variants
//               </label>

//               <div className="space-y-4">
//                 {variantFields.map((variant, index) => (
//                   <div
//                     key={variant.id}
//                     className="
//                       border
//                       border-gray-300
//                       rounded-lg
//                       p-4
//                       bg-gray-50
//                     "
//                   >
//                     <div
//                       className="
//                         flex
//                         flex-col
//                         sm:flex-row
//                         sm:items-center
//                         sm:justify-between
//                         gap-2
//                         mb-3
//                       "
//                     >
//                       <h3 className="font-semibold text-gray-800">
//                         Variant {index + 1}
//                       </h3>

//                       <button
//                         type="button"
//                         onClick={() => removeVariant(index)}
//                         className="
//                           text-red-600
//                           hover:text-red-800
//                           font-medium
//                           cursor-pointer
//                           text-left
//                           sm:text-right
//                         "
//                       >
//                         Remove
//                       </button>
//                     </div>

//                     <div
//                       className="
//                         grid
//                         grid-cols-1
//                         md:grid-cols-2
//                         gap-4
//                       "
//                     >
//                       {/* Variant Name */}

//                       <input
//                         type="text"
//                         placeholder="Variant name (e.g. Color, Storage, RAM)"
//                         value={variant.name}
//                         onChange={(event) =>
//                           handleVariantChange(index, "name", event.target.value)
//                         }
//                         className="
//                           w-full
//                           px-4
//                           py-3
//                           border
//                           border-gray-300
//                           rounded-lg
//                           text-black
//                           focus:outline-none
//                           focus:ring-2
//                           focus:ring-blue-500
//                         "
//                       />

//                       {/* Variant Options */}

//                       <input
//                         type="text"
//                         placeholder="Options separated by comma"
//                         value={variant.options}
//                         onChange={(event) =>
//                           handleVariantChange(
//                             index,
//                             "options",
//                             event.target.value,
//                           )
//                         }
//                         className="
//                           w-full
//                           px-4
//                           py-3
//                           border
//                           border-gray-300
//                           rounded-lg
//                           text-black
//                           focus:outline-none
//                           focus:ring-2
//                           focus:ring-blue-500
//                         "
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Add Variant */}

//               <button
//                 type="button"
//                 onClick={addVariant}
//                 className="
//                   mt-4
//                   w-full
//                   sm:w-auto
//                   px-4
//                   py-2
//                   bg-gray-800
//                   text-white
//                   rounded-lg
//                   hover:bg-gray-700
//                   transition
//                   cursor-pointer
//                 "
//               >
//                 + Add Variant
//               </button>
//             </div>

//             {/* ================================================== */}
//             {/* Variant Prices */}
//             {/* ================================================== */}

//             {getVariantCombinations().length > 0 && (
//               <div className="md:col-span-2">
//                 <div className="border-t border-gray-200 pt-5 mt-1">
//                   <h3 className="text-lg font-bold text-gray-800 mb-1">
//                     Variant Prices
//                   </h3>

//                   <p className="text-sm text-gray-500 mb-4">
//                     Set a separate price for each variant combination.
//                   </p>

//                   <div className="space-y-3">
//                     {getVariantCombinations().map((combination) => {
//                       const variantNames = variantFields
//                         .map((variant) => variant.name.trim())
//                         .filter((name) => name !== "");

//                       const combinationKey = combination
//                         .map(
//                           (option, index) => `${variantNames[index]}=${option}`,
//                         )
//                         .join("|");

//                       return (
//                         <div
//                           key={combinationKey}
//                           className="
//                               flex
//                               flex-col
//                               sm:flex-row
//                               sm:items-center
//                               gap-3
//                               border
//                               border-gray-200
//                               rounded-lg
//                               bg-gray-50
//                               p-4
//                             "
//                         >
//                           {/* Combination */}

//                           <div className="flex-1">
//                             <p className="text-sm text-gray-500 mb-1">
//                               Variant Combination
//                             </p>

//                             <div className="flex flex-wrap gap-2">
//                               {combination.map((option, index) => (
//                                 <span
//                                   key={`${combinationKey}-${index}`}
//                                   className="
//                                         inline-flex
//                                         px-3
//                                         py-1
//                                         rounded-full
//                                         bg-blue-100
//                                         text-blue-700
//                                         text-sm
//                                         font-medium
//                                       "
//                                 >
//                                   {variantNames[index]}: {option}
//                                 </span>
//                               ))}
//                             </div>
//                           </div>

//                           {/* Price */}

//                           <div className="w-full sm:w-40">
//                             <label className="block text-xs text-gray-500 mb-1">
//                               Price
//                             </label>

//                             <input
//                               type="number"
//                               min="0"
//                               step="0.01"
//                               placeholder="₹ Price"
//                               value={
//                                 productForm.variantPrices?.[combinationKey] ??
//                                 ""
//                               }
//                               onChange={(event) =>
//                                 handleVariantPriceChange(
//                                   combination,
//                                   event.target.value,
//                                 )
//                               }
//                               className="
//                                   w-full
//                                   px-4
//                                   py-2.5
//                                   border
//                                   border-gray-300
//                                   rounded-lg
//                                   text-black
//                                   bg-white
//                                   focus:outline-none
//                                   focus:ring-2
//                                   focus:ring-blue-500
//                                 "
//                             />
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Image URL */}

//             <div className="md:col-span-2">
//               <label className="block mb-2 font-medium text-gray-700">
//                 Image URL
//               </label>

//               <input
//                 type="text"
//                 name="image_url"
//                 value={productForm.image_url}
//                 onChange={handleInputChange}
//                 placeholder="Enter product image URL"
//                 className="
//                   w-full
//                   px-4
//                   py-3
//                   border
//                   border-gray-300
//                   rounded-lg
//                   text-black
//                   focus:outline-none
//                   focus:ring-2
//                   focus:ring-blue-500
//                 "
//               />
//             </div>

//             {/* Description */}

//             <div className="md:col-span-2">
//               <label className="block mb-2 font-medium text-gray-700">
//                 Description
//               </label>

//               <textarea
//                 name="description"
//                 value={productForm.description}
//                 onChange={handleInputChange}
//                 placeholder="Enter product description"
//                 rows="4"
//                 className="
//                   w-full
//                   px-4
//                   py-3
//                   border
//                   border-gray-300
//                   rounded-lg
//                   text-black
//                   focus:outline-none
//                   focus:ring-2
//                   focus:ring-blue-500
//                   resize-y
//                 "
//               />
//             </div>
//           </div>

//           {/* ================================================== */}
//           {/* Form Buttons */}
//           {/* ================================================== */}

//           <div
//             className="
//               flex
//               flex-col-reverse
//               sm:flex-row
//               justify-end
//               gap-3
//               mt-6
//             "
//           >
//             <button
//               type="button"
//               onClick={resetForm}
//               className="
//                 w-full
//                 sm:w-auto
//                 px-5
//                 py-3
//                 border
//                 border-gray-300
//                 rounded-lg
//                 text-gray-700
//                 hover:bg-gray-100
//                 transition
//                 cursor-pointer
//               "
//             >
//               Cancel
//             </button>

//             <button
//               type="button"
//               onClick={editProduct ? handleUpdateProduct : handleAddProduct}
//               className="
//                 w-full
//                 sm:w-auto
//                 px-5
//                 py-3
//                 bg-blue-600
//                 text-white
//                 rounded-lg
//                 font-semibold
//                 hover:bg-blue-700
//                 transition
//                 cursor-pointer
//               "
//             >
//               {editProduct ? "Update Product" : "Add Product"}
//             </button>
//           </div>
//         </div>
//         </div>
//         )}
      

//       {/* ====================================================== */}
//       {/* Desktop Product Table */}
//       {/* ====================================================== */}

//       <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-900 text-white">
//               <tr>
//                 <th className="text-left px-4 lg:px-6 py-4">Product</th>

//                 <th className="text-left px-4 lg:px-6 py-4">Category</th>

//                 <th className="text-left px-4 lg:px-6 py-4">Price</th>

//                 <th className="text-left px-4 lg:px-6 py-4">Stock</th>

//                 <th className="text-left px-4 lg:px-6 py-4">Actions</th>

//                 <th className="text-left px-4 lg:px-6 py-4">Status</th>

//                 <th className="text-left px-4 lg:px-6 py-4">Created</th>

//                 <th className="text-left px-4 lg:px-6 py-3">Updated</th>
//               </tr>
//             </thead>

//             <tbody>
//               {filteredProducts.length > 0 ? (
//                 filteredProducts.map((product) => (
//                   <tr
//                     key={product.productUuid}
//                     className="
//                       border-b
//                       border-gray-200
//                       hover:bg-gray-50
//                     "
//                   >
//                     {/* Product */}

//                     <td className="px-4 lg:px-6 py-4">
//                       <div className="flex items-center gap-4">
//                         <img
//                           src={product.image_url}
//                           alt={product.name}
//                           className="
//                             w-12
//                             h-12
//                             lg:w-14
//                             lg:h-14
//                             object-contain
//                             rounded-lg
//                             border
//                             shrink-0
//                           "
//                         />

//                         <span className="font-semibold text-gray-800">
//                           {product.name}
//                         </span>
//                       </div>
//                     </td>

//                     {/* Category */}

//                     <td className="px-4 lg:px-6 py-4 text-gray-600">
//                       {product.category}
//                     </td>

//                     {/* Price */}

//                     <td className="px-4 lg:px-6 py-4 font-semibold text-gray-800">
//                       ₹{product.price}
//                     </td>

//                     {/* Stock */}
                    
//                     <td className="px-4 lg:px-6 py-4">
//                       <span
//                         className={`
//                         inline-flex
//                         items-center
//                         justify-center
//                         min-w-10
//                         px-2.5
//                         py-1
//                         rounded-md
//                         text-sm
//                         font-bold
//                         border
//                         ${
//                           product.stock === 0
//                             ? "bg-red-50 text-red-700 border-red-200"
//                             : product.stock <= 15
//                               ? "bg-orange-50 text-orange-700 border-orange-200"
//                               : "bg-green-50 text-green-700 border-green-200"
//                         }
//                       `}
//                       >
//                         {product.stock}
//                       </span>
//                     </td>

//                     {/* Actions */}

//                     <td className="px-4 lg:px-6 py-4">
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => handleEditProduct(product)}
//                           className="
//                             px-3
//                             py-2
//                             bg-blue-100
//                             text-blue-600
//                             rounded-lg
//                             hover:bg-blue-200
//                             cursor-pointer
//                             text-sm
//                           "
//                         >
//                           Edit
//                         </button>

//                         <button
//                           onClick={() =>
//                             handleDeleteProduct(product.productUuid)
//                           }
//                           className="
//                             px-3
//                             py-2
//                             bg-red-100
//                             text-red-600
//                             rounded-lg
//                             hover:bg-red-200
//                             cursor-pointer
//                             text-sm
//                           "
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </td>

//                     {/* Status */}

//                     <td className="px-4 lg:px-6 py-4">
//                       {(() => {
//                         const status = getStockStatus(product.stock);

//                         return (
//                           <span
//                             className={`
//                               inline-flex
//                               items-center
//                               gap-2
//                               px-3
//                               py-1.5
//                               rounded-full
//                               border
//                               text-sm
//                               font-semibold
//                               whitespace-nowrap
//                               ${status.className}
//                             `}
//                           >
//                             <span
//                               className={`
//                                   w-2
//                                   h-2
//                                   rounded-full
//                                   shrink-0
//                                   ${status.dotClassName}
//                                 `}
//                             />

//                             {status.label}
//                           </span>
//                         );
//                       })()}
//                     </td>

//                     {/* Created Date */}

//                     <td className="px-4 lg:px-6 py-4">
//                       <span className="text-sm text-gray-700 whitespace-nowrap">
//                         {formatProductDate(product.createdAt)}
//                       </span>
//                     </td>

//                     {/* Updated Date */}

//                     <td className="px-4 lg:px-6 py-4">
//                       <span className="text-sm text-gray-700 whitespace-nowrap">
//                         {formatProductDate(product.updatedAt)}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td
//                     colSpan="8"
//                     className="
//                       px-6
//                       py-10
//                       text-center
//                       text-gray-500
//                     "
//                   >
//                     {searchText ? "No products found" : "No products available"}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* ====================================================== */}
//       {/* Mobile Product Cards */}
//       {/* ====================================================== */}

//       <div className="md:hidden space-y-4">
//         {filteredProducts.length > 0 ? (
//           filteredProducts.map((product) => (
//             <div
//               key={product.productUuid}
//               className="
//                 bg-white
//                 rounded-xl
//                 shadow-md
//                 p-4
//                 border
//                 border-gray-100
//               "
//             >
//               {/* Product Header */}

//               <div className="flex items-center gap-3 mb-4">
//                 <img
//                   src={product.image_url}
//                   alt={product.name}
//                   className="
//                     w-16
//                     h-16
//                     object-contain
//                     rounded-lg
//                     border
//                     shrink-0
//                   "
//                 />

//                 <div className="min-w-0">
//                   <p className="text-xs text-gray-500 mb-1">Product</p>

//                   <p className="font-semibold text-gray-800 wrap-break-words">
//                     {product.name}
//                   </p>
//                 </div>
//               </div>

//               {/* Product Information */}

//               <div className="grid grid-cols-2 gap-4 mb-4">
//                 {/* Category */}

//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Category</p>

//                   <p className="text-sm text-gray-700 wrap-break-words">
//                     {product.category}
//                   </p>
//                 </div>

//                 {/* Price */}

//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Price</p>

//                   <p className="text-sm font-semibold text-gray-800">
//                     ₹{product.price}
//                   </p>
//                 </div>

//                 {/* Stock */}

//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Stock</p>

//                   <p
//                     className={`
//                       text-sm
//                       font-semibold
//                       ${
//                         product.stock === 0
//                           ? "text-red-600"
//                           : product.stock <= 15
//                             ? "text-orange-500"
//                             : "text-green-600"
//                       }
//                     `}
//                   >
//                     {product.stock}
//                   </p>
//                 </div>

//                 {/* Status */}

//                 <div>
//                   <p className="text-xs text-gray-500 mb-1.5">Status</p>

//                   {(() => {
//                     const status = getStockStatus(product.stock);

//                     return (
//                       <span
//                         className={`
//                         inline-flex
//                         items-center
//                         gap-2
//                         px-2.5
//                         py-1.5
//                         rounded-full
//                         border
//                         text-xs
//                         font-semibold
//                         whitespace-nowrap
//                         ${status.className}
//                       `}
//                       >
//                         <span
//                           className={`
//                           w-2
//                           h-2
//                           rounded-full
//                           shrink-0
//                           ${status.dotClassName}
//                         `}
//                         />

//                         {status.label}
//                       </span>
//                     );
//                   })()}
//                 </div>

//                 {/* Created Date */}

//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Created</p>

//                   <p className="text-sm text-gray-700">
//                     {formatProductDate(product.createdAt)}
//                   </p>
//                 </div>

//                 {/* Updated Date */}

//                 <div>
//                   <p className="text-xs text-gray-500 mb-1">Updated</p>

//                   <p className="text-sm text-gray-700">
//                     {formatProductDate(product.updatedAt)}
//                   </p>
//                 </div>
//               </div>

//               {/* Mobile Actions */}

//               <div className="flex gap-3 pt-3 border-t border-gray-100">
//                 <button
//                   onClick={() => handleEditProduct(product)}
//                   className="
//                     flex-1
//                     px-3
//                     py-2.5
//                     bg-blue-100
//                     text-blue-600
//                     rounded-lg
//                     hover:bg-blue-200
//                     cursor-pointer
//                     font-medium
//                   "
//                 >
//                   Edit
//                 </button>

//                 <button
//                   onClick={() => handleDeleteProduct(product.productUuid)}
//                   className="
//                     flex-1
//                     px-3
//                     py-2.5
//                     bg-red-100
//                     text-red-600
//                     rounded-lg
//                     hover:bg-red-200
//                     cursor-pointer
//                     font-medium
//                   "
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div
//             className="
//               bg-white
//               rounded-xl
//               shadow-md
//               px-6
//               py-10
//               text-center
//               text-gray-500
//             "
//           >
//             {searchText ? "No products found" : "No products available"}
//           </div>
//         )}
//       </div>
//     </div>
//     )
//   }