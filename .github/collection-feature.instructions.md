---
applyTo: "src/app/features/collection/**"
---

Contexte de la feature Collection pour les assistants IA.

- Garder toutes les regles metier specifiques a Collection dans `docs/context/features/collection.md`.
- Preferer la reutilisation des services et des patterns de store deja presents dans cette feature.
- Garder des templates de composants legers; deplacer la logique non triviale vers des services/helpers quand possible.
- Pour tout changement de comportement, mettre a jour ou ajouter des specs sous `src/app/features/collection/**`.
