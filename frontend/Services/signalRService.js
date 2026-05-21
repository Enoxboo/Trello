import * as signalR from "@microsoft/signalr";

// Le hub SignalR maintient une connexion WebSocket persistante avec le backend.
// Les clients rejoignent un groupe par boardId pour ne recevoir que les événements
// du board qu'ils consultent — pas tous les events de l'application.

let connection = null;

export async function connectToHub() {
    if (connection) return connection;

    const token = localStorage.getItem("accessToken");

    // Pour les WebSockets, le token ne peut pas être envoyé en header HTTP standard.
    // SignalR le transmet via la query string ?access_token=... lors du handshake.
    connection = new signalR.HubConnectionBuilder()
        .withUrl("http://localhost:5245/hubs/board", {
            accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();

    await connection.start();
    return connection;
}

export async function joinBoard(boardId) {
    const conn = await connectToHub();
    await conn.invoke("JoinBoard", boardId);
}

export async function leaveBoard(boardId) {
    if (!connection) return;
    await connection.invoke("LeaveBoard", boardId);
}

export function onCardCreated(callback) {
    connection?.on("CardCreated", callback);
}

export function onCardMoved(callback) {
    connection?.on("CardMoved", callback);
}

export function onCardUpdated(callback) {
    connection?.on("CardUpdated", callback);
}

export function onCommentAdded(callback) {
    connection?.on("CommentAdded", callback);
}

export function onListUpdated(callback) {
    connection?.on("ListUpdated", callback);
}

export function onUserJoined(callback) {
    connection?.on("UserJoined", callback);
}

export function onUserLeft(callback) {
    connection?.on("UserLeft", callback);
}

export async function disconnectFromHub() {
    if (connection) {
        await connection.stop();
        connection = null;
    }
}
