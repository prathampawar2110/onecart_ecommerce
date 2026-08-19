const API_URL = "http://127.0.0.1:8000";

//-----------------------------------------------------------------------------------------------------------------------------------------------------

// Register User
export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Registration Failed");
  }
  return data;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------

// Login User
export async function loginUser(userData) {
  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login Failed");
  }
  return data;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------

// Get Current Logged in User
export async function getCurrentUser() {
  const token = localStorage.getItem("access_token");
  console.log("Token : ", token);

  if (!token) {
    throw new Error("no access token found");
  }

  const response = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log("User API status:", response.status);

  const data = await response.json();

  console.log("User API response:", data);

  if (!response.ok) {
    throw new Error(data.detail || "Failed to Get User");
  }

  return data;
}