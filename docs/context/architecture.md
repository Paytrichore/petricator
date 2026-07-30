# Architecture

## Vue d'ensemble

Le systeme est compose de trois depots complementaires:

- `petricator`: frontend Angular (UI, orchestration metier cote client, etat local)
- `papi-user`: API NestJS pour authentification et statut utilisateur (DLA, points d'action, draft)
- `papi-peblob`: API NestJS pour la gestion des peblobs (creation, lecture, mise a jour)

Le frontend consomme ces APIs via HTTP JSON avec JWT Bearer dans l'entete `Authorization`.

## Perimetre multi-repo

Perimetre d'intervention autorise pour les evolutions techniques liees a cette architecture:

- Repo frontend: `petricator`
- Repo backend auth/utilisateur: `papi-user`
- Repo backend peblob: `papi-peblob`

Objectif: permettre des changements coherents de bout en bout quand un contrat API ou un flux metier evolue.

## Modules de haut niveau (frontend)

- `src/app/core/`
	- Stores NgRx (app, user, peblob)
	- Intercepteur HTTP (`Authorization: Bearer <token>`)
- `src/app/features/`
	- Ecrans metier (auth, home, collection, main)
- `src/app/services/`
	- Adaptateurs HTTP vers APIs externes
- `src/app/shared/`
	- Composants, interfaces, pipes et utilitaires reutilisables

## Flux de donnees

1. L'utilisateur declenche une action UI (login, signup, draft, creation peblob).
2. Un action NgRx est emise.
3. Un effect NgRx appelle le service HTTP cible.
4. Le backend repond avec un payload metier.
5. L'effect emet une action de succes/echec et met a jour le store.
6. Le state est reflechi dans l'UI.

Notes:

- Au login/signup, le token JWT est persiste en localStorage puis reutilise par l'intercepteur.
- Les peblobs utilisateur sont caches localement par cle `peblobs_<userId>` avec revalidation reseau.

## Gestion d'etat

- Source de verite UI: store NgRx (`app`, `user`, `peblob`).
- Persistance locale:
	- `access_token`
	- `user`
	- cache peblobs par utilisateur
- Mutation du state:
	- uniquement via actions/effects/reducers
	- les composants ne portent pas la logique metier profonde

## APIs consommees

### Environnements

- Dev:
	- `userApiUrl = https://papi-user-dev-812288085862.us-central1.run.app`
	- `peblobApiUrl = https://papi-peblob-dev-812288085862.us-central1.run.app`
- Prod:
	- `userApiUrl = https://papi-user-812288085862.us-central1.run.app`
	- `peblobApiUrl = https://papi-peblob-812288085862.us-central1.run.app`

### API `papi-user` (consommee par `petricator`)

Routes utilisees par le frontend:

- `POST /auth/register`
	- body: `{ username, email, password }`
	- retour: `{ access_token, user }`
	- erreur notable: `400 EMAIL_ALREADY_IN_USE`
- `POST /auth/login`
	- body: `{ email, password }`
	- retour: `{ access_token, userStatus }`
	- erreur notable: `401 INVALID_CREDENTIALS`
- `GET /users/me` (JWT requis)
	- retour: statut utilisateur complet (points, drafted, nextDLA, timeUntilNextDLA)
- `POST /users/use-points` (JWT requis)
	- body: `{ points }`
	- effet: decremente les points d'action
- `POST /users/draft` (JWT requis)
	- body: `{}`
	- effet: consomme la draft de la DLA courante

Routes exposees mais non utilisees dans le front actuel:

- `GET /auth/google`
- `GET /auth/google/redirect`
- `GET /users/status`

Swagger:

- `GET /api` sur le service `papi-user`

### API `papi-peblob` (consommee par `petricator`)

Routes utilisees par le frontend:

- `POST /peblob`
	- body: `{ userId, structure }`
	- `structure` est une matrice carree de composantes RGB
- `GET /peblob/user/:userId`
	- retour: liste des peblobs de l'utilisateur

Routes utiles mais non branchees dans le front actuel:

- `PATCH /peblob/:id`
- `PATCH /peblob/:id/ptiblob/:row/:col`
- `DELETE /peblob/:id`
- `GET /peblob/public`
- `DELETE /peblob/user/:userId/all`

Swagger:

- `GET /api` sur le service `papi-peblob`

## Frontieres API et contrats

- Format transport: JSON sur HTTP(S)
- Authentification:
	- JWT Bearer pour les routes protegees
	- token lu depuis localStorage par intercepteur global
- CORS:
	- `localhost:*` autorise
	- domaines Cloud Run dev/prod autorises

### Mapping d'erreurs attendu cote frontend

- `400` erreurs metier/validation (ex: email deja utilise)
- `401` token invalide ou credentials invalides -> logout/retour login
- `404` ressource inexistante (id peblob)
- `5xx` indisponibilite backend -> message utilisateur + retry manuel

## Incoherences connues a surveiller

- Le frontend appelle `GET /peblob?ids=...` via `loadPeblobsByIds`, mais cette route n'est pas implementee dans `papi-peblob`.
- Le frontend appelle `PATCH /users/:id` dans un service utilisateur, mais cette route n'est pas exposee par le controleur `users` de `papi-user`.
- Dans `papi-peblob`, certaines methodes melangent stockage Mongo (`peblobModel`) et tableau en memoire (`this.peblobs`), ce qui peut produire des comportements divergents selon la route.

## Regles de dependance

- `features/*` depend de `core`, `services`, `shared`.
- `services/*` encapsule les appels HTTP et ne depend pas des composants UI.
- `core/stores/*` centralise les effets et reducers; eviter la logique HTTP dans les composants.
- Toute evolution de contrat API doit etre versionnee implicitement par changement coordonne sur:
	- DTO/backend
	- service frontend
	- effects/reducers impacts
	- tests associes
