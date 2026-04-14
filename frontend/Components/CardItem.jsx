import { getDueDateStatus, formatDate } from "../src/utils/dateUtils";
import { Trash2 } from "lucide-react";


// Composant pour afficher une carte dans la liste
// Il affiche le titre, les labels, la date d'échéance, les commentaires et les membres
// Il applique des styles différents selon la proximité de la date d'échéance
// et appelle onClick pour ouvrir le modal de détails

export default function CardItem({ card, onClick, onDelete }) {
    const dueDateStatus = getDueDateStatus(card.dueDate);

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(card.id);
    };

    return (
        <article className="card" onClick={() => onClick(card)}>
            {card.labels.length > 0 && (
                <div className="card-labels">
                    {card.labels.map((label) => (
                        <span
                            key={label.name}
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