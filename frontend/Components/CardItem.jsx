function getDueDateStatus(dueDate) {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diff = (due - today) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "overdue";
    if (diff <= 2) return "soon";
    return "ok";
}

function formatDate(dueDate) {
    const d = new Date(dueDate);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default function CardItem({ card }) {
    const dueDateStatus = getDueDateStatus(card.dueDate);

    return (
        <article className="card">
            {card.labels.length > 0 && (
                <div className="card-labels">
                    {card.labels.map((label) => (
                        <span key={label} className={`card-label card-label--${label}`}>
              {label}
            </span>
                    ))}
                </div>
            )}

            <p className="card-title">{card.title}</p>

            <div className="card-footer">
                {card.dueDate && (
                    <span className={`card-due card-due--${dueDateStatus}`}>
            {formatDate(card.dueDate)}
          </span>
                )}

                {card.comments > 0 && (
                    <span className="card-comments">{card.comments}</span>
                )}

                {card.members.length > 0 && (
                    <div className="card-members">
                        {card.members.map((m) => (
                            <span key={m} className="card-avatar" title={m}>
                {m}
              </span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}