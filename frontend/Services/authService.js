const API = "http://localhost:5107/api";

export function getAccessToken() {
    return localStorage.getItem("accessToken");
}

export function saveTokens(accessToken, refreshToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
}

export function isAuthenticated() {
    return !!localStorage.getItem("accessToken");
}

export async function loginService(loginData) {
    const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Identifiants incorrects");
    return data;
}

export async function registerService(registerData) {
    const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur lors de l'inscription");
    return data;
}

export async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("Pas de refresh token");

    const response = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (!response.ok) {
        clearTokens();
        throw new Error("Session expirée");
    }
    saveTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
}
