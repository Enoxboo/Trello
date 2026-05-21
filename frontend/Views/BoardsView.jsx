import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBoards, createBoard, deleteBoard } from "../Services/boardService";
import { logoutService, getCurrentUser } from "../Services/authService";

export default function BoardsView() {
    const [boards, setBoards] = useState([]);
    const [newTitle, setNewTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = getCurrentUser();

    useEffect(() => {
        getBoards()
            .then(setBoards)
            .catch(() => navigate("/login"))
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        const board = await createBoard(newTitle.trim());
        setBoards((prev) => [...prev, board]);
        setNewTitle("");
    };

    const handleDelete = async (id) => {
        await deleteBoard(id);
        setBoards((prev) => prev.filter((b) => b.id !== id));
    };

    const handleLogout = () => {
        logoutService();
        navigate("/login");
    };

    if (loading) return <p style={{ padding: "2rem" }}>Chargement…</p>;

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>Mes tableaux — {user?.username}</h1>
                <button onClick={handleLogout} style={{ cursor: "pointer" }}>Déconnexion</button>
            </header>

            <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
                <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Nom du nouveau tableau"
                    style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <button type="submit" style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
                    Créer
                </button>
            </form>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                {boards.map((board) => (
                    <div
                        key={board.id}
                        style={{
                            background: "#0052cc",
                            color: "white",
                            borderRadius: "8px",
                            padding: "1rem",
                            cursor: "pointer",
                            position: "relative",
                        }}
                    >
                        <div onClick={() => navigate(`/board/${board.id}`)}>
                            <strong>{board.title}</strong>
                        </div>
                        <button
                            onClick={() => handleDelete(board.id)}
                            style={{
                                position: "absolute",
                                top: "0.5rem",
                                right: "0.5rem",
                                background: "transparent",
                                border: "none",
                                color: "white",
                                cursor: "pointer",
                                fontSize: "1rem",
                            }}
                            aria-label="Supprimer le tableau"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
