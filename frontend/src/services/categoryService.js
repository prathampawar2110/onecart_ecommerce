const API_URL = "http://127.0.0.1:8000";

// --------------------------------------------------
// Get all categories
// --------------------------------------------------

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await response.json();

  return data.items;
}

// --------------------------------------------------
// Add category
// --------------------------------------------------

export async function addCategory(categoryName) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      name: categoryName,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(errorData.detail || "Failed to add category");
  }

  return await response.json();
}

// --------------------------------------------------
// Update category
// --------------------------------------------------

export async function updateCategory(categoryUuid, categoryName) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/categories/${categoryUuid}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      name: categoryName,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(errorData.detail || "Failed to update category");
  }

  return await response.json();
}

// --------------------------------------------------
// Delete category
// --------------------------------------------------

export async function deleteCategory(categoryUuid) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_URL}/categories/${categoryUuid}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(errorData.detail || "Failed to delete category");
  }

  return await response.json();
}