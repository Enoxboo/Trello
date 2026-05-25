export class CommentModel {
    constructor(id, author, content, date = new Date().toISOString()) {
        this.id = id;
        this.author = author;
        this.content = content;
        this.date = date;
    }
}

export class CardModel {
    constructor(id, title, dueDate = null, labels = [], comments = [], members = [], description = "") {
        this.id = id;
        this.title = title;
        this.dueDate = dueDate;
        this.labels = labels;
        this.comments = comments;
        this.members = members;
        this.description = description;
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
const L = {
    urgent: { name: "urgent", color: "#c0392b" },
    design: { name: "design", color: "#805e73" },
    dev:    { name: "dev",    color: "#2980b9" },
    doc:    { name: "doc",    color: "#27ae60" },
    test:   { name: "test",   color: "#f39c12" },
};

export const mockBoard = new BoardModel(1, "Mon Projet Yello", [
    new ListModel(1, "À faire", [
        new CardModel(1, "Créer la page de login", "2026-04-15",
            [L.urgent],
            [new CommentModel(101, "LT", "À faire en priorité cette semaine")],
            ["LT"], "Implémenter la page de login avec React et le backend C#."
        ),
        new CardModel(2, "Configurer le backend C#", "2026-04-20",
            [L.dev],
            [new CommentModel(102, "JD", "Penser à ajouter la validation JWT")],
            ["LT", "JD"], "Mettre en place l'API ASP.NET Core avec les endpoints d'auth."
        ),
        new CardModel(3, "Rédiger les specs", null,
            [L.doc], [], [], ""
        ),
    ]),
    new ListModel(2, "En cours", [
        new CardModel(4, "Design du tableau Kanban", "2026-04-14",
            [L.design, L.urgent],
            [
                new CommentModel(103, "LT", "Maquette en cours"),
                new CommentModel(104, "JD", "Valider avec le client avant dev"),
            ],
            ["LT"], "Créer la vue board avec colonnes scrollables et cartes interactives."
        ),
        new CardModel(5, "Intégration React Router", null,
            [L.dev],
            [new CommentModel(105, "JD", "Routes /login, /register, /board configurées")],
            ["JD"], ""
        ),
    ]),
    new ListModel(3, "En révision", [
        new CardModel(6, "Améliorer la responsivité", "2026-04-13",
            [L.design],
            [
                new CommentModel(106, "LT", "Mobile OK, tablette à revoir"),
                new CommentModel(107, "JD", "Breakpoint 900px à ajuster"),
                new CommentModel(108, "AM", "✅ Validé sur iPhone 14"),
            ],
            ["LT", "JD"], "Adapter le CSS pour mobile, tablette et desktop."
        ),
    ]),
    new ListModel(4, "Terminé", [
        new CardModel(7, "Initialiser le projet Vite", null,
            [], [], ["LT"], ""
        ),
        new CardModel(8, "Configurer Tailwind CSS", null,
            [L.dev],
            [new CommentModel(109, "LT", "Tailwind v4 + plugin Vite installés")],
            ["LT"], ""
        ),
    ]),
]);