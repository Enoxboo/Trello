# Documentation — Système d'authentification JWT

## Vue d'ensemble

Yello utilise une authentification **JWT (JSON Web Token)** combinée à un **refresh token** persisté en base de données.

```
Client                          Serveur
  │                                │
  │  POST /api/auth/login          │
  │  { email, password }           │
  │ ──────────────────────────────▶│
  │                                │  1. Vérifie email + BCrypt hash
  │                                │  2. Génère access token (JWT, 30 min)
  │                                │  3. Génère refresh token (GUID, 7 jours)
  │                                │  4. Persiste refresh token en BDD
  │  { accessToken, refreshToken } │
  │ ◀──────────────────────────────│
  │                                │
  │  GET /api/boards               │
  │  Authorization: Bearer <JWT>   │
  │ ──────────────────────────────▶│
  │                                │  5. Middleware valide la signature JWT
  │                                │  6. Extrait UserId depuis les claims
  │  200 OK { boards }             │
  │ ◀──────────────────────────────│
```

---

## Structure du JWT (access token)

Le token est signé avec HMAC-SHA256 à partir d'une clé secrète (`JwtSettings:SecretKey`).

**Header**
```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload (claims)**
```json
{
  "sub":        "42",
  "unique_name":"alice",
  "email":      "alice@example.com",
  "jti":        "uuid-aléatoire",
  "exp":        1716123456,
  "iss":        "YelloApi",
  "aud":        "YelloClient"
}
```

- `sub` — UserId, extrait dans `BaseController.CurrentUserId`
- `exp` — expiration à 30 minutes (configurable dans `appsettings.json`)
- `jti` — identifiant unique du token (évite la réutilisation)

---

## Refresh token

| Propriété | Valeur |
|---|---|
| Stockage | Table `RefreshTokens` en PostgreSQL |
| Format | GUID aléatoire (cryptographiquement sûr) |
| Durée de vie | 7 jours |
| Rotation | Oui — chaque refresh génère un nouveau token et révoque l'ancien |

### Flux de refresh

```
Client                          Serveur
  │                                │
  │  [JWT expiré → 401]            │
  │                                │
  │  POST /api/auth/refresh        │
  │  { refreshToken }              │
  │ ──────────────────────────────▶│
  │                                │  1. Cherche le token en BDD
  │                                │  2. Vérifie : non révoqué + non expiré
  │                                │  3. Révoque l'ancien token (IsRevoked = true)
  │                                │  4. Génère un nouveau JWT + nouveau refresh token
  │  { accessToken, refreshToken } │
  │ ◀──────────────────────────────│
  │                                │
  │  [Rejoue la requête initiale]  │
```

Le refresh est **transparent** côté frontend : `apiFetch()` dans `boardService.js` intercepte les 401, tente un refresh automatique, puis rejoue la requête originale. Si le refresh échoue (token expiré ou révoqué), l'utilisateur est redirigé vers `/login`.

---

## Sécurité des mots de passe

Les mots de passe sont hashés avec **BCrypt** (coût adaptatif) avant persistance. Le hash en clair n'est jamais stocké ni transmis.

```csharp
// Hachage à l'inscription
PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

// Vérification à la connexion
BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
```

---

## Configuration (`appsettings.json`)

```json
"JwtSettings": {
  "SecretKey":                  "<clé secrète ≥ 32 caractères>",
  "Issuer":                     "YelloApi",
  "Audience":                   "YelloClient",
  "AccessTokenExpiryMinutes":   30,
  "RefreshTokenExpiryDays":     7
}
```

---

## Endpoints d'authentification

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription — retourne `{ accessToken, refreshToken, username }` |
| POST | `/api/auth/login` | Connexion — retourne `{ accessToken, refreshToken, username }` |
| POST | `/api/auth/refresh` | Échange un refresh token contre de nouveaux tokens |

Tous les autres endpoints (`/api/boards`, `/api/lists`, `/api/cards`, hub SignalR) requièrent un JWT valide via `[Authorize]`.

### Cas particulier : SignalR

Les connexions WebSocket ne supportent pas les headers HTTP. Le JWT est donc transmis en **query string** :

```
ws://localhost:5107/hubs/board?access_token=<JWT>
```

Configuré dans `Program.cs` :
```csharp
options.Events = new JwtBearerEvents {
    OnMessageReceived = ctx => {
        var token = ctx.Request.Query["access_token"];
        if (!string.IsNullOrEmpty(token))
            ctx.Token = token;
        return Task.CompletedTask;
    }
};
```
