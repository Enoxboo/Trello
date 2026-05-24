import { apiFetch } from "./api.js";

export async function getCardsByList(listId) {
    return apiFetch(`/api/lists/${listId}/cards`);
}

export async function getCardById(cardId) {
    return apiFetch(`/api/cards/${cardId}`);
}

export async function createCard(listId, title) {
    return apiFetch(`/api/lists/${listId}/cards`, {
        method: "POST",
        body: JSON.stringify({ title }),
    });
}

export async function updateCard(cardId, updates) {
    return apiFetch(`/api/cards/${cardId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
    });
}

export async function moveCard(cardId, listId, position) {
    return apiFetch(`/api/cards/${cardId}/position`, {
        method: "PATCH",
        body: JSON.stringify({ listId, position }),
    });
}

export async function deleteCard(cardId) {
    return apiFetch(`/api/cards/${cardId}`, { method: "DELETE" });
}

export async function addLabel(cardId, name, color) {
    return apiFetch(`/api/cards/${cardId}/labels`, {
        method: "POST",
        body: JSON.stringify({ name, color }),
    });
}

export async function removeLabel(cardId, labelId) {
    return apiFetch(`/api/cards/${cardId}/labels/${labelId}`, { method: "DELETE" });
}

export async function addMember(cardId, userId) {
    return apiFetch(`/api/cards/${cardId}/members/${userId}`, { method: "POST" });
}

export async function removeMember(cardId, userId) {
    return apiFetch(`/api/cards/${cardId}/members/${userId}`, { method: "DELETE" });
}

export async function getComments(cardId) {
    return apiFetch(`/api/cards/${cardId}/comments`);
}

export async function addComment(cardId, content) {
    return apiFetch(`/api/cards/${cardId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
    });
}

export async function updateComment(commentId, content) {
    return apiFetch(`/api/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
    });
}

export async function deleteComment(commentId) {
    return apiFetch(`/api/comments/${commentId}`, { method: "DELETE" });
}
