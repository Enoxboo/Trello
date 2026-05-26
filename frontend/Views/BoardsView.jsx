import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getBoards, createBoard, deleteBoard, leaveBoard, joinByCode } from "../Services/boardService";
import { logoutService, getCurrentUser } from "../Services/authService";
import yomoLogo from "../src/assets/yomologo.png";
import "../style/boards.css";

export default function BoardsView() {
    const [boards, setBoards] = useState([]);
    const [newTitle, setNewTitle] = useState("");
    const [nameError, setNameError] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [joinError, setJoinError] = useState("");
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
        if (!newTitle.trim()) {
            setNameError("Le nom du board est requis.");
            return;
        }
        setNameError("");
        const board = await createBoard(newTitle.trim());
        setBoards((prev) => [...prev, board]);
        setNewTitle("");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer définitivement ce board et tout son contenu ?")) return;
        await deleteBoard(id);
        setBoards((prev) => prev.filter((b) => b.id !== id));
    };

    const handleLeave = async (id) => {
        await leaveBoard(id);
        setBoards((prev) => prev.filter((b) => b.id !== id));
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;
        try {
            const board = await joinByCode(joinCode.trim().toUpperCase());
            setBoards((prev) => prev.some((b) => b.id === board.id) ? prev : [...prev, board]);
            setJoinCode("");
            setJoinError("");
        } catch {
            setJoinError("Code invalide ou introuvable.");
        }
    };

    const handleLogout = () => {
        logoutService();
        navigate("/login");
    };

    if (loading) return <p className="boards-loading">Chargement…</p>;

    return (
        <div className="boards-page">
            <header className="boards-header">
                <div className="boards-header-left">
                    <Link to="/boards" style={{ lineHeight: 0 }}>
                        <img src={yomoLogo} alt="Logo Yello" className="boards-logo" />
                    </Link>
                    <span className="boards-header-title">Mes tableaux</span>
                </div>
                <div className="boards-header-actions">
                    {user?.username && (
                        <span className="boards-user">{user.username}</span>
                    )}
                    <button className="boards-logout-btn" onClick={handleLogout}>
                        Déconnexion
                    </button>
                </div>
            </header>

            <main className="boards-content">
                <section className="boards-create">
                    <h2 className="boards-section-title">Créer un tableau</h2>
                    <form onSubmit={handleCreate} className="boards-create-form">
                        <div className="boards-create-row">
                            <input
                                className={`boards-input${nameError ? " boards-input--error" : ""}`}
                                value={newTitle}
                                onChange={(e) => { setNewTitle(e.target.value); if (nameError) setNameError(""); }}
                                placeholder="Nom du nouveau tableau"
                            />
                            <button type="submit" className="boards-submit-btn">
                                Créer
                            </button>
                        </div>
                        {nameError && <p className="boards-error">{nameError}</p>}
                    </form>
                </section>

                <section>
                    <h2 className="boards-section-title">Mes tableaux</h2>
                    <div className="boards-grid">
                        {boards.length === 0 ? (
                            <p className="boards-empty">Aucun tableau pour l'instant. Créez-en un !</p>
                        ) : (
                            boards.map((board) => (
                                <div
                                    key={board.id}
                                    className="board-card"
                                    onClick={() => navigate(`/board/${board.id}`)}
                                >
                                    <button
                                        className="board-card__action"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            board.ownerId === user?.id
                                                ? handleDelete(board.id)
                                                : handleLeave(board.id);
                                        }}
                                        aria-label={board.ownerId === user?.id ? "Supprimer le tableau" : "Quitter le tableau"}
                                        title={board.ownerId === user?.id ? "Supprimer" : "Quitter"}
                                    >
                                        {board.ownerId === user?.id ? "✕" : "Quitter"}
                                    </button>
                                    <strong className="board-card__title">{board.title}</strong>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="boards-join">
                    <h2 className="boards-section-title">Rejoindre un tableau</h2>
                    <form onSubmit={handleJoin} className="boards-join-form">
                        <input
                            className="boards-code-input"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="Code d'invitation (ex : X4K9PL)"
                            maxLength={6}
                        />
                        <button type="submit" className="boards-submit-btn">
                            Rejoindre
                        </button>
                    </form>
                    {joinError && <p className="boards-join-error">{joinError}</p>}
                </section>
            </main>
        </div>
    );
}
