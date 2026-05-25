import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "../Services/authService";

const HUB_URL = "http://localhost:5107/hubs/board";

const EVENTS = [
    "CardCreated",
    "CardUpdated",
    "CardMoved",
    "CardDeleted",
    "ListCreated",
    "ListUpdated",
    "ListDeleted",
];

export function useBoardHub(boardId, handlers) {
    // Ref so we always call the latest handler version without restarting the connection
    const handlersRef = useRef(handlers);
    handlersRef.current = handlers;

    useEffect(() => {
        if (!boardId) return;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(HUB_URL, { accessTokenFactory: () => getAccessToken() })
            .withAutomaticReconnect()
            .build();

        EVENTS.forEach((event) => {
            connection.on(event, (data) => {
                const key = `on${event}`;
                handlersRef.current[key]?.(data);
            });
        });

        connection
            .start()
            .then(() => connection.invoke("JoinBoard", boardId))
            .catch((err) => console.error("SignalR: connexion échouée", err));

        return () => {
            connection.invoke("LeaveBoard", boardId).catch(() => {});
            connection.stop();
        };
    }, [boardId]);
}
