import { useState, Fragment } from "react";
import CardItem from "./CardItem";
import AddCardButton from "./AddCardButton";
import { Trash2 } from "lucide-react";

export default function ListColumn({
    list,
    onAddCard,
    onRenameList,
    onCardClick,
    onDeleteList,
    onDeleteCard,
    onDragStart,
    onDragOver,
    onDrop,
}) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dropIndex, setDropIndex] = useState(null);

    const handleBlur = () => {
        setEditing(false);
        if (title.trim()) onRenameList(list.id, title.trim());
        else setTitle(list.title);
    };

    const handleAddCard = (cardTitle) => {
        onAddCard(list.id, cardTitle);
    };

    // Per-card handler: determines upper/lower half to compute insert index
    const handleCardDragOver = (e, cardIndex) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
        const rect = e.currentTarget.getBoundingClientRect();
        setDropIndex(e.clientY < rect.top + rect.height / 2 ? cardIndex : cardIndex + 1);
    };

    // Fallback: hovering over list background → append to end
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
        setDropIndex(list.cards.length);
        onDragOver(e, list.id);
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
            setDropIndex(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const idx = dropIndex;
        setIsDragOver(false);
        setDropIndex(null);
        onDrop(e, list.id, idx);
    };

    return (
        <section
            className={`list-column${isDragOver ? " list-column--drag-over" : ""}`}
            aria-label={`Liste : ${list.title}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="list-header">
                {editing ? (
                    <input
                        className="list-title-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => e.key === "Enter" && handleBlur()}
                        autoFocus
                    />
                ) : (
                    <h2
                        className="list-title"
                        onClick={() => setEditing(true)}
                        title="Cliquer pour renommer"
                    >
                        {title}
                    </h2>
                )}

                <span className="list-count">{list.cards.length}</span>

                {!confirmDelete ? (
                    <button
                        className="list-delete-btn"
                        onClick={() => setConfirmDelete(true)}
                        title="Supprimer la liste"
                        aria-label="Supprimer la liste"
                    >
                        <Trash2 size={14} />
                    </button>
                ) : (
                    <div className="list-delete-confirm">
                        <span>Supprimer ?</span>
                        <button className="list-delete-yes" onClick={() => onDeleteList(list.id)}>Oui</button>
                        <button className="list-delete-no" onClick={() => setConfirmDelete(false)}>Non</button>
                    </div>
                )}
            </div>

            <div className="list-cards">
                {list.cards.map((card, index) => (
                    <Fragment key={card.id}>
                        {isDragOver && dropIndex === index && (
                            <div className="card-drop-indicator" />
                        )}
                        <CardItem
                            card={card}
                            onClick={onCardClick}
                            onDelete={(cardId) => onDeleteCard(list.id, cardId)}
                            onDragStart={onDragStart}
                            onCardDragOver={(e) => handleCardDragOver(e, index)}
                        />
                    </Fragment>
                ))}
                {isDragOver && dropIndex === list.cards.length && (
                    <div className="card-drop-indicator" />
                )}
            </div>

            <AddCardButton onAdd={handleAddCard} />
        </section>
    );
}
