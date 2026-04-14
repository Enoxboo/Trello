const ALL_MEMBERS = ["LT", "JD", "AM", "SR", "PB"];

// Composant pour gérer les membres d'une carte dans le modal
// Affiche la liste de tous les membres possibles et permet de les sélectionner ou désélectionner
// Les membres sélectionnés sont affichés avec un style différent
// Appelle la fonction onChange avec la nouvelle liste de membres à chaque modification
export default function CardModalMembers({ members, onChange }) {
  const toggle = (m) => {
    if (members.includes(m)) onChange(members.filter((x) => x !== m));
    else onChange([...members, m]);
  };

  return (
    <div className="modal-section">
      <div className="modal-section-header">
        <h3 className="modal-section-title">Membres</h3>
      </div>
      <div className="modal-members-list">
        {ALL_MEMBERS.map((m) => (
          <button
            key={m}
            className={`modal-member-btn ${members.includes(m) ? "modal-member-btn--active" : ""}`}
            onClick={() => toggle(m)}
            title={m}
          >
            <span className="modal-avatar">{m}</span>
            {members.includes(m) && <span className="modal-member-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}