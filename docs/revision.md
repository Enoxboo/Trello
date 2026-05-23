# Fiche de révision — Yello

---

## Architecture générale

**Stack :**
- Frontend : React 19 + Vite — SPA, pas de SSR, composants réutilisables, routing client-side
- Backend : ASP.NET Core 10 — API REST + hub SignalR sur le même process
- Base de données : PostgreSQL — relationnel, adapté aux foreign keys / cascade delete
- ORM : EF Core + Npgsql — on évite d'écrire du SQL à la main, les migrations versionnent le schéma

**Comment frontend et backend communiquent :**
- **REST (HTTP)** pour tout ce qui est CRUD : créer une carte, charger les listes, modifier un titre. Chaque requête est indépendante, le client attend la réponse.
- **SignalR (WebSocket)** pour la synchronisation temps réel : quand un utilisateur crée une carte, le serveur pousse l'événement `CardCreated` à tous les autres connectés sur le même board. Le client ne pollue pas le serveur avec des requêtes répétées.
- Règle : REST pour muter/lire, SignalR pour notifier.

---

## Authentification

**Flux JWT :**
1. Login → `POST /api/auth/login` → serveur retourne `accessToken` (JWT, 15 min) + `refreshToken` (chaîne aléatoire, 7 jours, stockée en base)
2. Chaque requête HTTP envoie `Authorization: Bearer <accessToken>`
3. Si 401 → le frontend appelle `POST /api/auth/refresh` avec le refreshToken → reçoit une nouvelle paire → réessaie la requête originale
4. Si le refresh échoue (token expiré ou invalidé) → redirect vers `/login`

**Pourquoi 15 min / 7 jours :**
- 15 min : si l'access token est volé (XSS, log), il expire vite
- 7 jours : évite à l'utilisateur de se reconnecter chaque quart d'heure
- Le refresh token est révocable côté serveur (on peut vider la colonne en base)

**Pourquoi sessionStorage pour l'access token :**
- Chaque onglet a son propre sessionStorage → deux utilisateurs différents peuvent être connectés dans deux onglets du même navigateur sans interférence
- Si on utilisait localStorage, un onglet connecté en tant que A lirait le token de l'autre onglet connecté en tant que B

**SignalR et JWT :**
- Les WebSockets ne supportent pas les headers HTTP après le handshake
- SignalR transmet le token via query string `?access_token=...` lors du handshake initial
- Program.cs lit ce paramètre dans `OnMessageReceived` pour les routes `/hubs/*`

---

## SignalR

**Qu'est-ce que c'est :**
- Bibliothèque qui maintient une connexion WebSocket persistante (avec fallback Long Polling si WebSocket indisponible)
- Abstraire le transport : le code côté serveur appelle `.SendAsync("EventName", data)`, le client enregistre un handler `connection.on("EventName", callback)`

**Pourquoi SignalR plutôt que polling :**
- Polling : le client demande "y a-t-il du nouveau ?" toutes les N secondes → latence, charge serveur inutile
- SignalR : le serveur pousse exactement quand il y a quelque chose → temps réel immédiat, pas de requêtes vides

**Cycle de vie du hub :**
- `JoinBoard(boardId)` → ajoute la connexion au groupe `board-{id}` + diffuse `UserJoined` aux autres
- `LeaveBoard(boardId)` → retire la connexion du groupe + diffuse `UserLeft` aux autres
- Le cleanup se fait dans le `return` du `useEffect` React (quand le composant démonte)

**Pattern "source de vérité unique" :**
- Le créateur d'une carte n'ajoute pas la carte directement dans son état local après l'appel API
- Il attend le broadcast `CardCreated` qui vient du serveur — comme n'importe quel autre client
- Pourquoi : sans ça, on voyait la carte en double (ajout local + arrivée du broadcast). Ce pattern garantit qu'un seul chemin met à jour l'état, pour tout le monde de la même façon.
- Seule exception : drag & drop utilise une mise à jour optimiste (on déplace localement, on rollback si l'API échoue) pour éviter une latence perceptible.

**Événements existants :**

| Événement | Déclenché par |
|---|---|
| `CardCreated` | `POST /api/lists/{id}/cards` |
| `CardUpdated` | `PUT /api/cards/{id}` |
| `CardMoved` | `PATCH /api/cards/{id}/position` |
| `CardDeleted` | `DELETE /api/cards/{id}` |
| `ListCreated` | `POST /api/boards/{id}/lists` |
| `ListUpdated` | `PUT /api/lists/{id}` |
| `ListDeleted` | `DELETE /api/lists/{id}` |
| `CommentAdded` | `POST /api/cards/{id}/comments` |
| `CommentUpdated` | `PUT /api/comments/{id}` |
| `CommentDeleted` | `DELETE /api/comments/{id}` |
| `MemberJoined` | `POST /api/boards/join` (code d'invitation) |
| `MemberLeft` | `POST /api/boards/{id}/leave` |
| `UserJoined` | `JoinBoard(boardId)` via SignalR |
| `UserLeft` | `LeaveBoard(boardId)` via SignalR |

---

## Base de données

**Entités et relations :**
- `User` → possède des `Board` (OwnerId), est membre via `BoardMember`, assigné via `CardMember`, auteur de `Comment`
- `Board` → contient des `List` (1→N), a des membres via `BoardMember` (N→N avec User)
- `List` → contient des `Card` (1→N), a un champ `Position` (entier) pour l'ordre
- `Card` → a des `Label` (1→N), des `Comment` (1→N), des membres via `CardMember` (N→N), un champ `Position`
- `Label` et `Comment` appartiennent à une seule `Card` (FK directe, pas de table de jointure)

**Pourquoi EF Core + PostgreSQL :**
- EF Core : migrations versionnées en C#, pas de SQL à écrire, Linq pour les requêtes
- PostgreSQL : supporte bien les timestamps avec timezone (utile pour DueDate), open source, bien intégré avec Npgsql

**Cascade delete :**
- Configurer en base que supprimer un `Board` supprime ses `List` → leurs `Card` → leurs `Label`, `Comment`, `CardMember`
- Sans ça, EF Core lève une erreur FK à la suppression (ou laisse des orphelins)
- On met `Restrict` sur les FKs vers `User` : supprimer un utilisateur ne supprime pas tous ses boards

---

## Choix techniques défendables

**React + Vite :**
- Vite : démarrage quasi-instantané en dev (pas de bundle complet au démarrage), HMR rapide
- React : écosystème riche, composants réutilisables, state management simple avec useState/useEffect pour ce niveau de complexité

**ASP.NET Core :**
- Imposé par le cours. En pratique : typage fort, DI intégrée, middleware JWT en quelques lignes, SignalR officiel
- Controllers minces (pas de logique) + Services = séparation des responsabilités claire

**SignalR vs WebSockets directs :**
- WebSockets directs = gestion manuelle du handshake, reconnexion, groupes, sérialisation
- SignalR gère tout ça + fournit un fallback automatique (Long Polling) si WebSocket est bloqué

**DTOs plutôt qu'entités directes :**
- Les entités EF Core ont des relations circulaires (Card → List → Cards...) : la sérialisation JSON bouclera ou lèvera une exception
- Les DTOs choisissent exactement ce qu'on expose, évitent de fuiter des champs internes (PasswordHash par exemple)

---

## Questions pièges probables

**"Pourquoi sessionStorage et pas localStorage pour l'access token ?"**
→ Isolation par onglet. Deux comptes différents ouverts dans deux onglets fonctionnent indépendamment. localStorage est partagé entre tous les onglets du même domaine.

**"Que se passe-t-il si le token expire pendant une session ?"**
→ La requête retourne 401. `api.js` intercepte le 401, appelle `/api/auth/refresh`, reçoit un nouveau token, réessaie la requête originale de façon transparente. L'utilisateur ne voit rien. Si le refresh échoue (token expiré ou invalidé), on redirige vers `/login`.

**"Comment vous gérez les conflits si deux users modifient la même carte en même temps ?"**
→ On ne gère pas de lock optimiste. C'est un "last write wins" : la dernière sauvegarde écrase la précédente. SignalR propage le changement aux autres clients qui voient la mise à jour. Pour un projet scolaire c'est acceptable ; en prod on ajouterait un champ `version` ou `updatedAt` à comparer.

**"Pourquoi SignalR comme source de vérité plutôt que la réponse API ?"**
→ Parce qu'on avait un bug : le créateur d'une carte recevait d'abord la réponse API (ajout local), puis l'événement SignalR (doublon). En faisant du broadcast la seule source de vérité, un seul chemin met à jour l'état pour tout le monde, y compris le créateur. L'API répond juste 200/201 mais n'est pas utilisée pour muter l'état local.

**"C'est quoi un hub SignalR ?"**
→ Une classe côté serveur qui gère les connexions WebSocket persistantes. Chaque client connecté obtient un `connectionId`. On peut regrouper des connexions en "groupes" (ici, un groupe par boardId) et broadcaster un message à tout le groupe en une ligne. Le serveur peut aussi pousser depuis n'importe quel service via `IHubContext<BoardHub>` injecté.

**"Vous avez testé quoi ?"**
→ Manuellement, avec deux navigateurs (ou deux onglets en profil différent) / deux comptes :
- Inscription + connexion sur les deux comptes
- Création d'un board, génération d'un code d'invitation, rejoindre depuis l'autre compte
- Créer/renommer/supprimer des cartes et des listes → vérifier que l'autre navigateur voit les changements en temps réel
- Drag & drop intra-liste et inter-liste → vérifier la persistance après rechargement
- Commentaires, labels, membres sur une carte → synchronisés en temps réel
- Token refresh : attendre 15 min (ou réduire la durée en dev) et continuer à utiliser l'app
- Quitter un board → l'utilisateur disparaît de la liste côté propriétaire en temps réel
