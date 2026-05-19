import { getDueDateStatus, formatDate } from "../src/utils/dateUtils";
import { Trash2 } from "lucide-react";

export default function CardItem({ card, listId, onClick, onDelete }) {
    const dueDateStatus = getDueDateStatus(card.dueDate);

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(card.id);
    };

    const handleDragStart = (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("cardId", String(card.id));
        e.dataTransfer.setData("sourceListId", String(listId));
        // Léger délai pour que le ghost apparaisse avant l'opacité réduite
        setTimeout(() => e.target.classList.add("card--dragging"), 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove("card--dragging");
    };

    return (
        <article
            className="card"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => onClick(card)}
        >
            {card.labels.length > 0 && (
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
                {card.comments.length > 0 && (
                    <span className="card-comments">{card.comments.length}</span>
                )}
                {card.members.length > 0 && (
                    <div className="card-members">
                        {card.members.map((m) => (
                            <span key={m} className="card-avatar" title={m}>{m}</span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
