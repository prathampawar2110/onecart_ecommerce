const API_URL = "http://127.0.0.1:8000";

// -----------------------------------------------------------------------------
// 1. Get all products
// -----------------------------------------------------------------------------

export async function getProducts() {
  const response = await fetch(`${API_URL}/products`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();

  // console.log("GET /products response:", data);

  if (!Array.isArray(data)) {
    throw new Error("Invalid products response");
  }

  return data;
}

// -----------------------------------------------------------------------------
// 2. Get single product by UUID
// -----------------------------------------------------------------------------

export async function getProductById(productUuid) {

  // console.log("Fetching product UUID:", productUuid);

  if (!productUuid) {
    throw new Error("Product UUID is missing");
  }

  const response = await fetch(
    `${API_URL}/products/${productUuid}`,
  );

  console.log("Product API status:", response.status);

  const data = await response.json();

  // console.log("Product API response:", data);

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch product");
  }

  return data;
}

// -----------------------------------------------------------------------------
// 3. Search products
// -----------------------------------------------------------------------------

export async function searchProducts(query) {
  const response = await fetch(
    `${API_URL}/products/search?query=${encodeURIComponent(query)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to search products");
  }

  const data = await response.json();

  return data;
}

// -----------------------------------------------------------------------------
// 4. Get products by category
// -----------------------------------------------------------------------------

export async function getProductByCategory(category) {
  const response = await fetch(
    `${API_URL}/products/category/${encodeURIComponent(category)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch category products");
  }

  const data = await response.json();

  return data;
}

// -----------------------------------------------------------------------------
// 5. Admin - Add product
// -----------------------------------------------------------------------------

export async function addProduct(product) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/products`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(data.detail || "Failed to add product");
  }

  return await response.json();
}

// -----------------------------------------------------------------------------
// 6. Admin - Update product
// -----------------------------------------------------------------------------

export async function updateProduct(productUuid, product) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/products/${productUuid}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(data.detail || "Failed to update product");
  }

  return await response.json();
}

// -----------------------------------------------------------------------------
// 7. Admin - Delete product
// -----------------------------------------------------------------------------

export async function deleteProduct(productUuid) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/products/${productUuid}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(data.detail || "Failed to delete product");
  }

  return await response.json();
}