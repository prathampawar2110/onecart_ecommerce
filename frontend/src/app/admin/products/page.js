"use client";

import { useEffect, useState } from "react";

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productService";

import { getCategories } from "@/services/categoryService";

export default function AdminProducts() {
  // ============================================================
  // State
  // ============================================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);

  // Search
  const [searchText, setSearchText] = useState("");

  // Add / Edit form
  const [showForm, setShowForm] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    stock: "",
    variants: {},
    variantPrices: {},
  });

  // Edit product
  const [editProduct, setEditProduct] = useState(null);

  // Product variants
  const [variantFields, setVariantFields] = useState([]);

  // Message State
  const [message , setMessage] = useState("");
  const [messageType , setMessageType] = useState("");

  // Format Product Date
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

  // ============================================================
  // Product Stock Status
  // ============================================================

  function getStockStatus(stock) {
    if (stock === 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-50 text-red-700 border-red-200",
        dotClassName: "bg-red-500",
      };
    }

    if (stock <= 15) {
      return {
        label: "Low Stock",
        className: "bg-orange-50 text-orange-700 border-orange-200",
        dotClassName: "bg-orange-500",
      };
    }

    return {
      label: "In Stock",
      className: "bg-green-50 text-green-700 border-green-200",
      dotClassName: "bg-green-500",
    };
  }

  // ============================================================
  // Variant Functions
  // ============================================================

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

  // ============================================================
  // Get Variant Combinations
  // ============================================================

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

    // No variants
    if (validVariants.length === 0) {
      return [];
    }

    // Start with one empty combination
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

  // ============================================================
  // Variant Price Change
  // ============================================================

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

  // ============================================================
  // Product Input
  // ============================================================

  function handleInputChange(event) {
    const { name, value } = event.target;

    setProductForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  // ============================================================
  // Reset Form
  // ============================================================

  function resetForm() {
    setProductForm({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "",
      stock: "",
      variants: {},
      variantPrices: {},
    });

    setVariantFields([]);
    setEditProduct(null);
    setShowForm(false);
  }

  // ============================================================
  // Build Variants
  // ============================================================

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

  // ============================================================
  // Build Variant Prices
  // ============================================================

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

      // IMPORTANT:
      // Read the price using the same key that
      // handleVariantPriceChange() uses.
      const price = productForm.variantPrices?.[combinationKey];

      if (price !== undefined && price !== null && price !== "") {
        variantPrices[combinationKey] = Number(price);
      }
    });

    return variantPrices;
  }

  //============================================================
  // Message display after inserting/updating product
  //============================================================

  function showMessage(message, type = "success") {
    setMessage(message);
    setMessageType(type);

    setTimeout( ()=> {
      setMessage("");
      setMessageType("");
    }, 3000);
  }

  // ============================================================
  // Add Product
  // ============================================================

  async function handleAddProduct() {
    const variants = buildVariants();
    const variantPrices = buildVariantPrices();

    try {
      const newProduct = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        image_url: productForm.image_url,
        category: productForm.category,
        stock: Number(productForm.stock),
        variants: variants,
        variantPrices: variantPrices,
      };

      const data = await addProduct(newProduct);

      const updatedProducts = await getProducts();
      setProducts(updatedProducts);

      // close form
      resetForm();

      // Show Message
      showMessage("Product Added Successfully");
    } catch (error) {
      console.error("Failed to add product:", error);
    }
  }

  // ============================================================
  // Update Product
  // ============================================================

  async function handleUpdateProduct() {
    const variants = buildVariants();
    const variantPrices = buildVariantPrices();

    try {
      const updatedProduct = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        image_url: productForm.image_url,
        category: productForm.category,
        stock: Number(productForm.stock),
        variants: variants,
        variantPrices: variantPrices,
      };
      
      await updateProduct(editProduct.productUuid, updatedProduct);

      const updatedProducts = await getProducts();
      setProducts(updatedProducts);

      // close modal
      resetForm();

      // Show Message
      showMessage("Product Updated Successfully!");

    } catch (error) {
      console.error("Failed to update product:", error);
    }
  }

  // ============================================================
  // Delete Product
  // ============================================================

  async function handleDeleteProduct(productUuid) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteProduct(productUuid);

      const updatedProducts = await getProducts();
      setProducts(updatedProducts);

      showMessage("Product Deleted Successfully!")
    } catch (error) {
      console.error("Delete Product error:", error);
    }
  }

  // ============================================================
  // Edit Product
  // ============================================================

  function handleEditProduct(product) {
    setEditProduct(product);

    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      stock: product.stock,
      variants: product.variants || {},
      variantPrices: product.variantPrices || {},
    });

    const existingVariants = Object.entries(product.variants || {}).map(
      ([name, options]) => ({
        id: crypto.randomUUID(),
        name: name,
        options: options.join(", "),
      }),
    );

    setVariantFields(existingVariants);

    setShowForm(true);
  }

  // ============================================================
  // Open Add Product Form
  // ============================================================

  function handleAddButton() {
    setEditProduct(null);

    setVariantFields([]);

    setProductForm({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "",
      stock: "",
      variants: {},
      variantPrices: {},
    });

    setShowForm(true);
  }

  // ============================================================
  // Fetch Products + Categories
  // ============================================================

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productData = await getProducts();
        const categoriesData = await getCategories();

        console.log("Admin Products:", productData);
        console.log("Admin Categories:", categoriesData);

        setProducts(productData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // ============================================================
  // Filter Products
  // ============================================================

  const filteredProducts = products.filter((product) => {
    const search = searchText.toLowerCase();

    let status = "";

    if (product.stock === 0) {
      status = "Out of Stock";
    } else if (product.stock <= 10) {
      status = "Low Stock";
    } else {
      status = "In Stock";
    }

    return (
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search) ||
      String(product.price).includes(search) ||
      String(product.stock).includes(search) ||
      status.toLowerCase().includes(search)
    );
  });

  // ============================================================
  // Loading
  // ============================================================

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen px-4">
        <p className="text-lg sm:text-xl text-blue-600 text-center">
          Loading Products...
        </p>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-100 px-3 pt-8 pb-6 sm:px-6">

      {/* Message */}
      {message && (
        <div
          className={`fixed top-5 right-5 z100 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${
            messageType === "error"
            ? "bg-red-600"
            : "bg-green-600"
          }`}
        >
          {message}
        </div>
      )}
    
      {/* ====================================================== */}
      {/* Header */}
      {/* ====================================================== */}

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
          <h1
            className="
              text-2xl
              sm:text-3xl
              font-bold
              text-gray-800
            "
          >
            Products
          </h1>

          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage your OneCart products
          </p>
        </div>

        {/* Search */}

        <div className="w-full xl:flex-1 xl:mx-4">
          <input
            type="text"
            placeholder="Search product, category, price, stock or status..."
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

        {/* Add Product */}

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
          + Add Product
        </button>
      </div>

      {/* ====================================================== */}
      {/* Add / Edit Form */}
      {/* ====================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-5 relative">
          <h2
            className="
              text-xl
              sm:text-2xl
              font-bold
              text-gray-800
              mb-5
              sm:mb-6
            "
          >
            {editProduct ? "Edit Product" : "Add New Product"}
          </h2>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-4
              sm:gap-5
            "
          >
            {/* Product Name */}

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={productForm.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
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

            {/* Category */}

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Category
              </label>

              <select
                name="category"
                value={productForm.category}
                onChange={handleInputChange}
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
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category.categoryUuid || category.name} 
                  value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Price */}

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Base Price
              </label>

              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={productForm.price}
                onChange={handleInputChange}
                placeholder="Enter base price"
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

              <p className="text-xs text-gray-500 mt-1">
                Used as the default/base product price.
              </p>
            </div>

            {/* Stock */}

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Stock
              </label>

              <input
                type="number"
                name="stock"
                min="0"
                value={productForm.stock}
                onChange={handleInputChange}
                placeholder="Enter stock quantity"
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

            {/* ================================================== */}
            {/* Product Variants */}
            {/* ================================================== */}

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-700">
                Product Variants
              </label>

              <div className="space-y-4">
                {variantFields.map((variant, index) => (
                  <div
                    key={variant.id}
                    className="
                      border
                      border-gray-300
                      rounded-lg
                      p-4
                      bg-gray-50
                    "
                  >
                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-2
                        mb-3
                      "
                    >
                      <h3 className="font-semibold text-gray-800">
                        Variant {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="
                          text-red-600
                          hover:text-red-800
                          font-medium
                          cursor-pointer
                          text-left
                          sm:text-right
                        "
                      >
                        Remove
                      </button>
                    </div>

                    <div
                      className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-4
                      "
                    >
                      {/* Variant Name */}

                      <input
                        type="text"
                        placeholder="Variant name (e.g. Color, Storage, RAM)"
                        value={variant.name}
                        onChange={(event) =>
                          handleVariantChange(index, "name", event.target.value)
                        }
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

                      {/* Variant Options */}

                      <input
                        type="text"
                        placeholder="Options separated by comma"
                        value={variant.options}
                        onChange={(event) =>
                          handleVariantChange(
                            index,
                            "options",
                            event.target.value,
                          )
                        }
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
                  </div>
                ))}
              </div>

              {/* Add Variant */}

              <button
                type="button"
                onClick={addVariant}
                className="
                  mt-4
                  w-full
                  sm:w-auto
                  px-4
                  py-2
                  bg-gray-800
                  text-white
                  rounded-lg
                  hover:bg-gray-700
                  transition
                  cursor-pointer
                "
              >
                + Add Variant
              </button>
            </div>

            {/* ================================================== */}
            {/* Variant Prices */}
            {/* ================================================== */}

            {getVariantCombinations().length > 0 && (
              <div className="md:col-span-2">
                <div className="border-t border-gray-200 pt-5 mt-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Variant Prices
                  </h3>

                  <p className="text-sm text-gray-500 mb-4">
                    Set a separate price for each variant combination.
                  </p>

                  <div className="space-y-3">
                    {getVariantCombinations().map((combination) => {
                      const variantNames = variantFields
                        .map((variant) => variant.name.trim())
                        .filter((name) => name !== "");

                      const combinationKey = combination
                        .map(
                          (option, index) => `${variantNames[index]}=${option}`,
                        )
                        .join("|");

                      return (
                        <div
                          key={combinationKey}
                          className="
                              flex
                              flex-col
                              sm:flex-row
                              sm:items-center
                              gap-3
                              border
                              border-gray-200
                              rounded-lg
                              bg-gray-50
                              p-4
                            "
                        >
                          {/* Combination */}

                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">
                              Variant Combination
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {combination.map((option, index) => (
                                <span
                                  key={`${combinationKey}-${index}`}
                                  className="
                                        inline-flex
                                        px-3
                                        py-1
                                        rounded-full
                                        bg-blue-100
                                        text-blue-700
                                        text-sm
                                        font-medium
                                      "
                                >
                                  {variantNames[index]}: {option}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Price */}

                          <div className="w-full sm:w-40">
                            <label className="block text-xs text-gray-500 mb-1">
                              Price
                            </label>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="₹ Price"
                              value={
                                productForm.variantPrices?.[combinationKey] ??
                                ""
                              }
                              onChange={(event) =>
                                handleVariantPriceChange(
                                  combination,
                                  event.target.value,
                                )
                              }
                              className="
                                  w-full
                                  px-4
                                  py-2.5
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Image URL */}

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-700">
                Image URL
              </label>

              <input
                type="text"
                name="image_url"
                value={productForm.image_url}
                onChange={handleInputChange}
                placeholder="Enter product image URL"
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

            {/* Description */}

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium text-gray-700">
                Description
              </label>

              <textarea
                name="description"
                value={productForm.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                rows="4"
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
                  resize-y
                "
              />
            </div>
          </div>

          {/* ================================================== */}
          {/* Form Buttons */}
          {/* ================================================== */}

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
              onClick={resetForm}
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
              onClick={editProduct ? handleUpdateProduct : handleAddProduct}
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
              {editProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>
        </div>
        )}
      

      {/* ====================================================== */}
      {/* Desktop Product Table */}
      {/* ====================================================== */}

      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="text-left px-4 lg:px-6 py-4">Product</th>

                <th className="text-left px-4 lg:px-6 py-4">Category</th>

                <th className="text-left px-4 lg:px-6 py-4">Price</th>

                <th className="text-left px-4 lg:px-6 py-4">Stock</th>

                <th className="text-left px-4 lg:px-6 py-4">Actions</th>

                <th className="text-left px-4 lg:px-6 py-4">Status</th>

                <th className="text-left px-4 lg:px-6 py-4">Created</th>

                <th className="text-left px-4 lg:px-6 py-3">Updated</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product.productUuid}
                    className="
                      border-b
                      border-gray-200
                      hover:bg-gray-50
                    "
                  >
                    {/* Product */}

                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="
                            w-12
                            h-12
                            lg:w-14
                            lg:h-14
                            object-contain
                            rounded-lg
                            border
                            shrink-0
                          "
                        />

                        <span className="font-semibold text-gray-800">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    {/* Category */}

                    <td className="px-4 lg:px-6 py-4 text-gray-600">
                      {product.category}
                    </td>

                    {/* Price */}

                    <td className="px-4 lg:px-6 py-4 font-semibold text-gray-800">
                      ₹{product.price}
                    </td>

                    {/* Stock */}
                    
                    <td className="px-4 lg:px-6 py-4">
                      <span
                        className={`
                        inline-flex
                        items-center
                        justify-center
                        min-w-10
                        px-2.5
                        py-1
                        rounded-md
                        text-sm
                        font-bold
                        border
                        ${
                          product.stock === 0
                            ? "bg-red-50 text-red-700 border-red-200"
                            : product.stock <= 15
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : "bg-green-50 text-green-700 border-green-200"
                        }
                      `}
                      >
                        {product.stock}
                      </span>
                    </td>

                    {/* Actions */}

                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="
                            px-3
                            py-2
                            bg-blue-100
                            text-blue-600
                            rounded-lg
                            hover:bg-blue-200
                            cursor-pointer
                            text-sm
                          "
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteProduct(product.productUuid)
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
                          "
                        >
                          Delete
                        </button>
                      </div>
                    </td>

                    {/* Status */}

                    <td className="px-4 lg:px-6 py-4">
                      {(() => {
                        const status = getStockStatus(product.stock);

                        return (
                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-2
                              px-3
                              py-1.5
                              rounded-full
                              border
                              text-sm
                              font-semibold
                              whitespace-nowrap
                              ${status.className}
                            `}
                          >
                            <span
                              className={`
                                  w-2
                                  h-2
                                  rounded-full
                                  shrink-0
                                  ${status.dotClassName}
                                `}
                            />

                            {status.label}
                          </span>
                        );
                      })()}
                    </td>

                    {/* Created Date */}

                    <td className="px-4 lg:px-6 py-4">
                      <span className="text-sm text-gray-700 whitespace-nowrap">
                        {formatProductDate(product.createdAt)}
                      </span>
                    </td>

                    {/* Updated Date */}

                    <td className="px-4 lg:px-6 py-4">
                      <span className="text-sm text-gray-700 whitespace-nowrap">
                        {formatProductDate(product.updatedAt)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="
                      px-6
                      py-10
                      text-center
                      text-gray-500
                    "
                  >
                    {searchText ? "No products found" : "No products available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================== */}
      {/* Mobile Product Cards */}
      {/* ====================================================== */}

      <div className="md:hidden space-y-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div
              key={product.productUuid}
              className="
                bg-white
                rounded-xl
                shadow-md
                p-4
                border
                border-gray-100
              "
            >
              {/* Product Header */}

              <div className="flex items-center gap-3 mb-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="
                    w-16
                    h-16
                    object-contain
                    rounded-lg
                    border
                    shrink-0
                  "
                />

                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Product</p>

                  <p className="font-semibold text-gray-800 wrap-break-words">
                    {product.name}
                  </p>
                </div>
              </div>

              {/* Product Information */}

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Category */}

                <div>
                  <p className="text-xs text-gray-500 mb-1">Category</p>

                  <p className="text-sm text-gray-700 wrap-break-words">
                    {product.category}
                  </p>
                </div>

                {/* Price */}

                <div>
                  <p className="text-xs text-gray-500 mb-1">Price</p>

                  <p className="text-sm font-semibold text-gray-800">
                    ₹{product.price}
                  </p>
                </div>

                {/* Stock */}

                <div>
                  <p className="text-xs text-gray-500 mb-1">Stock</p>

                  <p
                    className={`
                      text-sm
                      font-semibold
                      ${
                        product.stock === 0
                          ? "text-red-600"
                          : product.stock <= 15
                            ? "text-orange-500"
                            : "text-green-600"
                      }
                    `}
                  >
                    {product.stock}
                  </p>
                </div>

                {/* Status */}

                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Status</p>

                  {(() => {
                    const status = getStockStatus(product.stock);

                    return (
                      <span
                        className={`
                        inline-flex
                        items-center
                        gap-2
                        px-2.5
                        py-1.5
                        rounded-full
                        border
                        text-xs
                        font-semibold
                        whitespace-nowrap
                        ${status.className}
                      `}
                      >
                        <span
                          className={`
                          w-2
                          h-2
                          rounded-full
                          shrink-0
                          ${status.dotClassName}
                        `}
                        />

                        {status.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Created Date */}

                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>

                  <p className="text-sm text-gray-700">
                    {formatProductDate(product.createdAt)}
                  </p>
                </div>

                {/* Updated Date */}

                <div>
                  <p className="text-xs text-gray-500 mb-1">Updated</p>

                  <p className="text-sm text-gray-700">
                    {formatProductDate(product.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Mobile Actions */}

              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEditProduct(product)}
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
                  onClick={() => handleDeleteProduct(product.productUuid)}
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
            {searchText ? "No products found" : "No products available"}
          </div>
        )}
      </div>
    </div>
    )
  }