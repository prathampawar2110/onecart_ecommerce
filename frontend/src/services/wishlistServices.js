const API_URL = "http://127.0.0.1:8000";

// ---------------------------------------------------------------------------------------------------------------------------------

// Get Wishlist
export async function getWishlist() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/wishlist`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to Fetch Wishlist");
  }

  const data = await response.json();

  return data;
}

// ---------------------------------------------------------------------------------------------------------------------------------

// Add Product to Wishlist
export async function addToWishlist(productUuid) {
  const token = localStorage.getItem("access_token");

  console.log("Wishlist Product UUID:", productUuid);

  const response = await fetch(`${API_URL}/wishlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productUuid: productUuid,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    console.log("Wishlist API Error:", errorData);

    throw new Error("Failed to Add Product to Wishlist");
  }

  const data = await response.json();

  return data;
}

// ---------------------------------------------------------------------------------------------------------------------------------

// Remove Product from Wishlist
export async function removeFromWishlist(productUuid) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/wishlist/${productUuid}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to Remove Product from Wishlist");
  }

  const data = await response.json();

  return data;
}