import { saveTokens, clearTokens } from "./api.js";

const BASE_URL = "http://localhost:5245";

export async function loginService(loginData) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur de connexion");

    saveTokens(data.accessToken, data.refreshToken);
    localStorage.setItem("user", JSON.stringify({
        id: data.userId,
        username: data.username,
        email: data.email,
    }));

    return data;
}

export async function registerService(registerData) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");

    saveTokens(data.accessToken, data.refreshToken);
    localStorage.setItem("user", JSON.stringify({
        id: data.userId,
        username: data.username,
        email: data.email,
    }));

    return data;
}

export function logoutService() {
    clearTokens();
}

export function getCurrentUser() {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
    return !!localStorage.getItem("accessToken");
}
