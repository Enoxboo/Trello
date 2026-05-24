# C# B2 — Module ASP.NET Core & Développement Web
> Ynov Toulouse · 2024/2025 · Architecture • Entity Framework • JWT • SignalR

---

## Pourquoi C# ?

| | |
|---|---|
| 🏢 **Industrie** | Massivement utilisé en entreprise — banque, assurance, industrie, jeux vidéo (Unity) |
| ⚡ **Performance** | Compilé, typé fort, runtime optimisé. Bien plus rapide que Python ou PHP pour les APIs |
| 🌐 **Full-Stack** | Un seul langage du backend API à l'application mobile (MAUI) ou desktop (WPF/WinForms) |
| 🛡️ **Robustesse** | Typage fort, null safety, gestion d'exceptions — moins de bugs en production |

> C# est le 5e langage le plus utilisé dans le monde · Stack Overflow Survey 2024

---

## L'écosystème .NET

```
.NET Runtime
├── ASP.NET Core   → Web APIs & MVC
├── Entity Framework → ORM & Migrations
├── MAUI           → Mobile & Desktop
├── Blazor         → Front Web en C#
├── SignalR        → Temps Réel / WebSockets
├── gRPC           → Microservices
└── NuGet          → Gestionnaire de packages
```

> Ce module couvre : **ASP.NET Core + Entity Framework + SignalR**

---

## Environnement de développement

1. **.NET SDK 8+** — `dotnet --version`
2. **VS Code + C# Dev Kit** — IntelliSense, debugger, tests
3. **Git** — Commits réguliers et propres attendus
4. **SQLite / DB Browser** — Pour le dev local, pas besoin d'un serveur PG
5. **Postman ou Swagger** — Tests d'API, doc générée automatiquement
6. **Terminal (zsh/bash)** — dotnet CLI pour scaffolding, migrations, run, build

---

## Architecture en couches

```
HTTP Request/Response
        ↓
  [ Controllers ]      ← Présentation
        ↓
   [ Services ]        ← Logique métier
        ↓
  [ Repositories ]     ← Accès aux données
        ↓
[ DbContext (EF Core)] ← SQLite / PostgreSQL
```

> Chaque couche ne parle qu'avec celle du dessous · Principe de **Separation of Concerns**

---

## Étapes de construction — TaskBoard API

### Étape 1 : Initialisation

```bash
# Créer le projet
dotnet new webapi -n TaskBoardApi
# dotnet new webapp -n TaskBoardApi
# dotnet new mvc -n TaskBoardApi

# Lancer
dotnet run
dotnet watch run
```

---

### Étape 2 : Première route (in-memory)

```csharp
// App.cs
var boards = new List<string> { "Projet 1", "Projet 2" };

app.MapGet("/boards", () => boards);

app.MapPost("/boards", (string name) =>
{
    boards.Add(name);
    return boards;
});
```

---

### Étape 3 : Premier DTO (Data Transfer Object)

> Un DTO sert à transporter des données entre les composants de l'application.

```csharp
// Board.cs
public class Board
{
    public int Id { get; set; }
    public string Name { get; set; }
}
```

---

### Étape 4 : Base de données (Entity Framework Core)

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

```csharp
// AppDbContext.cs
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Board> Boards { get; set; }
}
```

```csharp
// Program.cs — enregistrement du contexte
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=taskboard.db"));
```

---

### Étape 5 : Migrations

```bash
dotnet tool install --global dotnet-ef

dotnet ef migrations add Init
dotnet ef database update
```

---

### Étape 6 : CRUD complet

```csharp
// GET /boards
app.MapGet("/boards", async (AppDbContext db) =>
{
    return await db.Boards.ToListAsync();
});

// POST /boards
app.MapPost("/boards", async (Board board, AppDbContext db) =>
{
    db.Boards.Add(board);
    await db.SaveChangesAsync();
    return board;
});

// DELETE /boards/{id}
app.MapDelete("/boards/{id}", async (int id, AppDbContext db) =>
{
    var board = await db.Boards.FindAsync(id);
    if (board == null) return Results.NotFound();

    db.Boards.Remove(board);
    await db.SaveChangesAsync();

    return Results.Ok();
});
```

---

### Étape 7 : Relations entre entités

```csharp
// ListItem.cs
public class ListItem
{
    public int Id { get; set; }
    public string Title { get; set; }

    public int BoardId { get; set; }
    public Board Board { get; set; }
}

// Board.cs (ajout)
public List<ListItem> Lists { get; set; }
```

```bash
dotnet ef migrations add AddLists
dotnet ef database update
```

---

### Étape 8 : JWT (authentification)

> Le JWT (JSON Web Token) est un standard permettant de sécuriser les échanges entre client et serveur.  
> Fonctionnement :
> 1. L'utilisateur se connecte → le serveur génère un token signé
> 2. Le client inclut ce token dans chaque requête (`Authorization: Bearer <token>`)
> 3. Le serveur vérifie la signature avant d'autoriser l'accès

---

### Étape 9 : SignalR (temps réel)

```bash
dotnet add package Microsoft.AspNetCore.SignalR
```

```csharp
// Hubs/BoardHub.cs
using Microsoft.AspNetCore.SignalR;

public class BoardHub : Hub
{
    public async Task SendMessage(string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", message);
    }
}
```

```csharp
// Program.cs
builder.Services.AddSignalR();
app.MapHub<BoardHub>("/boardHub");
```

---

---

# Projet Final — TaskBoard

> Gestionnaire de tâches collaboratif · Inspiré de Trello · Temps réel · Full-stack

## Contexte

Vous intégrez une équipe de développement au sein d'une entreprise spécialisée dans les outils de productivité. Votre mission est de concevoir et développer un gestionnaire de tâches collaboratif inspiré des solutions populaires. Cette application permettra aux équipes d'organiser leur travail en tableaux, listes et cartes, avec une synchronisation en temps réel entre tous les membres.

## Objectifs pédagogiques

- Implémenter une architecture avec des séparations claires des responsabilités
- Maîtriser Entity Framework Core : modélisation relationnelle, migrations, optimisations des requêtes
- Concevoir un système d'authentification JWT complet
- Développer une communication temps réel (WebSocket)
- Implémenter le drag & drop natif HTML5 avec persistance des positions
- Gérer les problématiques de concurrence et synchronisation multi-utilisateurs
- Appliquer les principes SOLID et les bonnes pratiques de développement .NET

---

## Stack technique imposée

| Couche | Technologie |
|---|---|
| **Backend** | C# · ASP.NET Core 8+ |
| **Base de données** | SQLite (dev) · PostgreSQL (prod) |
| **Authentification** | JWT · Access Token + Refresh Token |
| **Temps réel** | SignalR (WebSocket) |
| **Frontend** | HTML5 · CSS3 · JS Vanilla (ou framework au choix) |
| **Doc API** | Swagger / OpenAPI |

---

## Fonctionnalités obligatoires

### 🔐 Authentification JWT

- Inscription (email, username, mot de passe hashé avec BCrypt ou ASP.NET Identity)
- Connexion → génération d'un access token JWT signé
- Refresh token pour renouveler l'access token sans reconnexion
- Access token : durée courte (15–30 min) · Refresh token : plusieurs jours
- Middleware d'autorisation vérifiant validité et permissions

### 📋 Structure des données

```
Workspace
└── Board (tableau)
    └── List (colonne : À faire, En cours, Terminé…)
        └── Card (tâche)
            ├── Titre
            ├── Description (Markdown)
            ├── Date d'échéance
            ├── Labels
            ├── Membres assignés
            └── Commentaires
```

L'ordre des lists et des cards est persisté en base de données.

### 🖱️ Drag & Drop

- Déplacement de cards au sein d'une list ou vers une autre list
- Réorganisation des lists entre elles
- Implémentation via l'API HTML5 native (`dragstart`, `dragover`, `dragenter`, `dragleave`, `drop`)
- Mise à jour optimiste côté client + rollback si erreur serveur
- Indicateurs visuels : surbrillance zone de dépôt, placeholder de position

### ⚡ Temps réel (SignalR)

- Hub dédié par board — les clients rejoignent un groupe par board
- Synchronisation en temps réel : création/déplacement de carte, modification de titre, commentaires
- Indicateurs de présence (qui consulte le board)
- Reconnexion automatique et resynchronisation de l'état

### 📝 Détail d'une carte

- Titre éditable en clic
- Description avec support Markdown
- Assignation de membres
- Labels colorés personnalisables
- Date d'échéance avec code couleur (proche / dépassée)
- Commentaires (auteur, date, contenu, modification/suppression)

---

## Architecture backend

```
Controllers   → Reçoivent les requêtes HTTP, pas de logique métier
Services      → Logique métier, un service par domaine (BoardService, CardService, AuthService)
Entities      → Modèles de données et règles métier
Repositories  → Accès aux données via EF Core
DbContext     → Configuration EF Core, migrations, relations
```

- Injection de dépendances native ASP.NET Core
- Validation via Data Annotations ou FluentValidation
- Relations EF Core (one-to-many, many-to-many), suppressions en cascade configurées

---

## Fonctionnalités bonus

| Fonctionnalité | Description |
|---|---|
| Checklists | Sous-tâches cochables avec barre de progression |
| Pièces jointes | Upload, stockage et téléchargement de fichiers |
| Historique d'activité | Journal des actions sur chaque carte |
| Notifications | Alertes pour assignations, mentions, échéances |
| Recherche & filtrage | Recherche textuelle, filtres par labels/membres/dates |
| Templates de board | Création depuis modèles prédéfinis |
| Mode sombre | Thème alternatif avec persistance |
| Vue calendrier | Affichage des cartes avec échéance |
| Export de données | JSON ou CSV |
| Raccourcis clavier | Navigation rapide |
| Archivage | Archiver sans supprimer, restauration possible |
| Duplication | Copier une carte, une list ou un board entier |

---

## Livrables

- **Code source Git** — historique de commits propre et régulier (1 commit = 1 feature)
- **README.md** incluant :
  - Prérequis système (versions .NET, base de données)
  - Instructions d'installation et configuration
  - Commandes pour appliquer les migrations EF Core
  - Procédure de lancement en développement
- **Diagramme d'architecture** — classes/entités + couches
- **Documentation API** — générée via Swagger/OpenAPI
- **Documentation JWT** — fonctionnement du système d'authentification
- **Démonstration fonctionnelle** en soutenance, incluant test temps réel multi-navigateurs

## Points de vigilance

| Critère | Attendu |
|---|---|
| **Git** | 1 commit = 1 feature · Messages clairs |
| **Architecture** | Respecter les couches · Pas de logique dans les controllers |
| **Sécurité** | JWT bien implémenté · Hash des mots de passe |
| **Temps réel** | SignalR opérationnel en test multi-navigateurs |