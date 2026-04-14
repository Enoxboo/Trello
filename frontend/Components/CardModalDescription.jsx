import { useState } from "react";

// Composant pour gérer la description d'une carte dans le modal
// Il permet d'afficher la description, de la modifier ou de l'ajouter si elle n'existe pas
// Lorsque l'utilisateur clique sur "Modifier" ou sur la description, un textarea apparaît pour éditer la description
export default function CardModalDescription({ description, onChange }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(description);

    const handleSave = () => {
        setEditing(false);
        onChange(value);
    };

    return (
        <div className="modal-section">
            <div className="modal-section-header">
                <h3 className="modal-section-title">Description</h3>
                {!editing && (
                    <button className="modal-edit-btn" onClick={() => setEditing(true)}>
                        Modifier
                    </button>
                )}
            </div>

            {editing ? (
                <div className="modal-desc-edit">
          <textarea
              className="modal-desc-textarea"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ajoute une description plus détaillée..."
              rows={5}
              autoFocus
          />
                    <div className="modal-desc-actions">
                        <button className="modal-save-btn" onClick={handleSave}>Enregistrer</button>
                        <button className="modal-cancel-btn" onClick={() => { setEditing(false); setValue(description); }}>
                            Annuler
                        </button>
                    </div>
                </div>
            ) : (
                <p
                    className={`modal-desc-text ${!description ? "modal-desc-placeholder" : ""}`}
                    onClick={() => setEditing(true)}
                >
                    {description || "Ajouter une description..."}
                </p>
            )}
        </div>
    );
}