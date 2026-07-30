# Plan d’implémentation – papi-user

## Objectif
Ajouter un endpoint entrant pour recevoir les événements de draft depuis papi-peblob, valider leur signature et mettre à jour l’état utilisateur de façon idempotente.

## Périmètre
- Créer un endpoint dédié pour recevoir les événements de draft.
- Valider la signature HMAC et la fenêtre temporelle.
- Appliquer la transition draft une seule fois par eventId.
- Diffuser un événement temps réel au front après traitement.

## Étapes
1. Ajouter une route webhook pour recevoir les événements de peblob créé depuis draft.
2. Valider la signature et rejeter les requêtes trop anciennes.
3. Implémenter la déduplication par eventId.
4. Mettre à jour l’état draft de l’utilisateur et conserver un minimum d’audit.
5. Envoyer une notification WebSocket/SSE au client concerné.
6. Ajouter des tests sur signature, idempotence, timestamps invalides et transition d’état.

## Critères d’acceptation
- Seuls les événements signés et valides sont acceptés.
- Les doublons ne provoquent pas de doublon de statut.
- L’état utilisateur reste cohérent après refresh et reconnexion.

## Risques
- Réception en double.
- Réordonancement des messages.
- Client non connecté au moment du push.
