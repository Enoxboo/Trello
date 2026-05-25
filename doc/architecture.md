# Architecture — Diagramme de classes / entités

## Modèle de données (EF Core → PostgreSQL)

```mermaid
erDiagram
    User {
        int     Id          PK
        string  Username    UK
        string  Email       UK
        string  PasswordHash
        datetime CreatedAt
    }

    Board {
        int     Id      PK
        string  Title
        datetime CreatedAt
        int     UserId  FK
    }

    List {
        int     Id      PK
        string  Title
        int     Position
        int     BoardId FK
    }

    Card {
        int     Id          PK
        string  Title
        string  Description
        datetime DueDate
        int     Position
        int     ListId      FK
    }

    Comment {
        int     Id        PK
        string  Content
        datetime CreatedAt
        int     CardId    FK
        int     UserId    FK
    }

    Label {
        int     Id     PK
        string  Name
        string  Color
        int     CardId FK
    }

    RefreshToken {
        int     Id        PK
        string  Token     UK
        datetime ExpiresAt
        bool    IsRevoked
        int     UserId    FK
    }

    User       ||--o{ Board        : "possède"
    User       ||--o{ Comment      : "rédige"
    User       ||--o{ RefreshToken : "détient"
    Board      ||--o{ List         : "contient"
    List       ||--o{ Card         : "contient"
    Card       ||--o{ Comment      : "reçoit"
    Card       ||--o{ Label        : "tagué par"
```

---

## Architecture backend (couches)

```
HTTP Request
     │
     ▼
┌─────────────────┐
│   Controllers   │  Reçoit les requêtes, extrait CurrentUserId du JWT,
│                 │  délègue aux services, retourne les DTOs
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Services     │  Logique métier : validation, accès BDD via DbContext,
│                 │  émission d'événements SignalR (CardService, ListService)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   AppDbContext  │  EF Core — mapping entités ↔ tables PostgreSQL,
│   (EF Core)     │  index uniques, cascade deletes
└─────────────────┘
```

## Architecture frontend (flux de données)

```
BoardView (état central)
    │
    ├── useBoardHub(boardId, handlers)   ← SignalR (événements temps réel)
    │
    ├── boardService / listService / cardService / commentService / labelService
    │       └── apiFetch()  ← Authorization: Bearer + refresh auto 401
    │
    ├── ListColumn[]
    │       └── CardItem  (draggable)
    │
    └── CardModal (selectedCard)
            ├── CardModalTitle        → PUT /api/cards/{id}
            ├── CardModalDescription  → PUT /api/cards/{id}
            ├── CardModalDueDate      → PUT /api/cards/{id}
            ├── CardModalComments     → POST/PUT/DELETE /api/cards/{id}/comments
            └── CardModalLabels       → POST/DELETE /api/cards/{id}/labels
```

---

## Cascade deletes configurés

| Suppression de | Entraîne la suppression de |
|---|---|
| User | Boards, Comments, RefreshTokens |
| Board | Lists |
| List | Cards |
| Card | Comments, Labels |
