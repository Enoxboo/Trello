import { useState } from "react";

export default function AddCardButton({ onAdd }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");

    const handleSubmit = () => {
        if (value.trim()) {
            onAdd(value.trim());
            setValue("");
            setOpen(false);
        }
    };

    if (!open) {
        return (
            <button className="add-card-btn" onClick={() => setOpen(true)}>
                + Ajouter une carte
            </button>
        );
    }

    return (
        <div className="add-card-form">
      <textarea
          className="add-card-textarea"
          placeholder="Titre de la carte..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          rows={2}
      />
            <div className="add-card-actions">
                <button className="add-card-confirm" onClick={handleSubmit}>
                    Ajouter
                </button>
                <button className="add-card-cancel" onClick={() => { setOpen(false); setValue(""); }}>
                    ✕
                </button>
            </div>
        </div>
    );
}