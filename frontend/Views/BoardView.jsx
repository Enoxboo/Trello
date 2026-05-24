import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BoardHeader from "../Components/BoardHeader";
import ListColumn from "../Components/ListColumn";
import CardModal from "../Components/CardModal";
import AddListButton from "../Components/AddListButton";
import {
    getBoardById,
    updateBoard,
    deleteBoard,
    getListsByBoard,
    createList,
    updateList,
    deleteList,
    generateInviteCode,
    leaveBoard as leaveBoardHttp,
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
    onCommentAdded,
    onCommentDeleted,
    onMemberJoined,
    onMemberLeft,
    onUserJoined,
    onUserLeft,
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
    const [activeUsers, setActiveUsers] = useState([]);
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
                        cards: (await getCardsByList(list.id)).map((c) => ({
                            ...c,
                            dueDate: c.dueDate?.substring(0, 10) ?? null,
                        })),
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

        const me = getCurrentUser();
        joinBoard(boardId)
            .then(() => setActiveUsers(me ? [me.username] : []))
            .catch(() => {});

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
                return prev.map((l) => {
                    const withoutCard = l.cards.filter((c) => c.id !== move.cardId);
                    if (l.id !== move.listId) return { ...l, cards: withoutCard };
                    const arr = [...withoutCard];
                    arr.splice(Math.min(move.position, arr.length), 0, { ...card, listId: move.listId });
                    return { ...l, cards: arr };
                });
            });
        });

        onCardUpdated((updated) => {
            const normalized = { ...updated, dueDate: updated.dueDate?.substring(0, 10) ?? null };
            setLists((prev) =>
                prev.map((l) => ({
                    ...l,
                    cards: l.cards.map((c) => (c.id === normalized.id ? normalized : c)),
                }))
            );
            setSelectedCard((prev) => (prev?.id === normalized.id ? normalized : prev));
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

        onCommentAdded((comment) => {
            setLists((prev) =>
                prev.map((l) => ({
                    ...l,
                    cards: l.cards.map((c) =>
                        c.id === comment.cardId
                            ? { ...c, commentCount: (c.commentCount ?? 0) + 1 }
                            : c
                    ),
                }))
            );
        });

        onCommentDeleted(({ cardId }) => {
            setLists((prev) =>
                prev.map((l) => ({
                    ...l,
                    cards: l.cards.map((c) =>
                        c.id === cardId
                            ? { ...c, commentCount: Math.max(0, (c.commentCount ?? 0) - 1) }
                            : c
                    ),
                }))
            );
        });

        onUserJoined(({ username }) => {
            setActiveUsers((prev) => prev.includes(username) ? prev : [...prev, username]);
        });

        onUserLeft(({ username }) => {
            setActiveUsers((prev) => prev.filter((u) => u !== username));
        });

        onMemberJoined((member) => {
            setBoard((prev) => {
                if (!prev) return prev;
                if (prev.members?.some((m) => m.userId === member.userId)) return prev;
                return { ...prev, members: [...(prev.members ?? []), member] };
            });
        });

        onMemberLeft(({ userId: leftUserId }) => {
            setBoard((prev) => {
                if (!prev) return prev;
                return { ...prev, members: (prev.members ?? []).filter((m) => m.userId !== leftUserId) };
            });
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

    const handleLeaveBoard = async () => {
        await leaveBoardHttp(id);
        navigate("/boards");
    };

    const handleDeleteBoard = async () => {
        await deleteBoard(id);
        navigate("/boards");
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
        // dueDate est converti en ISO UTC pour que Npgsql (timestamptz) l'accepte
        try {
            await updateCard(updatedCard.id, {
                title: updatedCard.title,
                description: updatedCard.description,
                dueDate: updatedCard.dueDate
                    ? new Date(updatedCard.dueDate).toISOString()
                    : null,
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
    const handleDrop = async (e, targetListId, dropIndex) => {
        const cardId = parseInt(e.dataTransfer.getData("cardId"), 10);
        if (!cardId) return;

        const snapshot = lists;

        // Compute insertion position for the backend (siblings array excludes the moved card)
        const sourceList = lists.find((l) => l.cards.some((c) => c.id === cardId));
        const sourceCardIndex = sourceList?.cards.findIndex((c) => c.id === cardId) ?? -1;
        const isSameList = sourceList?.id === targetListId;
        const targetWithoutMoved = (lists.find((l) => l.id === targetListId)?.cards ?? []).filter((c) => c.id !== cardId);
        const rawPos = dropIndex ?? targetWithoutMoved.length;
        const apiPosition = isSameList && dropIndex != null && dropIndex > sourceCardIndex
            ? rawPos - 1
            : rawPos;

        setLists((prev) => {
            const card = prev.flatMap((l) => l.cards).find((c) => c.id === cardId);
            if (!card) return prev;

            const withoutCard = prev.map((l) => ({
                ...l,
                cards: l.cards.filter((c) => c.id !== cardId),
            }));

            return withoutCard.map((l) => {
                if (l.id !== targetListId) return l;
                const arr = [...l.cards];
                arr.splice(Math.min(apiPosition, arr.length), 0, { ...card, listId: targetListId });
                return { ...l, cards: arr };
            });
        });

        try {
            await moveCard(cardId, targetListId, apiPosition);
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
                onLeaveBoard={handleLeaveBoard}
                onDeleteBoard={handleDeleteBoard}
                activeUsers={activeUsers}
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
                    boardMembers={boardMembers}
                />
            )}
        </main>
    );
}
