import { useState } from "react";

// Composant pour ajouter une nouvelle liste à un tableau
// Affiche un bouton "Ajouter une liste" qui, lorsqu'il est cliqué, se transforme en formulaire d'ajout
export default function AddListButton({ onAdd }) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");

    const handleSubmit = () => {
        if (!title.trim()) return;
        onAdd(title.trim());
        setTitle("");
        setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSubmit();
        if (e.key === "Escape") { setOpen(false); setTitle(""); }
    };

    if (!open) {
        return (
            <button className="add-list-btn" onClick={() => setOpen(true)}>
                <span className="add-list-icon">＋</span>
                Ajouter une liste
            </button>
        );
    }

    return (
        <div className="add-list-form">
            <input
                className="add-list-input"
                placeholder="Nom de la liste..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
            />
            <div className="add-list-actions">
                <button className="add-list-confirm-btn" onClick={handleSubmit} disabled={!title.trim()}>
                    Ajouter
                </button>
                <button
                    className="add-list-cancel-btn"
                    onClick={() => { setOpen(false); setTitle(""); }}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}