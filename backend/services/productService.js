const API_URL = "http://127.0.0.1:8000";

//---------------------------------------------------------------------------------------------------------------------------------------------------

export async function getProducts() {
  const response = await fetch(
    `${API_URL}/products`, // basically it fetch product from backend & send it to frontend
  );

  if (!response.ok) {
    throw new Error("Failed to Fetch Products");
    // if we does't get response then it will throw above error
  }

  const data = await response.json();

  return data;
}

//---------------------------------------------------------------------------------------------------------------------------------------------------

export async function getProductById(productUuid) {
  console.log("Fetching product UUID:", productUuid);

  if (!productUuid) {
    throw new Error("Product UUID is missing");
  }

  const response = await fetch(`${API_URL}/products/${productUuid}`);

  const data = await response.json();

  console.log("Product API status:", response.status); 
  console.log("Product API response:", data);

  if ( !response.ok ) {
    throw new Error("Failed to Fetch Product");
  }

  return data;
}

//---------------------------------------------------------------------------------------------------------------------------------------------------