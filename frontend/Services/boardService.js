import { apiFetch } from "./api.js";

export async function getBoards() {
    return apiFetch("/api/boards");
}

export async function getBoardById(id) {
    return apiFetch(`/api/boards/${id}`);
}

export async function createBoard(title) {
    return apiFetch("/api/boards", {
        method: "POST",
        body: JSON.stringify({ title }),
    });
}

export async function updateBoard(id, title) {
    return apiFetch(`/api/boards/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title }),
    });
}

export async function deleteBoard(id) {
    return apiFetch(`/api/boards/${id}`, { method: "DELETE" });
}

export async function getListsByBoard(boardId) {
    return apiFetch(`/api/boards/${boardId}/lists`);
}

export async function createList(boardId, title) {
    return apiFetch(`/api/boards/${boardId}/lists`, {
        method: "POST",
        body: JSON.stringify({ title }),
    });
}

export async function updateList(listId, title) {
    return apiFetch(`/api/lists/${listId}`, {
        method: "PUT",
        body: JSON.stringify({ title }),
    });
}

export async function moveList(listId, position) {
    return apiFetch(`/api/lists/${listId}/position`, {
        method: "PATCH",
        body: JSON.stringify({ position }),
    });
}

export async function deleteList(listId) {
    return apiFetch(`/api/lists/${listId}`, { method: "DELETE" });
}
