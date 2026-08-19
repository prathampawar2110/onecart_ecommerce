const API_URL = "http://127.0.0.1:8000";

// --------------------------------------------------
// Get Cart
// --------------------------------------------------

export async function getCart() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch cart");
  }

  return data;
}

// --------------------------------------------------
// Add Product To Cart
// --------------------------------------------------

// ⭐ CHANGED — added selectedVariants parameter
export async function addToCart(
  productUuid,
  quantity = 1,
  selectedVariants = {},
) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/cart`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      productUuid: productUuid,
      quantity: quantity,

      // ⭐ CHANGED — send selected variants
      selectedVariants: selectedVariants,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to add product to cart");
  }

  return data;
}

// --------------------------------------------------
// Update Cart Quantity
// --------------------------------------------------

// ⭐ CHANGED — added selectedVariants parameter
export async function updateCartQuantity(
  productUuid,
  quantity,
  selectedVariants = {},
) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/cart/${productUuid}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      productUuid: productUuid,
      quantity: quantity,

      // ⭐ CHANGED — send selected variants
      selectedVariants: selectedVariants,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update cart");
  }

  return data;
}

// --------------------------------------------------
// Remove Product From Cart
// --------------------------------------------------

// ⭐ CHANGED — added selectedVariants parameter
export async function removeFromCart(productUuid, selectedVariants = {}) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/cart/${productUuid}`, {
    method: "DELETE",

    headers: {
      "Content-Type": "application/json", // ⭐ CHANGED
      Authorization: `Bearer ${token}`,
    },

    // ⭐ CHANGED — DELETE now sends selectedVariants
    body: JSON.stringify({
      selectedVariants: selectedVariants,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to remove product from cart");
  }

  return data;
}

//---------------------------------------------------------------------------------------------------------------------------------------------