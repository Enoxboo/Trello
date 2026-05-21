import { getDueDateStatus, formatDate } from "../src/utils/dateUtils";
import { Trash2 } from "lucide-react";

export default function CardItem({ card, onClick, onDelete, onDragStart }) {
    const dueDateStatus = getDueDateStatus(card.dueDate);
    const comments = card.comments ?? [];
    // L'API retourne members comme [{ userId, username }], on affiche username
    const members = (card.members ?? []).map((m) =>
        typeof m === "string" ? m : m.username
    );

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(card.id);
    };

    return (
        <article
            className="card"
            onClick={() => onClick(card)}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                onDragStart(e, card.id);
            }}
        >
            {card.labels && card.labels.length > 0 && (
                <div className="card-labels">
                    {card.labels.map((label) => (
                        <span
                            key={label.id ?? label.name}
                            className="card-label"
                            style={{ backgroundColor: label.color }}
                        >
                            {label.name}
                        </span>
                    ))}
                </div>
            )}

            <div className="card-title-row">
                <p className="card-title">{card.title}</p>
                <button
                    className="card-delete-btn"
                    onClick={handleDelete}
                    title="Supprimer la carte"
                    aria-label="Supprimer la carte"
                >
                    <Trash2 size={13} />
                </button>
            </div>

            <div className="card-footer">
                {card.dueDate && (
                    <span className={`card-due card-due--${dueDateStatus}`}>
                        {formatDate(card.dueDate)}
                    </span>
                )}
                {comments.length > 0 && (
                    <span className="card-comments">{comments.length}</span>
                )}
                {members.length > 0 && (
                    <div className="card-members">
                        {members.map((m) => (
                            <span key={m} className="card-avatar" title={m}>{m[0]}</span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
