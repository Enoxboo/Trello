export class CardModel {
    constructor(id, title, dueDate = null, labels = [], comments = 0, members = []) {
        this.id = id;
        this.title = title;
        this.dueDate = dueDate;
        this.labels = labels;
        this.comments = comments;
        this.members = members;
    }
}

export class ListModel {
    constructor(id, title, cards = []) {
        this.id = id;
        this.title = title;
        this.cards = cards;
    }
}

export class BoardModel {
    constructor(id, title, lists = []) {
        this.id = id;
        this.title = title;
        this.lists = lists;
    }
}

// Données mock pour développement
export const mockBoard = new BoardModel(1, "Mon Projet Yello", [
    new ListModel(1, "À faire", [
        new CardModel(1, "Créer la page de login", "2026-04-15", ["urgent"], 3, ["LT"]),
        new CardModel(2, "Configurer le backend C#", "2026-04-20", ["dev"], 1, ["LT", "JD"]),
        new CardModel(3, "Rédiger les specs", null, ["doc"], 0, []),
    ]),
    new ListModel(2, "En cours", [
        new CardModel(4, "Design du tableau Kanban", "2026-04-14", ["design", "urgent"], 5, ["LT"]),
        new CardModel(5, "Intégration React Router", null, ["dev"], 2, ["JD"]),
    ]),
    new ListModel(3, "En révision", [
        new CardModel(6, "Améliorer la responsivité", "2026-04-13", ["design"], 4, ["LT", "JD"]),
    ]),
    new ListModel(4, "Terminé", [
        new CardModel(7, "Initialiser le projet Vite", null, [], 0, ["LT"]),
        new CardModel(8, "Configurer Tailwind CSS", null, ["dev"], 1, ["LT"]),
    ]),
]);