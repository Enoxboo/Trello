import { getDueDateStatus } from "../src/utils/dateUtils";


const STATUS_LABEL = { ok: "Dans les temps", soon: "Bientôt", overdue: "Dépassée" };

// Composant pour gérer la date d'échéance dans le modal de détails de la carte
// Il affiche un champ de saisie de type date, le statut de la date d'échéance et un bouton pour retirer la date
// Il appelle une fonction onChange avec la nouvelle date ou null lorsqu'on modifie ou retire la date
export default function CardModalDueDate({ dueDate, onChange }) {
    const status = getDueDateStatus(dueDate);

    return (
        <div className="modal-section">
            <div className="modal-section-header">
                <h3 className="modal-section-title">Date d'échéance</h3>
            </div>

            <div className="modal-duedate-row">
                <input
                    type="date"
                    className="modal-date-input"
                    value={dueDate || ""}
                    onChange={(e) => onChange(e.target.value || null)}
                />
                {dueDate && (
                    <span className={`modal-due-status modal-due-status--${status}`}>
            {STATUS_LABEL[status]}
          </span>
                )}
                {dueDate && (
                    <button className="modal-cancel-btn" onClick={() => onChange(null)}>
                        Retirer
                    </button>
                )}
            </div>
        </div>
    );
}