# AGENT.md — Méthodologie de packaging

Ce document décrit comment ce repository empaquette et publie ses packages
UI. Il sert de référence à tout agent (humain ou LLM) qui ajoute, modifie ou
publie un package ici.

## 1. Principes

- **Un package = une responsabilité UI** (icônes, thème, boutons, champs,
  layout…), versionné et publiable indépendamment sur npm.
- **Le graphe de dépendances est acyclique et fixe** :
  `theme → icon → button → layout`, `icon → input`. Tout nouveau package
  déclare ses dépendances vers les packages existants avec une plage de
  version littérale (`^x.y.z`) — jamais `workspace:*` dans un package
  publié (un `file:` link externe ne saurait pas le résoudre).
- **Zéro legacy** : un déplacement de composant est total — sources,
  manifestes, scripts, docs, playground — dans la même tâche.
- **Pas de side-effect CSS dans le code des packages** : les styles propres
  sont compilés au build et injectés au runtime ; les styles des libs
  tierces restent des imports littéraux externaux (voir §4).

## 2. Layout du repository

```
packages/<name>/     package publié (@jointhedots/<name>)
   src/              sources (index.ts = entrée unique ou exports multiples)
   src/generated/    styles.ts généré (gitignoré, produit par scripts/styles.mts)
   package.json      manifeste npm (exports map, files: [dist], sideEffects: true)
   tsconfig.json     étend tsconfig.base.json + paths vers les src frères
   vite.config.ts    build library mode
   README.md         installation + usage basique
   SKILL.md          contrat détaillé et usages avancés
playground/          application de démonstration (privée, non publiée)
scripts/             scripts tsx (styles, build, typecheck, publish, clean, dev)
docs/                specs conceptuelles (*.spec.md)
```

## 3. Tooling

pnpm workspace + **catalog** (pnpm-workspace.yaml) pour les versions
partagées (react, vite, typescript…). TypeScript ~5.9 (l'écosystème dts
n'est pas prêt pour TS 7 natif). Scripts racine en **tsx** avec top-level
await — chaque script connaît l'ordre des packages (dépendances d'abord) :

```
pnpm typecheck   # styles.mts → tsc --noEmit par package + playground
pnpm build       # styles.mts → vite build par package + playground
pnpm dev         # styles.mts → vite serve du playground (sources liées)
pnpm publish     # build → pnpm publish par package (garde-fous §6)
pnpm clean       # dist + src/generated
```

## 4. Le pipeline des styles (le cœur de la méthode)

Les packages ne contiennent **aucun `import "./x.scss"`** :

1. `scripts/styles.mts` compile chaque cascade scss d'un package en une
   seule chaîne CSS minifiée et l'écrit dans `src/generated/styles.ts`
   (`const css: string = …`, type explicite pour un .d.ts propre).
2. Le `index.ts` du package fait `injectStyles(styles, "jtd-<pkg>-styles")` :
   injection runtime idempotente (balise `<style id=…>`, no-op en SSR, no-op
   si déjà injectée).

Bénéfices : le consumer n'a aucun stylesheet à importer ; l'ordre de la
cascade est garanti par le build ; le package reste un module JS pur.

Les styles des **libs tierces** suivent la règle opposée : ils restent des
imports littéraux dans le code (ex. la feuille SLDS, importée par le seul
export `salesforce` d'icon car elle porte les couleurs des sprites ; polices
bootstrap-icons / font-awesome / flag-icons), marqués **externals** au build.
C'est le bundler de l'application qui les résout depuis son node_modules et
émet les assets — pas le package. Règle : *styles du package = injectés ;
styles d'une dépendance = import littéral externe*.

## 5. Convention vite.config (library mode)

```ts
lib: { entry: { index: … } }          // une entrée par sous-chemin exporté
formats: ["es"]
external: react, @jointhedots/*, react-toastify, @salesforce/*, *.css, *.svg
output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" }
plugins: [dts({ entryRoot: "src", outDir: "dist" })]
```

La exports map du package.json pointe chaque sous-chemin vers
`./dist/<chemin>.js` + `types` vers le `.d.ts` correspondant (le plugin dts
réplique l'arborescence src). `sideEffects: true` obligatoire : les entrées
d'auto-enregistrement (collections d'icônes) vivent d'import side-effect.

## 6. Publication

`scripts/publish.mts` applique trois garde-fous puis publie dans l'ordre
des dépendances :

1. refuse une version `0.0.0` ;
2. vérifie la cohérence croisée : chaque dépendance `@jointhedots/*` d'un
   package doit couvrir la version réelle du package dont elle dépend ;
3. **saute** tout package dont `name@version` existe déjà sur le registry
   (idempotence, publication reprise après échec OTP).

Versionner : bump la version du package concerné, mettre à jour la plage des
packages qui en dépendent, `pnpm publish` (OTP requis si 2FA). Ne jamais
publier depuis un état non buildé — le script build d'abord.

## 7. Consommation externe

Une application consomme les packages publiés par plages npm normales. En
développement croisé avec ce repo, elle utilise des **overrides** dans son
`pnpm-workspace.yaml` (pas dans package.json — jamais de chemin local ne
doit fuiter dans un manifeste publié) :

```yaml
overrides:
   "@jointhedots/icon": "file:../../../jointhedots-ui/packages/icon"
```

## 8. Ajouter un package — check-list

1. `packages/<name>/` : sources (une entrée `index.ts` + exports dédiés si
   collections), `package.json` (name `@jointhedots/<name>`, exports map,
   `files: [dist]`, `sideEffects: true`, deps littérales, peer react),
   `tsconfig.json` (paths vers src des frères), `vite.config.ts` (modèle §5).
2. Ajouter la cascade scss du package dans `scripts/styles.mts` et faire
   appel à `injectStyles` dans son index.
3. Inscrire le package dans les listes de `build.mts`, `typecheck.mts`,
   `clean.mts` et `publish.mts` — **à sa place dans l'ordre de dépendances**.
4. Ajouter l'override `link:` dans `pnpm-workspace.yaml` racine si d'autres
   packages du repo le consomment.
5. `README.md` (installation, usage) + `SKILL.md` (contrat complet, usages
   avancés, aide-mémoire).
6. Une démo dans `playground/` — c'est la vitrine et le test d'intégration
   des packages entre eux.
7. Vérifier : `pnpm typecheck && pnpm build`, puis `pnpm publish -- --dry`.

## 9. Documentation — qui dit quoi

| Document | Rôle |
| --- | --- |
| `README.md` (package) | vendre et démarrer : installation, usage minimal |
| `SKILL.md` (package) | mémoire d'expertise : contrat complet, usages avancés, pièges |
| `docs/*.spec.md` | spec conceptuelle (FR) : concepts, invariants, flux — jamais de code |
| `playground/` | démonstration exécutable et exemples vivants |
| `AGENT.md` | cette méthodologie |

Un changement de comportement d'un package met à jour son SKILL.md dans le
même flux ; une doc qui contredit le code est un défaut.
