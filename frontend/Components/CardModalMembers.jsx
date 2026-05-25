import { addMember, removeMember } from "../Services/cardService";

export default function CardModalMembers({ cardId, members, boardMembers, onChange }) {
    if (!boardMembers?.length) return null;

    const toggle = async (member) => {
        const isAssigned = members.some((m) => m.userId === member.userId);
        if (isAssigned) {
            try {
                await removeMember(cardId, member.userId);
                onChange(members.filter((m) => m.userId !== member.userId));
            } catch (err) {
                console.error("Erreur désassignation :", err);
            }
        } else {
            try {
                await addMember(cardId, member.userId);
                onChange([...members, { userId: member.userId, username: member.username }]);
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
                {boardMembers.map((member) => {
                    const isAssigned = members.some((m) => m.userId === member.userId);
                    return (
                        <button
                            key={member.userId}
                            className={`modal-member-btn ${isAssigned ? "modal-member-btn--active" : ""}`}
                            onClick={() => toggle(member)}
                            title={member.username}
                        >
                            <span className="modal-avatar">{member.username[0]?.toUpperCase() ?? "?"}</span>
                            <span style={{ marginLeft: "6px", fontSize: "0.85rem" }}>{member.username}</span>
                            {isAssigned && <span className="modal-member-check">✓</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
