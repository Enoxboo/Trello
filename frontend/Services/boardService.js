import { getAccessToken, refreshAccessToken, clearTokens } from "./authService";

const API = "http://localhost:5107/api";

async function apiFetch(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
        ...options.headers,
    };

    let response = await fetch(`${API}${path}`, { ...options, headers });

    if (response.status === 401) {
        try {
            const newToken = await refreshAccessToken();
            headers.Authorization = `Bearer ${newToken}`;
            response = await fetch(`${API}${path}`, { ...options, headers });
        } catch {
            clearTokens();
            window.location.href = "/login";
            throw new Error("Session expirée");
        }
    }

    if (response.status === 204) return null;
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erreur serveur");
    return data;
}

export const boardService = {
    getAll: () => apiFetch("/boards"),
    create: (title) => apiFetch("/boards", { method: "POST", body: JSON.stringify({ title }) }),
    update: (id, title) => apiFetch(`/boards/${id}`, { method: "PUT", body: JSON.stringify({ title }) }),
    delete: (id) => apiFetch(`/boards/${id}`, { method: "DELETE" }),
};

export const listService = {
    create: (title, boardId) => apiFetch("/lists", { method: "POST", body: JSON.stringify({ title, boardId }) }),
    update: (id, title) => apiFetch(`/lists/${id}`, { method: "PUT", body: JSON.stringify({ title }) }),
    delete: (id) => apiFetch(`/lists/${id}`, { method: "DELETE" }),
    reorder: (boardId, orderedIds) =>
        apiFetch(`/lists/reorder/${boardId}`, { method: "PUT", body: JSON.stringify(orderedIds) }),
};

export const cardService = {
    create: (title, listId) => apiFetch("/cards", { method: "POST", body: JSON.stringify({ title, listId }) }),
    update: (id, dto) => apiFetch(`/cards/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
    move: (id, targetListId, position) =>
        apiFetch(`/cards/${id}/move`, { method: "PUT", body: JSON.stringify({ targetListId, position }) }),
    delete: (id) => apiFetch(`/cards/${id}`, { method: "DELETE" }),
};

export const commentService = {
    create: (cardId, content) =>
        apiFetch(`/cards/${cardId}/comments`, { method: "POST", body: JSON.stringify({ content }) }),
    update: (cardId, commentId, content) =>
        apiFetch(`/cards/${cardId}/comments/${commentId}`, { method: "PUT", body: JSON.stringify({ content }) }),
    delete: (cardId, commentId) =>
        apiFetch(`/cards/${cardId}/comments/${commentId}`, { method: "DELETE" }),
};

export const labelService = {
    create: (cardId, name, color) =>
        apiFetch(`/cards/${cardId}/labels`, { method: "POST", body: JSON.stringify({ name, color }) }),
    delete: (cardId, labelId) =>
        apiFetch(`/cards/${cardId}/labels/${labelId}`, { method: "DELETE" }),
};
