import { useEffect } from "react";
import CardModalTitle from "./CardModalTitle";
import CardModalDescription from "./CardModalDescription";
import CardModalMembers from "./CardModalMembers";
import CardModalLabels from "./CardModalLabels";
import CardModalDueDate from "./CardModalDueDate";
import CardModalComments from "./CardModalComments";
import "../style/card-modal.css";

// Composant de modal pour afficher et éditer les détails d'une carte
// Il gère les champs principaux : titre, description, membres, labels, date d'échéance et commentaires
// La modal se ferme en cliquant en dehors ou en appuyant sur Échap
export default function CardModal({ card, onClose, onUpdate, onAddComment, onUpdateComment, onDeleteComment, onAddLabel, onDeleteLabel }) {
    const update = (field, value) => onUpdate({ ...card, [field]: value });

    useEffect(() => {
        const handler = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Détail de la carte">
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">✕</button>

                <CardModalTitle title={card.title} onChange={(v) => update("title", v)} />

                <div className="modal-body">
                    <div className="modal-main">
                        <CardModalDescription description={card.description} onChange={(v) => update("description", v)} />
                        <CardModalComments
                            comments={card.comments}
                            onAdd={onAddComment}
                            onUpdate={onUpdateComment}
                            onDelete={onDeleteComment}
                        />
                    </div>

                    <aside className="modal-sidebar">
                        <CardModalMembers members={card.members} onChange={(v) => update("members", v)} />
                        <CardModalLabels
                            labels={card.labels}
                            onAdd={onAddLabel}
                            onDelete={onDeleteLabel}
                        />
                        <CardModalDueDate dueDate={card.dueDate} onChange={(v) => update("dueDate", v)} />
                    </aside>
                </div>
            </div>
        </div>
    );
}