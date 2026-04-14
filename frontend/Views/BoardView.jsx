import { useState } from "react";
import BoardHeader from "../components/BoardHeader";
import ListColumn from "../components/ListColumn";
import { mockBoard } from "../models/BoardModel";
import "../style/board.css";


export default function BoardView() {
    const [board, setBoard] = useState(mockBoard);

    const handleRenameBoard = (newTitle) => {
        setBoard({ ...board, title: newTitle });
    };

    const handleRenameList = (listId, newTitle) => {
        setBoard({
            ...board,
            lists: board.lists.map((l) =>
                l.id === listId ? { ...l, title: newTitle } : l
            ),
        });
    };

    const handleAddCard = (listId, newCard) => {
        setBoard({
            ...board,
            lists: board.lists.map((l) =>
                l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
            ),
        });
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
                    />
                ))}
            </div>
        </main>
    );
}