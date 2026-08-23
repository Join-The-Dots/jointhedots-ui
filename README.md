# jointhedots-ui

Monorepo des packages UI Join.The.Dots, construits avec Vite library mode et
publiés sur npm :

- **@jointhedots/theme** — thème global clair/sombre, contexte React, tokens
  de design `--jtd-*` et styles de base.
- **@jointhedots/icon** — système d'icônes composable : composant `Icon`,
  langage de nommage, registre de collections et exports dédiés
  (bootstrap, font-awesome, flag-icons, salesforce).
- **@jointhedots/button** — boutons : `Button` (variants, icônes,
  tooltip) et `ButtonIcon` (pastille d'action, survol alternatif).
- **@jointhedots/layout** — panneaux et docks (`openDialog`,
  `openContextualMenu`, `createFloatingDock`), menus, stacks et items.
- **@jointhedots/input** — champs pilotés : `InputData` (schéma JSON,
  tooling et déroulant enum sur le modèle d'items de layout) et
  `TextInputSchema`, le constructeur du champ texte.

## Développement

```bash
pnpm install
pnpm typecheck   # génère les styles, puis tsc sur chaque package + playground
pnpm build       # styles + vite build (packages puis playground)
pnpm dev         # serve le playground sur les sources des packages
```

Prérequis : node ≥ 20, pnpm ≥ 10. Le playground (`playground/`) est la
vitrine exécutable de tous les packages — private, jamais publié.

## Publication

Chaque package est publié sur npm depuis son dossier (`files: ["dist"]`) :

```bash
pnpm run publish          # build + publish, dans l'ordre des dépendances
pnpm run publish --dry    # plan de versions, sans rien écrire ni publier
```

Le versionnement est automatique : une version déjà présente sur le registry
est bumpée (patch par défaut, `--minor` / `--major` pour tout le run), une
version inédite est publiée telle quelle, et les plages `@jointhedots/*` des
packages dépendants suivent. Le script refuse une version `0.0.0` et saute
les versions déjà publiées — un run interrompu (ex. échec OTP) peut être
relancé tel quel.

## Documentation

- Méthodologie de packaging : [AGENT.md](./AGENT.md)
- Architecture et concepts : [docs/](./docs/)
- Par package : `README.md` (démarrage) et `SKILL.md` (usages avancés)
- Vitrine exécutable : `pnpm dev`
