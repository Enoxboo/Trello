import { useState } from "react";
import { CommentModel } from "../Models/BoardModel.js";
import { formatDate } from "../src/utils/dateUtils";


// Composant pour gérer les commentaires d'une carte dans le modal
// Permet d'afficher la liste des commentaires, d'ajouter un nouveau commentaire,
// de modifier ou supprimer les commentaires existants
export default function CardModalComments({ comments, onChange, currentUser = "LT" }) {
    const [value, setValue] = useState("");

    const handleAdd = () => {
        if (!value.trim()) return;
        const c = new CommentModel(Date.now(), currentUser, value.trim());
        onChange([...comments, c]);
        setValue("");
    };

    const handleDelete = (id) => onChange(comments.filter((c) => c.id !== id));

    const handleEdit = (id, newContent) => {
        onChange(comments.map((c) => c.id === id ? { ...c, content: newContent } : c));
    };

    return (
        <div className="modal-section">
            <div className="modal-section-header">
                <h3 className="modal-section-title">Commentaires ({comments.length})</h3>
            </div>

            <div className="modal-comment-input-row">
                <span className="modal-avatar modal-avatar--current">{currentUser}</span>
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
                        isOwner={c.author === currentUser}
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
        if (value.trim()) { onEdit(value.trim()); setEditing(false); }
    };

    return (
        <div className="modal-comment">
            <span className="modal-avatar">{comment.author}</span>
            <div className="modal-comment-body">
                <div className="modal-comment-meta">
                    <strong>{comment.author}</strong>
                    <span className="modal-comment-date">{new Date(comment.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
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