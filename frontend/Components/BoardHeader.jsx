import { useState } from "react";
import { Link } from "react-router-dom";
import yomoLogo from "../src/assets/yomologo.png";

export default function BoardHeader({ title, onRename, inviteCode, isOwner, onGenerateCode, boardMembers, onLeaveBoard }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(title);
    const [membersOpen, setMembersOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleBlur = () => {
        setEditing(false);
        if (value.trim()) onRename(value.trim());
        else setValue(title);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                <div style={{ position: "relative" }}>
                    <button
                        className="board-action-btn"
                        onClick={() => setMembersOpen(!membersOpen)}
                    >
                        Membres
                    </button>

                    {membersOpen && (
                        <div className="board-invite-panel">
                            <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 13 }}>
                                Membres ({boardMembers?.length ?? 0})
                            </p>
                            {boardMembers?.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                                    {boardMembers.map((m) => (
                                        <span
                                            key={m.userId}
                                            className="modal-avatar"
                                            title={m.username}
                                            style={{ cursor: "default" }}
                                        >
                                            {m.username[0]?.toUpperCase() ?? "?"}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>
                                Code d'invitation
                            </p>

                            {inviteCode ? (
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <span className="board-invite-code">{inviteCode}</span>
                                    <button className="board-action-btn board-action-btn--dark" onClick={handleCopy}>
                                        {copied ? "Copié !" : "Copier"}
                                    </button>
                                </div>
                            ) : (
                                <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Aucun code</p>
                            )}

                            {isOwner && (
                                <button
                                    className="board-action-btn board-action-btn--dark"
                                    onClick={onGenerateCode}
                                >
                                    {inviteCode ? "Regénérer" : "Générer un code"}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ position: "relative" }}>
                    <button
                        className="board-action-btn"
                        onClick={() => { setSettingsOpen(!settingsOpen); setMembersOpen(false); }}
                    >
                        Paramètres
                    </button>

                    {settingsOpen && (
                        <div className="board-invite-panel">
                            {!isOwner && (
                                <button
                                    className="board-action-btn board-action-btn--dark"
                                    onClick={() => { onLeaveBoard?.(); setSettingsOpen(false); }}
                                >
                                    Quitter le board
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
