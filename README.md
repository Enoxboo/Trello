# Yello — Gestionnaire de tâches collaboratif (Trello-like)

Application web temps réel de gestion de tâches en tableaux/listes/cartes.

## Stack

| Couche | Technologie |
|---|---|
| Backend | C# / ASP.NET Core 10 |
| Base de données | PostgreSQL 18 |
| ORM | Entity Framework Core 10 + Npgsql |
| Authentification | JWT (access 30 min) + Refresh token (7 jours) |
| Temps réel | SignalR (WebSocket) |
| Frontend | React 18 (Vite) |
| Documentation API | Swagger / OpenAPI |

---

## Prérequis

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 18](https://www.postgresql.org/download/) — base `yello_db` sur `localhost:5432`
- Outil EF Core CLI : `dotnet tool install --global dotnet-ef`

---

## Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd Yello
```

### 2. Configurer la base de données

Créer la base PostgreSQL :

```sql
CREATE DATABASE yello_db;
```

Vérifier / modifier la chaîne de connexion dans `backend/Yello/appsettings.json` :

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=yello_db;Username=postgres;Password=<votre_mot_de_passe>"
}
```

### 3. Appliquer les migrations EF Core

```bash
cd backend/Yello
dotnet ef database update
```

Cela crée les tables : `Users`, `Boards`, `Lists`, `Cards`, `Comments`, `Labels`, `RefreshTokens`.

### 4. Installer les dépendances frontend

```bash
cd frontend
npm install
```

---

## Lancement

### Backend

```bash
cd backend/Yello
dotnet run
```

Démarre sur `http://localhost:5107`.  
Documentation API Swagger : `http://localhost:5107/swagger`

### Frontend

```bash
cd frontend
npm run dev
```

Démarre sur `http://localhost:5173` (ou 5174/5175 si le port est pris).

---

## Fonctionnalités

- **Authentification JWT** : inscription, connexion, refresh token automatique
- **Tableau Kanban** : listes scrollables, cartes draggables entre colonnes
- **Drag & Drop HTML5** : déplacement de cartes avec mise à jour optimiste + rollback
- **Détail de carte** : titre, description, date d'échéance, labels colorés, commentaires
- **Temps réel SignalR** : synchronisation instantanée entre onglets/utilisateurs

---

## Architecture

```
backend/Yello/        — ASP.NET Core API (Controllers, Services, Entities, DTOs)
frontend/             — React SPA (Views, Components, Services, hooks)
```

Voir `CLAUDE.md` pour l'architecture détaillée.

---

## Tester le temps réel

1. Démarrer backend + frontend
2. Ouvrir deux onglets sur `http://localhost:5173`
3. Se connecter avec le même compte dans les deux onglets
4. Ajouter/déplacer/supprimer une carte dans un onglet → l'autre se met à jour instantanément
