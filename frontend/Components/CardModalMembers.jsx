import { getCurrentUser } from "../Services/authService";
import { addMember, removeMember } from "../Services/cardService";

// Pour l'instant on permet juste de s'assigner soi-même sur une carte.
// Les vrais membres du board ne sont pas encore listés (pas d'endpoint GET /api/boards/:id/members).
export default function CardModalMembers({ cardId, members, onChange }) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    const isAssigned = members.some((m) => m.userId === currentUser.id);

    const toggle = async () => {
        if (isAssigned) {
            try {
                await removeMember(cardId, currentUser.id);
                onChange(members.filter((m) => m.userId !== currentUser.id));
            } catch (err) {
                console.error("Erreur désassignation :", err);
            }
        } else {
            try {
                await addMember(cardId, currentUser.id);
                onChange([...members, { userId: currentUser.id, username: currentUser.username }]);
            } catch (err) {
                console.error("Erreur assignation :", err);
            }
        }
    };

    return (
        <div className="modal-section">
            <div className="modal-section-header">
                <h3 className="modal-section-title">Membres</h3>
            </div>
            <div className="modal-members-list">
                <button
                    className={`modal-member-btn ${isAssigned ? "modal-member-btn--active" : ""}`}
                    onClick={toggle}
                    title={currentUser.username}
                >
                    <span className="modal-avatar">{currentUser.username[0].toUpperCase()}</span>
                    <span style={{ marginLeft: "6px", fontSize: "0.85rem" }}>{currentUser.username}</span>
                    {isAssigned && <span className="modal-member-check">✓</span>}
                </button>
            </div>
            {members.length > 0 && (
                <div className="modal-members-list" style={{ marginTop: "8px" }}>
                    {members.map((m) => (
                        <span key={m.userId} className="modal-avatar" title={m.username}>
                            {m.username[0].toUpperCase()}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
