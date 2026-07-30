# Conventions

## TypeScript et Angular

- Garder un typage strict.
- `any` interdit sauf dans les tests.
- Garder les composants focalises sur la logique de vue.
- Deplacer la logique metier vers des services, stores ou helpers.

## Styling

- Reutiliser la structure de styles existante de `src/app/styles/`.
- Garder des selecteurs simples et locaux.

## Tests

- Ajouter ou mettre a jour les tests unitaires lors de changements de comportement.
- Couvrir le chemin nominal, le chemin d'erreur et un cas limite.
- Reutiliser les mocks/helpers existants avant d'en creer de nouveaux.

## Checklist de pull request

1. Le comportement est documente par des tests.
2. Aucun refactor non lie.
3. Les contrats publics sont inchanges ou explicitement documentes.
4. Une note de risque et rollback est incluse dans la description de PR.
