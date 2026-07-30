# Plan d’implémentation – petricator

## Objectif
Rendre le flux de draft backend-confirmé, afin que l’interface ne considère la draft comme réussie qu’après validation complète par les services backend.

## Périmètre
- Refactoriser l’orchestration NgRx autour d’un seul chemin de succès.
- Supprimer la logique optimiste qui valide la draft trop tôt.
- Introduire des états explicites request/success/error pour la draft.
- Gérer les erreurs partielles et les retries côté UI.

## Étapes
1. Revoir l’effet de création de peblob pour n’émettre le succès que si la chaîne backend est validée.
2. Clarifier les actions NgRx pour distinguer demande, succès et échec.
3. Bloquer l’affichage de “draft réussie” tant que le backend n’a pas confirmé.
4. Ajouter un message utilisateur pour les erreurs de validation ou de réseau.
5. Couvrir les scénarios success, failure, retry et double soumission.

## Critères d’acceptation
- La draft n’est affichée comme réussie que quand le backend l’a validée.
- Les erreurs sont visibles sans état local erroné.
- Les tests couvrent les chemins nominal et de panne.

## Risques
- Risque de confusion entre état local et état backend.
- Risque de doublons si l’utilisateur resoumet plusieurs fois.
