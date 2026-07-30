# Plan d’implémentation – papi-peblob

## Objectif
Faire en sorte que la création d’un peblob déclenche un événement signé vers papi-user et ne retourne un succès au front que si le traitement downstream est confirmé.

## Périmètre
- Persister le peblob normalement.
- Construire un payload d’événement avec eventId, eventType, correlationId, userId, peblobId et timestamp.
- Envoyer un webhook signé vers papi-user avec gestion des retries.
- Définir une politique de compensation si la mise à jour utilisateur échoue.

## Étapes
1. Ajouter la génération de l’événement après la persistance du peblob.
2. Envoyer l’événement à papi-user via un webhook signé.
3. Mettre en place un retry court pour les erreurs temporaires.
4. Ajouter des logs corrélés par correlationId.
5. Ajouter des tests pour succès, retry, timeout et signature.

## Critères d’acceptation
- La création de peblob n’est réussie que si papi-user accepte et traite l’événement.
- Les événements dupliqués ne créent pas d’effets secondaires.
- Le format d’événement reste stable pour une future migration vers un broker.

## Risques
- Échec intermittent du webhook.
- Traitement partiel si papi-user n’est pas disponible.

Contrat webhook à utiliser côté papi-peblob
Headers attendus:

x-webhook-signature: sha256=<hex>
x-webhook-timestamp: <epoch_ms>
Body attendu:

eventType: peblob-created-from-draft
eventId: UUID
occurredAt: ISO date
userId: string
peblobId: string
correlationId: string
Signature à calculer:

HMAC SHA-256 sur: ${timestamp}.${rawBody}
secret: WEBHOOK_SHARED_SECRET
Variables d’env:

WEBHOOK_SHARED_SECRET (obligatoire)
WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS (optionnel, défaut 300)