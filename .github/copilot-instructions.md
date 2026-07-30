# Instructions Projet Copilot

Ce fichier est charge comme contexte global pour ce depot.

## Sources de reference

- Regles produit et metier: `docs/context/domain.md`
- Architecture et frontieres: `docs/context/architecture.md`
- Conventions de code et attentes de test: `docs/context/conventions.md`
- Notes specifiques aux features: `docs/context/features/*`

En cas de conflit, suivre cet ordre:
1. Derniere demande utilisateur dans le chat
2. Ce fichier
3. Les fichiers dans `docs/context/`
4. Les conventions de code deja en place dans la zone modifiee

## Regles de travail pour cette codebase

- Garder des changements petits et cibles.
- Preserver les patterns Angular deja utilises dans la feature modifiee.
- Preferer des API fortement typees et eviter `any` sauf justification.
- Ajouter ou mettre a jour les tests quand le comportement change.
- Ne pas refactorer des fichiers non lies dans le meme changement.

## Perimetre multi-repo autorise

Quand la demande utilisateur le requiert, les modifications peuvent etre appliquees de bout en bout sur:

- `../petricator`
- `../papi-user`
- `../papi-peblob`

Conserver des changements cibles et coherents entre contrats API, services frontend et tests associes.

## Attentes sur les reponses

- Expliquer ce qui a change et pourquoi.
- Signaler les risques et les manques de couverture de test.
- Quand les exigences sont floues, demander les details metier manquants.
