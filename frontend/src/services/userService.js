const API_URL = "http://127.0.0.1:8000";

export async function updateProfile(profileData) {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify(data));
    }

    return data;
}