# jointhedots-ui

Monorepo des packages UI Join.The.Dots. Il contient pour l'instant :

- **@jointhedots/theme** (`packages/theme`) — thème global clair/sombre,
  contexte React et styles de base.
- **@jointhedots/icon** (`packages/icon`) — système d'icônes composable :
  composant `Icon`, langage de nommage, registre de collections et exports
  dédiés par collection (bootstrap, font-awesome, flag-icons, salesforce).

## Développement

```bash
pnpm install
pnpm typecheck   # génère les styles, puis tsc sur chaque package
pnpm build       # styles + vite build (theme puis icon)
```

Prérequis : node ≥ 20, pnpm ≥ 10.

## Publication

Chaque package est publié sur npm depuis son dossier (`files: ["dist"]`) :

```bash
pnpm publish              # build + pnpm publish --access public (theme puis icon)
pnpm publish -- --dry     # simulation sans publier
```

Le script refuse de publier une version `0.0.0` : bump la version dans le
`package.json` du package concerné avant de lancer.

## Documentation

- Architecture et concepts : [docs/icon.spec.md](./docs/icon.spec.md)
- Usage des icônes : [packages/icon/readme.md](./packages/icon/readme.md) et
  [packages/icon/SKILL.md](./packages/icon/SKILL.md)
