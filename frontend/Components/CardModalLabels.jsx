import { useState } from "react";

const PRESET_LABELS = [
    { name: "urgent", color: "#c0392b" },
    { name: "design", color: "#805e73" },
    { name: "dev",    color: "#2980b9" },
    { name: "doc",    color: "#27ae60" },
    { name: "test",   color: "#f39c12" },
];

// Composant pour gérer les labels d'une carte dans le modal de la carte
// Il affiche une liste de labels prédéfinis et permet d'en ajouter de nouveaux
// Les labels sélectionnés sont mis en surbrillance
export default function CardModalLabels({ labels, onChange }) {
    const [newLabel, setNewLabel] = useState("");
    const [newColor, setNewColor] = useState("#805e73");

    // labels est un tableau d'objets { name, color }
    const isActive = (name) => labels.some((l) => l.name === name);

    const toggle = (name, color) => {
        if (isActive(name)) {
            onChange(labels.filter((l) => l.name !== name));
        } else {
            onChange([...labels, { name, color }]);
        }
    };

    const addCustom = () => {
        const trimmed = newLabel.trim();
        if (trimmed && !isActive(trimmed)) {
            onChange([...labels, { name: trimmed, color: newColor }]);
            setNewLabel("");
            setNewColor("#805e73");
        }
    };

    return (
        <div className="modal-section">
            <div className="modal-section-header">
                <h3 className="modal-section-title">Labels</h3>
            </div>

            <div className="modal-labels-list">
                {PRESET_LABELS.map(({ name, color }) => (
                    <button
                        key={name}
                        className={`modal-label-btn ${isActive(name) ? "modal-label-btn--active" : ""}`}
                        style={{ "--label-color": color }}
                        onClick={() => toggle(name, color)}
                    >
                        {name}
                        {isActive(name) && " ✓"}
                    </button>
                ))}

                {/* Labels custom ajoutés dynamiquement */}
                {labels
                    .filter((l) => !PRESET_LABELS.some((p) => p.name === l.name))
                    .map(({ name, color }) => (
                        <button
                            key={name}
                            className="modal-label-btn modal-label-btn--active"
                            style={{ "--label-color": color }}
                            onClick={() => toggle(name, color)}
                        >
                            {name} ✓
                        </button>
                    ))}
            </div>

            <div className="modal-label-custom">
                <input
                    type="text"
                    className="modal-label-input"
                    placeholder="Nouveau label..."
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustom()}
                />
                <input
                    type="color"
                    className="modal-label-color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                />
                <button className="modal-save-btn" onClick={addCustom}>+</button>
            </div>
        </div>
    );
}