const API_URL = "http://127.0.0.1:8000"

//-----------------------------------------------------------------------------------------------------------------------------------------------------

// (1) to get all product 
export async function getProducts() {

    const response = await fetch (
        `${API_URL}/products`                       // basically it fetch product from backend & send it to frontend
    );

    if (!response.ok) {
        throw new Error ("Failed to Fetch Product");
        // if we does't get response then it will throw above error
    }

    const data = await response.json();
    return data;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------

// (2) to get single product after clicking on product card
export async function getProductById (productUuid) {

    console.log("Fetching product UUID:", productUuid);

    const response = await fetch (
         `http://127.0.0.1:8000/products/${productUuid}`
    );

    console.log(
        "Product API status:",
        response.status
    );

    const data = await response.json();

    console.log(
        "Product API response:",
        data
    );

    if (!response.ok) {
        throw new Error ("Failed to Fetch")
    }

    
    return data;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------

// (3) This is for search bar
export async function searchProducts (query) {
    const response = await fetch (
        // `http://127.0.0.1:8000/products/search?query=${encodeURIComponent(query) }` or
        `${API_URL}/products/search?query=${encodeURIComponent(query)}`
    );

    if ( !response.ok ) {
        throw new Error ( "Failed to Search Products" );
    }

    const data = await response.json()

    return data;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------

// (4) Get Product By Category
export async function getProductByCategory (category) {
    const response = await fetch (
        `${API_URL}/products/category/${encodeURIComponent(category)}`
    );

    if ( !response.ok ) {
        throw new Error ( "Failed to Fetch Category Products" );
    }

    const data = await response.json()

    return data;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------

// Admin Releated Function

//  (5) To add new product
export async function addProduct ( product ) {

    const token = localStorage.getItem("access_token");
    
    const response = await fetch (
        `${API_URL}/products` ,
        {
            method : "POST" ,
            headers : {
                "Content-Type" : "application/json" ,
                "Authorization" : `Bearer ${token}`
            },
            body: JSON.stringify(product)
        }
    );

    if ( !response.ok ) {
        throw new Error("Failed to Add Product");
    }

    const data = await response.json();
    return data;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------

// (6) To Update a Product
export async function updateProduct(productUuid , product) {

    const token = localStorage.getItem("access_token");

    const response = await fetch (
        `${API_URL}/products/${productUuid}` ,
        {
            method : "PUT" ,
            headers : {
                "Content-Type" : "application/json" ,
                "Authorization" : `Bearer ${token}`
            },
            body: JSON.stringify(product)
        }
    );

    if ( !response.ok ) {
        throw new Error("Failed to Update Product");
    }

    const data = await response.json();
    return data;
}

//-----------------------------------------------------------------------------------------------------------------------------------------------------

// (7) To Delete a Product
export async function deleteProduct (productUuid) {

    const token = localStorage.getItem("access_token");

    const response = await fetch (
        `${API_URL}/products/${productUuid}` ,
        {
            method : "DELETE" ,
            headers : {
                "Authorization" : `Bearer ${token}`
            }
        }
    );

    if ( !response.ok ) {
        throw new Error("Failed to Delete Product");
    }

    const data = await response.json();
    return data;
}