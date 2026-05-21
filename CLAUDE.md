# Yello — Projet scolaire Kanban (Ynov Toulouse B2, 2024/2025)

Clone de Trello — gestionnaire de tâches collaboratif en temps réel.
Module : C# / ASP.NET Core · Cursus : Architecture, EF Core, JWT, SignalR.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS + React Router |
| Backend | C# ASP.NET Core 10 (net10.0) |
| Base de données | PostgreSQL (prod) / SQLite (dev si besoin) |
| ORM | Entity Framework Core 10 + Npgsql |
| Auth | JWT (access 15 min) + Refresh Token (7 jours) + BCrypt |
| Temps réel | SignalR (WebSocket) |
| Doc API | Swagger / OpenAPI (Swashbuckle) |

---

## Lancer le projet

### Backend
```bash
cd backend/Yello
dotnet run
# Swagger disponible sur http://localhost:5245/swagger
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Vite sur http://localhost:5173 (par défaut)
```

### Migrations EF Core
```bash
cd backend/Yello
dotnet ef migrations add <NomMigration>
dotnet ef database update
```

> Prérequis : `dotnet tool install --global dotnet-ef` + PostgreSQL démarré

---

## Arborescence des fichiers clés

```
Trello/
├── CLAUDE.md                          ← ce fichier
├── documentation.md                   ← doc architecture (à compléter)
├── README.md                          ← livrable (à créer)
├── Yello.sln
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    ← routes (/, /login, /register)
│   │   └── main.jsx
│   ├── Views/
│   │   ├── BoardView.jsx              ← état principal + mock data (à connecter à l'API)
│   │   ├── LoginView.jsx
│   │   └── RegisterView.jsx
│   ├── Components/
│   │   ├── CardModal.jsx              ← modal détail carte
│   │   ├── CardModalHeader.jsx
│   │   ├── CardModalLabels.jsx
│   │   ├── CardModalMembers.jsx
│   │   ├── CardModalDueDate.jsx
│   │   ├── CardModalComments.jsx
│   │   ├── ListColumn.jsx
│   │   ├── CardItem.jsx
│   │   ├── BoardHeader.jsx
│   │   ├── AddCardButton.jsx
│   │   └── AddListButton.jsx
│   ├── Models/
│   │   ├── BoardModel.js              ← modèles + mock data (BoardModel, ListModel, CardModel)
│   │   └── AuthModel.js              ← LoginModel, RegisterModel
│   ├── Services/
│   │   ├── authService.js             ← auth API (partiellement implémenté)
│   │   ├── boardService.js            ← À CRÉER : CRUD boards
│   │   ├── cardService.js             ← À CRÉER : CRUD cards/labels/comments
│   │   └── signalRService.js          ← À CRÉER : connexion hub temps réel
│   └── style/
│       ├── board.css
│       ├── card-modal.css
│       └── login.css
│
└── backend/Yello/
    ├── Program.cs                     ← entry point (à étendre)
    ├── Yello.csproj                   ← dépendances NuGet (JWT, EF Core, BCrypt déjà là)
    ├── appsettings.json
    ├── Data/
    │   └── AppDbContext.cs            ← À CRÉER
    ├── Entities/                      ← À CRÉER
    │   ├── User.cs
    │   ├── Board.cs
    │   ├── List.cs
    │   ├── Card.cs
    │   ├── Comment.cs
    │   ├── Label.cs
    │   ├── BoardMember.cs
    │   └── CardMember.cs
    ├── Controllers/                   ← À CRÉER
    │   ├── AuthController.cs
    │   ├── BoardController.cs
    │   ├── ListController.cs
    │   ├── CardController.cs
    │   └── CommentController.cs
    ├── Services/                      ← À CRÉER
    │   ├── AuthService.cs
    │   ├── JwtService.cs
    │   ├── BoardService.cs
    │   ├── ListService.cs
    │   ├── CardService.cs
    │   └── CommentService.cs
    ├── Hubs/                          ← À CRÉER
    │   └── BoardHub.cs
    └── Migrations/                    ← générées par EF Core
```

---

## Ce qui est déjà fait

### Frontend (quasi complet)
- UI complète : landing, login, register, board view
- Card modal riche : titre éditable, description, labels (preset + custom), membres, date d'échéance, commentaires (ajout/édition/suppression)
- Navigation React Router
- Tailwind CSS + Lucide icons
- Modèles de données front (AuthModel, BoardModel, ListModel, CardModel, CommentModel)
- Tout fonctionne avec des données mock — prêt pour connexion API

### Backend (scaffold seulement)
- Projet ASP.NET Core créé
- Dépendances NuGet déjà installées : JWT Bearer, EF Core, Npgsql, BCrypt, Swagger
- Ports : HTTP 5245, HTTPS 7122

---

## Ce qui reste à faire

### Phase A — Entités + EF Core (fondation backend)
- Créer toutes les entités (`User`, `Board`, `List`, `Card`, `Comment`, `Label`, `BoardMember`, `CardMember`)
- `AppDbContext` avec DbSets, relations, cascade delete
- Migrations + update database

### Phase B — Authentification JWT
- `AuthService` : register (BCrypt), login, génération JWT + refresh token
- `JwtService` : generate/validate tokens
- `AuthController` : `POST /api/auth/register`, `/login`, `/refresh`
- Config JWT dans `Program.cs` (secret dans appsettings, durées)

### Phase C — CRUD Backend
- Board : GET tous, GET par id, POST, PUT, DELETE
- List : GET par board, POST, PUT (titre + position), DELETE
- Card : GET par list, POST, PUT (titre/desc/position/duedate), DELETE
- Labels : POST, DELETE sur une carte
- Members : assigner/désassigner sur une carte
- Comments : POST, PUT, DELETE

### Phase D — SignalR (temps réel)
- `BoardHub` : groupes par boardId (`JoinBoard`, `LeaveBoard`)
- Broadcast : création/déplacement carte, modification titre, commentaires, présence

### Phase E — Intégration frontend ↔ API
- Remplacer mock data dans `BoardView.jsx` par appels API réels
- Compléter `authService.js` (register + refresh)
- Créer `boardService.js` et `cardService.js`
- Gestion JWT dans les headers (helper `api.js` avec Authorization)
- Connecter card modal à l'API (labels, membres, commentaires)

### Phase F — Drag & Drop
- HTML5 native (`dragstart`, `dragover`, `drop`) dans `BoardView.jsx`
- Mise à jour optimiste + rollback si erreur
- PATCH position vers l'API au drop

### Phase G — SignalR frontend
- `npm install @microsoft/signalr`
- `signalRService.js` : connexion, joinBoard, leaveBoard
- Écoute events dans `BoardView.jsx` et mise à jour état local

### Phase H — Livrables finaux
- Compléter `documentation.md` : attributs entités, routes API, diagramme Mermaid
- Créer `README.md` : prérequis, install, migrations, lancement
- Vérifier Swagger opérationnel

---

## Entités de données

```
User         — Id, Username, Email, PasswordHash, RefreshToken, RefreshTokenExpiry
Board        — Id, Title, OwnerId → User, [BoardMembers], [Lists]
BoardMember  — BoardId, UserId (many-to-many)
List         — Id, Title, Position, BoardId → Board, [Cards]
Card         — Id, Title, Description, Position, DueDate, ListId → List, [Labels], [CardMembers], [Comments]
CardMember   — CardId, UserId (many-to-many)
Label        — Id, Name, Color, CardId → Card
Comment      — Id, Content, CreatedAt, UpdatedAt, AuthorId → User, CardId → Card
```

---

## Routes API prévues

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh

GET    /api/boards              ← boards de l'utilisateur connecté
POST   /api/boards
GET    /api/boards/{id}
PUT    /api/boards/{id}
DELETE /api/boards/{id}

GET    /api/boards/{boardId}/lists
POST   /api/boards/{boardId}/lists
PUT    /api/lists/{id}
DELETE /api/lists/{id}
PATCH  /api/lists/{id}/position

GET    /api/lists/{listId}/cards
POST   /api/lists/{listId}/cards
GET    /api/cards/{id}
PUT    /api/cards/{id}
DELETE /api/cards/{id}
PATCH  /api/cards/{id}/position

POST   /api/cards/{cardId}/labels
DELETE /api/cards/{cardId}/labels/{labelId}
POST   /api/cards/{cardId}/members
DELETE /api/cards/{cardId}/members/{userId}

GET    /api/cards/{cardId}/comments
POST   /api/cards/{cardId}/comments
PUT    /api/comments/{id}
DELETE /api/comments/{id}

WS     /hubs/board              ← SignalR hub
```

---

## Points de vigilance

- **JWT secret** : stocker dans `appsettings.Development.json` (jamais hardcodé), utiliser une clé forte (256 bits min)
- **CORS** : configurer pour autoriser `http://localhost:5173` en dev
- **Cascade delete** : configurer explicitement dans `OnModelCreating` (Board supprimé → Lists → Cards → Comments/Labels)
- **Position persistence** : les ordres de listes et de cartes sont stockés en base (champ `Position`)
- **Refresh token** : stocker haché en base ou en cookie HttpOnly
- **Migrations** : committer les fichiers de migration dans Git
- **1 commit = 1 feature** : convention stricte exigée dans le sujet
