import { useState } from "react";
import CardItem from "./CardItem";
import AddCardButton from "./AddCardButton";
import { CardModel } from "../Models/BoardModel";
import { Trash2 } from "lucide-react";


export default function ListColumn({ list, onAddCard, onRenameList, onCardClick, onDeleteList, onDeleteCard }) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleBlur = () => {
        setEditing(false);
        if (title.trim()) onRenameList(list.id, title.trim());
        else setTitle(list.title);
    };

    const handleAddCard = (cardTitle) => {
        const newCard = new CardModel(Date.now(), cardTitle);
        onAddCard(list.id, newCard);
    };

    return (
        <section className="list-column" aria-label={`Liste : ${list.title}`}>
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
                        onClick={onCardClick}
                        onDelete={(cardId) => onDeleteCard(list.id, cardId)}
                    />
                ))}
            </div>

            <AddCardButton onAdd={handleAddCard} />
        </section>
    );
}