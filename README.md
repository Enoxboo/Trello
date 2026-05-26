# Yello — Gestionnaire de tâches Kanban

Clone de Trello développé en React + ASP.NET Core. Projet B2 Ynov Toulouse 2024/2025.

---

## Prérequis

| Outil | Version minimum |
|---|---|
| .NET SDK | 10.0 |
| Node.js | 20+ |
| PostgreSQL | 15+ |
| dotnet-ef | 10.0 |

Installer l'outil de migrations :
```bash
dotnet tool install --global dotnet-ef
```

---

## Installation

### 1. Cloner le dépôt

```bash
git clone git@github.com:Enoxboo/Trello.git
cd Trello
```

### 2. Base de données

Créer une base PostgreSQL locale :
```sql
CREATE DATABASE yello_db;
```

Vérifier la connection string dans `backend/Yello/appsettings.json` :
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=yello_db;Username=postgres;Password=postgres"
}
```

### 3. Migrations EF Core

```bash
cd backend/Yello
dotnet ef database update
```

Cela crée toutes les tables (Users, Boards, Lists, Cards, Labels, Comments, BoardMembers, CardMembers).

---

## Lancement

### Backend (terminal 1)

```bash
cd backend/Yello
dotnet run
```

API disponible sur : `http://localhost:5245`  
Documentation Swagger : `http://localhost:5245/swagger`

### Frontend (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Application disponible sur : `http://localhost:5173`

---

## Configuration IDE (Rider)

Le fichier `.idea/` est ignoré par git. Pour que le frontend soit visible dans l'explorateur Rider :

1. Clic droit sur la solution dans le panneau de gauche
2. **Add → Attach Existing Folder**
3. Sélectionner le dossier `frontend/`

---

## Fonctionnalités

- Inscription / connexion avec JWT (access token 15 min + refresh token 7 jours)
- Gestion de boards, listes, cartes avec persistence des positions (drag & drop)
- Labels colorés, membres assignés, date d'échéance, commentaires sur les cartes
- Synchronisation temps réel entre navigateurs via SignalR (WebSocket)
