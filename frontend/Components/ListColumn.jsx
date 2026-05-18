import { useState, useRef } from "react";
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
    onMoveCard,
}) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const dragCounter = useRef(0);

    const handleBlur = () => {
        setEditing(false);
        if (title.trim()) onRenameList(list.id, title.trim());
        else setTitle(list.title);
    };

    const handleAddCard = (cardTitle) => {
        onAddCard(list.id, cardTitle);
    };

    // --- Drag & Drop ---

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        dragCounter.current += 1;
        setDragOver(true);
    };

    const handleDragLeave = () => {
        dragCounter.current -= 1;
        if (dragCounter.current === 0) setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setDragOver(false);

        const cardId = parseInt(e.dataTransfer.getData("cardId"), 10);
        const sourceListId = parseInt(e.dataTransfer.getData("sourceListId"), 10);

        if (!cardId) return;

        // Calcule la position de dépôt en cherchant l'élément card le plus proche
        const cardElements = [...e.currentTarget.querySelectorAll(".card:not(.card--dragging)")];
        let targetPosition = list.cards.length;

        for (let i = 0; i < cardElements.length; i++) {
            const rect = cardElements[i].getBoundingClientRect();
            if (e.clientY < rect.top + rect.height / 2) {
                targetPosition = i;
                break;
            }
        }

        onMoveCard(cardId, sourceListId, list.id, targetPosition);
    };

    return (
        <section
            className={`list-column${dragOver ? " list-column--drag-over" : ""}`}
            aria-label={`Liste : ${list.title}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
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
                {list.cards.map((card) => (
                    <CardItem
                        key={card.id}
                        card={card}
                        listId={list.id}
                        onClick={onCardClick}
                        onDelete={(cardId) => onDeleteCard(list.id, cardId)}
                    />
                ))}
            </div>

            <AddCardButton onAdd={handleAddCard} />
        </section>
    );
}
