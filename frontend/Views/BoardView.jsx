import { useState, useEffect, useRef } from "react";
import BoardHeader from "../Components/BoardHeader";
import ListColumn from "../Components/ListColumn";
import CardModal from "../Components/CardModal";
import AddListButton from "../Components/AddListButton";
import { boardService, listService, cardService } from "../Services/boardService";
import { useBoardHub } from "../hooks/useBoardHub";
import "../style/board.css";

function adaptCard(apiCard) {
    return {
        id: apiCard.id,
        title: apiCard.title,
        description: apiCard.description || "",
        dueDate: apiCard.dueDate || null,
        position: apiCard.position,
        labels: (apiCard.labels || []).map((l) => ({ id: l.id, name: l.name, color: l.color })),
        comments: (apiCard.comments || []).map((c) => ({
            id: c.id,
            author: c.authorUsername,
            content: c.content,
            date: c.createdAt,
        })),
        members: [],
    };
}

function adaptBoard(apiBoard) {
    return {
        id: apiBoard.id,
        title: apiBoard.title,
        lists: (apiBoard.lists || [])
            .sort((a, b) => a.position - b.position)
            .map((l) => ({
                id: l.id,
                title: l.title,
                position: l.position,
                cards: (l.cards || [])
                    .sort((a, b) => a.position - b.position)
                    .map(adaptCard),
            })),
    };
}

export default function BoardView() {
    const [board, setBoard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCard, setSelectedCard] = useState(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        async function loadBoard() {
            try {
                const boards = await boardService.getAll();
                if (boards.length === 0) {
                    const newBoard = await boardService.create("Mon Board");
                    setBoard(adaptBoard(newBoard));
                } else {
                    setBoard(adaptBoard(boards[0]));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadBoard();
    }, []);

    // ── SignalR handlers ─────────────────────────────────────────────────────
    useBoardHub(board?.id, {
        onCardCreated: ({ listId, card }) => {
            setBoard((b) => {
                const list = b.lists.find((l) => l.id === listId);
                if (!list || list.cards.find((c) => c.id === card.id)) return b;
                return {
                    ...b,
                    lists: b.lists.map((l) =>
                        l.id === listId ? { ...l, cards: [...l.cards, adaptCard(card)] } : l
                    ),
                };
            });
        },
        onCardUpdated: ({ card }) => {
            setBoard((b) => ({
                ...b,
                lists: b.lists.map((l) => ({
                    ...l,
                    cards: l.cards.map((c) => (c.id === card.id ? adaptCard(card) : c)),
                })),
            }));
        },
        onCardMoved: ({ cardId, fromListId, toListId, toPosition }) => {
            setBoard((b) => {
                const sourceList = b.lists.find((l) => l.id === fromListId);
                const card = sourceList?.cards.find((c) => c.id === cardId);
                if (!card) return b;

                return {
                    ...b,
                    lists: b.lists.map((l) => {
                        if (l.id === fromListId && l.id !== toListId)
                            return { ...l, cards: l.cards.filter((c) => c.id !== cardId) };
                        if (l.id === toListId) {
                            const filtered = l.cards.filter((c) => c.id !== cardId);
                            filtered.splice(toPosition, 0, { ...card, position: toPosition });
                            return { ...l, cards: filtered };
                        }
                        return l;
                    }),
                };
            });
        },
        onCardDeleted: ({ cardId, listId }) => {
            setBoard((b) => ({
                ...b,
                lists: b.lists.map((l) =>
                    l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l
                ),
            }));
        },
        onListCreated: ({ list }) => {
            setBoard((b) => {
                if (b.lists.find((l) => l.id === list.id)) return b;
                return {
                    ...b,
                    lists: [...b.lists, { id: list.id, title: list.title, position: list.position, cards: [] }],
                };
            });
        },
        onListUpdated: ({ listId, title }) => {
            setBoard((b) => ({
                ...b,
                lists: b.lists.map((l) => (l.id === listId ? { ...l, title } : l)),
            }));
        },
        onListDeleted: ({ listId }) => {
            setBoard((b) => ({ ...b, lists: b.lists.filter((l) => l.id !== listId) }));
        },
    });

    // ── Handlers CRUD (optimiste + API) ─────────────────────────────────────
    const handleRenameBoard = async (newTitle) => {
        const prev = board;
        setBoard((b) => ({ ...b, title: newTitle }));
        try {
            await boardService.update(board.id, newTitle);
        } catch {
            setBoard(prev);
        }
    };

    const handleRenameList = async (listId, newTitle) => {
        const prev = board;
        setBoard((b) => ({
            ...b,
            lists: b.lists.map((l) => (l.id === listId ? { ...l, title: newTitle } : l)),
        }));
        try {
            await listService.update(listId, newTitle);
        } catch {
            setBoard(prev);
        }
    };

    const handleAddCard = async (listId, cardTitle) => {
        try {
            const apiCard = await cardService.create(cardTitle, listId);
            const newCard = adaptCard(apiCard);
            setBoard((b) => ({
                ...b,
                lists: b.lists.map((l) =>
                    l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
                ),
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCardUpdate = async (updatedCard) => {
        const prev = board;
        setBoard((b) => ({
            ...b,
            lists: b.lists.map((l) => ({
                ...l,
                cards: l.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
            })),
        }));
        setSelectedCard(updatedCard);
        try {
            await cardService.update(updatedCard.id, {
                title: updatedCard.title,
                description: updatedCard.description,
                dueDate: updatedCard.dueDate,
            });
        } catch {
            setBoard(prev);
        }
    };

    const handleAddList = async (title) => {
        try {
            const apiList = await listService.create(title, board.id);
            const newList = { id: apiList.id, title: apiList.title, position: apiList.position, cards: [] };
            setBoard((b) => ({ ...b, lists: [...b.lists, newList] }));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteList = async (listId) => {
        const prev = board;
        setBoard((b) => ({ ...b, lists: b.lists.filter((l) => l.id !== listId) }));
        try {
            await listService.delete(listId);
        } catch {
            setBoard(prev);
        }
    };

    const handleDeleteCard = async (listId, cardId) => {
        const prev = board;
        setBoard((b) => ({
            ...b,
            lists: b.lists.map((l) =>
                l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l
            ),
        }));
        try {
            await cardService.delete(cardId);
        } catch {
            setBoard(prev);
        }
    };

    const handleMoveCard = async (cardId, sourceListId, targetListId, targetPosition) => {
        const prev = board;
        setBoard((b) => {
            const sourceList = b.lists.find((l) => l.id === sourceListId);
            const card = sourceList?.cards.find((c) => c.id === cardId);
            if (!card) return b;

            const newLists = b.lists.map((l) => {
                if (l.id === sourceListId && l.id !== targetListId)
                    return { ...l, cards: l.cards.filter((c) => c.id !== cardId) };
                if (l.id === targetListId) {
                    const filtered = l.cards.filter((c) => c.id !== cardId);
                    filtered.splice(targetPosition, 0, { ...card, position: targetPosition });
                    return { ...l, cards: filtered };
                }
                return l;
            });
            return { ...b, lists: newLists };
        });

        try {
            await cardService.move(cardId, targetListId, targetPosition);
        } catch {
            setBoard(prev);
        }
    };

    if (loading) return <div className="board-loading">Chargement...</div>;
    if (error) return <div className="board-error">{error}</div>;
    if (!board) return null;

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
                        onMoveCard={handleMoveCard}
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
