import { useState } from "react";

// Composant pour gérer la description d'une carte dans le modal
// Il permet d'afficher la description, de la modifier ou de l'ajouter si elle n'existe pas
export default function CardModalTitle({ title, onChange }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(title);

    const handleBlur = () => {
        setEditing(false);
        if (value.trim()) onChange(value.trim());
        else setValue(title);
    };

    return (
        <div className="modal-title-wrapper">
            {editing ? (
                <input
                    className="modal-title-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => e.key === "Enter" && handleBlur()}
                    autoFocus
                />
            ) : (
                <h2 className="modal-title" onClick={() => setEditing(true)} title="Cliquer pour renommer">
                    {value}
                </h2>
            )}
        </div>
    );
}