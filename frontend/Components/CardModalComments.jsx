import { useState, useEffect } from "react";
import { getCurrentUser } from "../Services/authService";
import { getComments, addComment, updateComment, deleteComment } from "../Services/cardService";

export default function CardModalComments({ cardId }) {
    const [comments, setComments] = useState([]);
    const [value, setValue] = useState("");
    const currentUser = getCurrentUser();

    // Charge les commentaires depuis l'API quand la modal s'ouvre
    useEffect(() => {
        getComments(cardId).then(setComments).catch(() => {});
    }, [cardId]);

    const handleAdd = async () => {
        if (!value.trim()) return;
        try {
            const created = await addComment(cardId, value.trim());
            setComments((prev) => [...prev, created]);
            setValue("");
        } catch (err) {
            console.error("Erreur ajout commentaire :", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteComment(id);
            setComments((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error("Erreur suppression commentaire :", err);
        }
    };

    const handleEdit = async (id, newContent) => {
        try {
            const updated = await updateComment(id, newContent);
            setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
        } catch (err) {
            console.error("Erreur modification commentaire :", err);
        }
    };

    return (
        <div className="modal-section">
            <div className="modal-section-header">
                <h3 className="modal-section-title">Commentaires ({comments.length})</h3>
            </div>

            <div className="modal-comment-input-row">
                <span className="modal-avatar modal-avatar--current">
                    {currentUser?.username?.[0]?.toUpperCase() ?? "?"}
                </span>
                <div className="modal-comment-input-wrapper">
                    <textarea
                        className="modal-comment-textarea"
                        placeholder="Écrire un commentaire..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rows={2}
                    />
                    <button className="modal-save-btn" onClick={handleAdd} disabled={!value.trim()}>
                        Envoyer
                    </button>
                </div>
            </div>

            <div className="modal-comments-list">
                {comments.map((c) => (
                    <CommentItem
                        key={c.id}
                        comment={c}
                        isOwner={c.authorId === currentUser?.id}
                        onDelete={() => handleDelete(c.id)}
                        onEdit={(content) => handleEdit(c.id, content)}
                    />
                ))}
            </div>
        </div>
    );
}

function CommentItem({ comment, isOwner, onDelete, onEdit }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(comment.content);

    const handleSave = () => {
        if (value.trim()) {
            onEdit(value.trim());
            setEditing(false);
        }
    };

    return (
        <div className="modal-comment">
            <span className="modal-avatar">{comment.authorUsername?.[0]?.toUpperCase() ?? "?"}</span>
            <div className="modal-comment-body">
                <div className="modal-comment-meta">
                    <strong>{comment.authorUsername}</strong>
                    <span className="modal-comment-date">
                        {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                    </span>
                </div>
                {editing ? (
                    <div>
                        <textarea
                            className="modal-comment-textarea"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            rows={2}
                            autoFocus
                        />
                        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                            <button className="modal-save-btn" onClick={handleSave}>Enregistrer</button>
                            <button className="modal-cancel-btn" onClick={() => setEditing(false)}>Annuler</button>
                        </div>
                    </div>
                ) : (
                    <p className="modal-comment-text">{comment.content}</p>
                )}
                {isOwner && !editing && (
                    <div className="modal-comment-actions">
                        <button className="modal-comment-action-btn" onClick={() => setEditing(true)}>Modifier</button>
                        <span>·</span>
                        <button className="modal-comment-action-btn modal-comment-action-btn--delete" onClick={onDelete}>Supprimer</button>
                    </div>
                )}
            </div>
        </div>
    );
}
