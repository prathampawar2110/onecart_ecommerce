const API_URL = "http://127.0.0.1:8000";

//-------------------------------------------------------------------------------------------------------------------------------------------------------------

// create order
export async function createOrder(orderData) {

    const token = localStorage.getItem("access_token");

    if (!token) {
        throw new Error("No Access Token Found");
    }

    const response = await fetch(
        `${API_URL}/orders` ,
        {
            method : "POST" ,
            
            headers : {
                "Content-Type" : "application/json",
                "Authorization" : `Bearer ${token}`
            },

            body : JSON.stringify(orderData)
        }
    );

    const data = await response.json();

    if (!response.ok) {
    console.log("Order API Error Status:", response.status);
    console.log("Order API Error Data:", data);

    if (Array.isArray(data.detail)) {
        console.log("Validation Errors:", data.detail);

        throw new Error(
            data.detail
                .map((error) => {
                    return `${error.loc?.join(".")} - ${error.msg}`;
                })
                .join(" | ")
        );
    }

    throw new Error(
        typeof data.detail === "string"
            ? data.detail
            : "Failed to Place Order"
    );
}

    return data;
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------

// Get Current User Orders

export async function getMyOrders() {

    const token = localStorage.getItem("access_token");

    if (!token) {
        throw new Error("No access token found");
    }

    const response = await fetch(
        `${API_URL}/orders/my-orders` ,
        {
            method : "GET",
            headers : {
                "Authorization" : `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if ( !response.ok ) {
        throw new Error(
            typeof data.detail === "string" ? data.detail : "Failed to Get Order"
        );
    }

    return data;
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------

// Admin - Get All Orders

export async function getAllOrders() {

    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/admin/orders`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to Fetch Orders");
    }

    const data = await response.json();

    return data;
}

// -------------------------------------------------------------------------------------------------------------------------------------
// Admin - Update Order Status

export async function updateOrderStatus(orderUuid, status) {

    const token = localStorage.getItem("access_token");

    const response = await fetch(
        `${API_URL}/admin/orders/${orderUuid}/status?status=${encodeURIComponent(status)}`,
        {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to Update Order Status");
    }

    const data = await response.json();

    return data;
}