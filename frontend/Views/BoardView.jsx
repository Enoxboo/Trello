import { useState, useEffect, useRef } from "react";
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
    generateInviteCode,
} from "../Services/boardService";
import { getCurrentUser } from "../Services/authService";
import {
    getCardsByList,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
} from "../Services/cardService";
import {
    joinBoard,
    leaveBoard,
    onCardCreated,
    onCardMoved,
    onCardUpdated,
    onCardDeleted,
    onListCreated,
    onListUpdated,
    onListDeleted,
    disconnectFromHub,
} from "../Services/signalRService";
import "../style/board.css";

export default function BoardView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const dragRef = useRef({ cardId: null, sourceListId: null });

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

    // Connexion au hub SignalR quand le board est chargé.
    // useEffect retourne une fonction de nettoyage : on quitte le groupe et on coupe la connexion
    // quand l'utilisateur quitte la page.
    useEffect(() => {
        if (!board) return;
        const boardId = parseInt(id, 10);

        joinBoard(boardId).catch(() => {});

        // Déduplication : on vérifie si la carte/liste existe déjà avant d'ajouter
        // (le client créateur a déjà mis à jour son état local)
        onCardCreated((card) => {
            setLists((prev) =>
                prev.map((l) => {
                    if (l.id !== card.listId) return l;
                    if (l.cards.some((c) => c.id === card.id)) return l;
                    return { ...l, cards: [...l.cards, card] };
                })
            );
        });

        onCardMoved((move) => {
            setLists((prev) => {
                const card = prev.flatMap((l) => l.cards).find((c) => c.id === move.cardId);
                if (!card) return prev;
                return prev.map((l) => ({
                    ...l,
                    cards: l.id === move.listId
                        ? [...l.cards.filter((c) => c.id !== move.cardId), { ...card, listId: move.listId }]
                        : l.cards.filter((c) => c.id !== move.cardId),
                }));
            });
        });

        onCardUpdated((updated) => {
            setLists((prev) =>
                prev.map((l) => ({
                    ...l,
                    cards: l.cards.map((c) => (c.id === updated.id ? updated : c)),
                }))
            );
            setSelectedCard((prev) => (prev?.id === updated.id ? updated : prev));
        });

        onCardDeleted(({ cardId: deletedId, listId }) => {
            setLists((prev) =>
                prev.map((l) =>
                    l.id === listId
                        ? { ...l, cards: l.cards.filter((c) => c.id !== deletedId) }
                        : l
                )
            );
        });

        onListCreated((list) => {
            setLists((prev) => {
                if (prev.some((l) => l.id === list.id)) return prev;
                return [...prev, { ...list, cards: [] }];
            });
        });

        onListUpdated((updatedList) => {
            setLists((prev) =>
                prev.map((l) => (l.id === updatedList.id ? { ...l, ...updatedList } : l))
            );
        });

        onListDeleted(({ listId }) => {
            setLists((prev) => prev.filter((l) => l.id !== listId));
        });

        return () => {
            leaveBoard(boardId).catch(() => {});
            disconnectFromHub();
        };
    }, [board?.id, id]);

    const currentUser = getCurrentUser();

    const boardMembers = board
        ? [
            { userId: board.ownerId, username: board.ownerUsername ?? "Owner" },
            ...(board.members ?? []),
          ]
        : [];

    const handleRenameBoard = async (newTitle) => {
        await updateBoard(id, newTitle);
        setBoard((prev) => ({ ...prev, title: newTitle }));
    };

    const handleGenerateCode = async () => {
        const { code } = await generateInviteCode(id);
        setBoard((prev) => ({ ...prev, inviteCode: code }));
    };

    const handleRenameList = async (listId, newTitle) => {
        await updateList(listId, newTitle);
        setLists((prev) =>
            prev.map((l) => (l.id === listId ? { ...l, title: newTitle } : l))
        );
    };

    const handleAddCard = async (listId, cardTitle) => {
        await createCard(listId, cardTitle);
        // L'état est mis à jour via l'event SignalR CardCreated (même pour le créateur)
    };

    const handleCardUpdate = async (updatedCard) => {
        // Mise à jour optimiste locale
        setLists((prev) =>
            prev.map((l) => ({
                ...l,
                cards: l.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
            }))
        );
        setSelectedCard(updatedCard);

        // Persiste les champs éditables en base
        try {
            await updateCard(updatedCard.id, {
                title: updatedCard.title,
                description: updatedCard.description,
                dueDate: updatedCard.dueDate,
            });
        } catch (err) {
            console.error("Erreur sauvegarde carte :", err);
        }
    };

    const handleAddList = async (title) => {
        await createList(id, title);
        // L'état est mis à jour via l'event SignalR ListCreated (même pour le créateur)
    };

    const handleDeleteList = async (listId) => {
        await deleteList(listId);
        setLists((prev) => prev.filter((l) => l.id !== listId));
    };

    const handleDragStart = (e, cardId) => {
        const sourceListId = lists.find((l) => l.cards.some((c) => c.id === cardId))?.id;
        dragRef.cardId = cardId;
        dragRef.sourceListId = sourceListId;
        e.dataTransfer.setData("cardId", cardId);
    };

    // Mise à jour optimiste : on déplace la carte dans l'état local immédiatement,
    // puis on persiste en base. En cas d'erreur, on restaure l'état précédent.
    const handleDrop = async (e, targetListId) => {
        const cardId = parseInt(e.dataTransfer.getData("cardId"), 10);
        if (!cardId) return;

        const snapshot = lists;

        setLists((prev) => {
            const card = prev
                .flatMap((l) => l.cards)
                .find((c) => c.id === cardId);
            if (!card) return prev;

            const withoutCard = prev.map((l) => ({
                ...l,
                cards: l.cards.filter((c) => c.id !== cardId),
            }));

            return withoutCard.map((l) =>
                l.id === targetListId
                    ? { ...l, cards: [...l.cards, { ...card, listId: targetListId }] }
                    : l
            );
        });

        try {
            const targetList = lists.find((l) => l.id === targetListId);
            const newPosition = targetList ? targetList.cards.length : 0;
            await moveCard(cardId, targetListId, newPosition);
        } catch {
            setLists(snapshot);
        }
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
            <BoardHeader
                title={board.title}
                onRename={handleRenameBoard}
                inviteCode={board.inviteCode}
                isOwner={board.ownerId === currentUser?.id}
                onGenerateCode={handleGenerateCode}
                boardMembers={boardMembers}
            />

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
                        onDragStart={handleDragStart}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    />
                ))}
                <AddListButton onAdd={handleAddList} />
            </div>

            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    onUpdate={handleCardUpdate}
                    onCommentCountChange={(delta) => {
                        setLists((prev) =>
                            prev.map((l) => ({
                                ...l,
                                cards: l.cards.map((c) =>
                                    c.id === selectedCard.id
                                        ? { ...c, commentCount: (c.commentCount ?? 0) + delta }
                                        : c
                                ),
                            }))
                        );
                    }}
                />
            )}
        </main>
    );
}
