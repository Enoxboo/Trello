import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BoardHeader from "../Components/BoardHeader";
import ListColumn from "../Components/ListColumn";
import CardModal from "../Components/CardModal";
import AddListButton from "../Components/AddListButton";
import {
    getBoardById,
    updateBoard,
    getListsByBoard,
    createList,
    updateList,
    deleteList,
} from "../Services/boardService";
import {
    getCardsByList,
    createCard,
    updateCard,
    deleteCard,
} from "../Services/cardService";
import "../style/board.css";

export default function BoardView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [loading, setLoading] = useState(true);

    // Charge le board et toutes ses listes avec leurs cartes au montage du composant
    useEffect(() => {
        async function load() {
            try {
                const [boardData, listsData] = await Promise.all([
                    getBoardById(id),
                    getListsByBoard(id),
                ]);
                setBoard(boardData);

                // Charge les cartes de chaque liste en parallèle
                const listsWithCards = await Promise.all(
                    listsData.map(async (list) => ({
                        ...list,
                        cards: await getCardsByList(list.id),
                    }))
                );
                setLists(listsWithCards);
            } catch {
                navigate("/boards");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, navigate]);

    const handleRenameBoard = async (newTitle) => {
        await updateBoard(id, newTitle);
        setBoard((prev) => ({ ...prev, title: newTitle }));
    };

    const handleRenameList = async (listId, newTitle) => {
        await updateList(listId, newTitle);
        setLists((prev) =>
            prev.map((l) => (l.id === listId ? { ...l, title: newTitle } : l))
        );
    };

    const handleAddCard = async (listId, cardTitle) => {
        const newCard = await createCard(listId, cardTitle);
        setLists((prev) =>
            prev.map((l) =>
                l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
            )
        );
    };

    const handleCardUpdate = (updatedCard) => {
        setLists((prev) =>
            prev.map((l) => ({
                ...l,
                cards: l.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
            }))
        );
        setSelectedCard(updatedCard);
    };

    const handleAddList = async (title) => {
        const newList = await createList(id, title);
        setLists((prev) => [...prev, { ...newList, cards: [] }]);
    };

    const handleDeleteList = async (listId) => {
        await deleteList(listId);
        setLists((prev) => prev.filter((l) => l.id !== listId));
    };

    const handleDeleteCard = async (listId, cardId) => {
        await deleteCard(cardId);
        setLists((prev) =>
            prev.map((l) =>
                l.id === listId
                    ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) }
                    : l
            )
        );
    };

    if (loading) return <p style={{ padding: "2rem" }}>Chargement…</p>;
    if (!board) return null;

    return (
        <main className="board-page" aria-label="Vue du tableau">
            <BoardHeader title={board.title} onRename={handleRenameBoard} />

            <div className="board-lists">
                {lists.map((list) => (
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
