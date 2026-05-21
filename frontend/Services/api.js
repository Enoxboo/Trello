// Wrapper central pour tous les appels API.
// Il injecte automatiquement le token JWT dans les headers
// et tente un refresh transparent si le serveur retourne 401.

const BASE_URL = "http://localhost:5245";

function getTokens() {
    return {
        access: localStorage.getItem("accessToken"),
        refresh: localStorage.getItem("refreshToken"),
    };
}

function saveTokens(accessToken, refreshToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
}

function clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
}

async function refreshAccessToken() {
    const { refresh } = getTokens();
    if (!refresh) return false;

    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!res.ok) {
        clearTokens();
        return false;
    }

    const data = await res.json();
    saveTokens(data.accessToken, data.refreshToken);
    return true;
}

export async function apiFetch(path, options = {}) {
    const { access } = getTokens();

    const headers = {
        "Content-Type": "application/json",
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
        ...options.headers,
    };

    let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    // Si le token est expiré, on essaie de le renouveler une fois
    if (res.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            const { access: newAccess } = getTokens();
            headers.Authorization = `Bearer ${newAccess}`;
            res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
        } else {
            window.location.href = "/login";
            throw new Error("Session expirée");
        }
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Erreur serveur" }));
        throw new Error(err.message || "Erreur serveur");
    }

    if (res.status === 204) return null;
    return res.json();
}

export { saveTokens, clearTokens, getTokens };
