import { useState } from "react";
import { addLabel, removeLabel } from "../Services/cardService";

const PRESET_LABELS = [
    { name: "urgent", color: "#c0392b" },
    { name: "design", color: "#805e73" },
    { name: "dev",    color: "#2980b9" },
    { name: "doc",    color: "#27ae60" },
    { name: "test",   color: "#f39c12" },
];

export default function CardModalLabels({ cardId, labels, onChange }) {
    const [newLabel, setNewLabel] = useState("");
    const [newColor, setNewColor] = useState("#805e73");

    const isActive = (name) => labels.some((l) => l.name === name);

    const toggle = async (name, color) => {
        const existing = labels.find((l) => l.name === name);
        if (existing) {
            // Le label a un id réel depuis l'API
            try {
                await removeLabel(cardId, existing.id);
                onChange(labels.filter((l) => l.name !== name));
            } catch (err) {
                console.error("Erreur suppression label :", err);
            }
        } else {
            try {
                const created = await addLabel(cardId, name, color);
                onChange([...labels, created]);
            } catch (err) {
                console.error("Erreur ajout label :", err);
            }
        }
    };

    const addCustom = async () => {
        const trimmed = newLabel.trim();
        if (!trimmed || isActive(trimmed)) return;
        try {
            const created = await addLabel(cardId, trimmed, newColor);
            onChange([...labels, created]);
            setNewLabel("");
            setNewColor("#805e73");
        } catch (err) {
            console.error("Erreur ajout label custom :", err);
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

                {/* Labels custom (pas dans les presets) */}
                {labels
                    .filter((l) => !PRESET_LABELS.some((p) => p.name === l.name))
                    .map(({ id, name, color }) => (
                        <button
                            key={id}
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
