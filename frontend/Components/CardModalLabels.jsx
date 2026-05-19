import { useState } from "react";

const PRESET_LABELS = [
    { name: "urgent", color: "#c0392b" },
    { name: "design", color: "#805e73" },
    { name: "dev",    color: "#2980b9" },
    { name: "doc",    color: "#27ae60" },
    { name: "test",   color: "#f39c12" },
];

export default function CardModalLabels({ labels, onAdd, onDelete }) {
    const [newLabel, setNewLabel] = useState("");
    const [newColor, setNewColor] = useState("#805e73");

    const findActive = (name) => labels.find((l) => l.name === name);

    const toggle = async (name, color) => {
        const existing = findActive(name);
        if (existing) {
            await onDelete(existing.id);
        } else {
            await onAdd(name, color);
        }
    };

    const addCustom = async () => {
        const trimmed = newLabel.trim();
        if (trimmed && !findActive(trimmed)) {
            await onAdd(trimmed, newColor);
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
                        className={`modal-label-btn ${findActive(name) ? "modal-label-btn--active" : ""}`}
                        style={{ "--label-color": color }}
                        onClick={() => toggle(name, color)}
                    >
                        {name}
                        {findActive(name) && " ✓"}
                    </button>
                ))}

                {labels
                    .filter((l) => !PRESET_LABELS.some((p) => p.name === l.name))
                    .map(({ id, name, color }) => (
                        <button
                            key={id}
                            className="modal-label-btn modal-label-btn--active"
                            style={{ "--label-color": color }}
                            onClick={() => onDelete(id)}
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
