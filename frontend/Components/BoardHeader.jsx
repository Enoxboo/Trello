import { useState } from "react";
import { Link } from "react-router-dom";
import yomoLogo from "../src/assets/yomologo.png";

export default function BoardHeader({ title, onRename }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(title);

    const handleBlur = () => {
        setEditing(false);
        if (value.trim()) onRename(value.trim());
        else setValue(title);
    };

    return (
        <header className="board-header">
            <div className="board-header-left">
                <Link to="/boards" style={{ lineHeight: 0 }}>
                    <img src={yomoLogo} alt="Logo Yomo" className="board-logo" />
                </Link>

                {editing ? (
                    <input
                        className="board-title-input"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => e.key === "Enter" && handleBlur()}
                        autoFocus
                    />
                ) : (
                    <h1
                        className="board-title"
                        onClick={() => setEditing(true)}
                        title="Cliquer pour renommer"
                    >
                        {value}
                    </h1>
                )}
            </div>

            <div className="board-header-actions">
                <button className="board-action-btn">Membres</button>
                <button className="board-action-btn">Paramètres</button>
            </div>
        </header>
    );
}