import { useState } from "react";
import BoardHeader from "../Components/BoardHeader";
import ListColumn from "../Components/ListColumn";
import CardModal from "../Components/CardModal";
import AddListButton from "../Components/AddListButton";
import { mockBoard, ListModel } from "../Models/BoardModel";
import "../style/board.css";

// Composant principal de la page du tableau
// Gère l'état du tableau, des listes et des cartes
// et passe les fonctions de mise à jour aux composants enfants.

export default function BoardView() {
    const [board, setBoard] = useState(mockBoard);
    const [selectedCard, setSelectedCard] = useState(null);

    const handleRenameBoard = (newTitle) => {
        setBoard((prev) => ({ ...prev, title: newTitle }));
    };

    const handleRenameList = (listId, newTitle) => {
        setBoard((prev) => ({
            ...prev,
            lists: prev.lists.map((l) =>
                l.id === listId ? { ...l, title: newTitle } : l
            ),
        }));
    };

    const handleAddCard = (listId, newCard) => {
        setBoard((prev) => ({
            ...prev,
            lists: prev.lists.map((l) =>
                l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
            ),
        }));
    };

    const handleCardUpdate = (updatedCard) => {
        setBoard((prev) => ({
            ...prev,
            lists: prev.lists.map((l) => ({
                ...l,
                cards: l.cards.map((c) =>
                    c.id === updatedCard.id ? updatedCard : c
                ),
            })),
        }));
        setSelectedCard(updatedCard);
    };

    const handleAddList = (title) => {
        const newList = new ListModel(Date.now(), title, []);
        setBoard((prev) => ({ ...prev, lists: [...prev.lists, newList] }));
    };

    const handleDeleteList = (listId) => {
        setBoard((prev) => ({
            ...prev,
            lists: prev.lists.filter((l) => l.id !== listId),
        }));
    };

    const handleDeleteCard = (listId, cardId) => {
        setBoard((prev) => ({
            ...prev,
            lists: prev.lists.map((l) =>
                l.id === listId
                    ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) }
                    : l
            ),
        }));
    };

    return (
        <main className="board-page" aria-label="Vue du tableau">
            <BoardHeader title={board.title} onRename={handleRenameBoard} />

            <div className="board-lists">
                {board.lists.map((list) => (
                    <ListColumn
                        key={list.id}
                        list={list}
                        onAddCard={handleAddCard}
                        onRenameList={handleRenameList}
                        onCardClick={setSelectedCard}
                        onDeleteList={handleDeleteList}
                        onDeleteCard={handleDeleteCard}
                    />
                ))}
                <AddListButton onAdd={handleAddList} />
            </div>

            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    onUpdate={handleCardUpdate}
                />
            )}
        </main>
    );
}