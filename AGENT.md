# AGENT.md — Méthodologie de packaging

Ce document décrit comment ce repository empaquette et publie ses packages
UI. Il sert de référence à tout agent (humain ou LLM) qui ajoute, modifie ou
publie un package ici.

## 1. Principes

- **Un package = une responsabilité UI** (icônes, thème, boutons, champs,
  layout…), versionné et publiable indépendamment sur npm.
- **Le graphe de dépendances est acyclique et fixe** :
  `theme → icon → button → layout → input` (input dépend d'icon et de
  layout). Tout nouveau package déclare ses dépendances vers les packages
  existants avec une plage de version littérale (`^x.y.z`) — jamais
  `workspace:*` dans un package publié (un lien externe ne saurait pas le
  résoudre).
- **Les sources sont le point d'entrée** : dans le repo et pour tout
  consumer lié, Vite et TypeScript travaillent directement sur les sources
  TypeScript ; seul le manifeste publié pointe vers le build (§5).
- **Zéro legacy** : un déplacement de composant est total — sources,
  manifestes, scripts, docs, playground — dans la même tâche.
- **Pas de side-effect CSS dans le code des packages** : les styles propres
  sont importés en chaîne et injectés au runtime ; les styles des libs
  tierces restent des imports littéraux externes (voir §4).

## 2. Layout du repository

```
packages/<name>/     package publié (@jointhedots/<name>)
   src/              sources TypeScript + feuilles CSS natives du package
   src/index.ts      entrée (index.tsx pour theme) ; icon : un index.ts par collection
   src/inject-styles.ts  injection runtime des styles (copie locale par package)
   package.json      exports → src, publishConfig.exports → dist, files: [dist]
   tsconfig.json     étend tsconfig.base.json, include: [src]
   vite.config.ts    build library mode
   README.md         installation + usage minimal
   SKILL.md          contrat détaillé et usages avancés
playground/          application de démonstration (privée, non publiée)
scripts/             scripts tsx (build, typecheck, publish, clean, dev)
docs/                specs conceptuelles (*.spec.md)
```

## 3. Tooling

pnpm workspace + **catalog** (pnpm-workspace.yaml) pour les versions
partagées (react, react-dom, @types/react, @types/react-dom, vite,
vite-plugin-dts, typescript, tsx). TypeScript ~5.9 (l'écosystème dts n'est
pas prêt pour TS 7 natif). Les `overrides` du `pnpm-workspace.yaml` racine
lient chaque `@jointhedots/*` à son dossier (`link:./packages/<name>`) : les
packages et le playground se résolvent entre eux par leurs `exports`, sans
alias Vite ni `paths` TypeScript.

`tsconfig.base.json` : `moduleResolution: bundler`, `strict`,
`noUncheckedIndexedAccess`, `noImplicitOverride`,
`allowImportingTsExtensions` (les imports relatifs portent leur extension
`.ts`/`.tsx` explicite) et `types: ["vite/client"]` (typage des imports
`?inline`). Un consumer qui vérifie ces sources avec des réglages stricts
(ex. Deno) les accepte telles quelles.

Scripts racine en **tsx** avec top-level await — chaque script connaît
l'ordre des packages (dépendances d'abord) :

```
pnpm typecheck       # tsc --noEmit par package + playground
pnpm build           # vite build par package + playground
pnpm dev             # vite serve du playground, directement sur les sources
pnpm run publish     # build → bump auto + publish par package (§6)
pnpm clean           # dist de chaque package + playground
```

## 4. Les styles (le cœur de la méthode)

Chaque package écrit ses styles en **CSS natif** (imbrication native
comprise) et les importe en chaîne — jamais en feuille :

```ts
import styles from "./Button.scss?inline"
injectStyles(styles, "jtd-button-styles")
```

1. Vite compile l'import `?inline` en une chaîne CSS, aussi bien au build
   library du package que lorsque le Vite d'un consumer sert les sources.
   Aucune étape de génération, aucun préprocesseur.
2. `injectStyles(css, id)` injecte la chaîne au chargement du module :
   balise `<style id=…>` idempotente, no-op hors navigateur, no-op si déjà
   injectée. Un package aux styles multiples les concatène dans l'ordre de
   cascade voulu avant l'injection (layout : panneaux, menus, items).

Bénéfices : le consumer n'a aucun stylesheet à importer ; l'ordre de la
cascade est fixé par le code ; le package reste un module JS pur.

Toute couleur, ombre et rayon de base des gabarits lit un token `--jtd-*`
de @jointhedots/theme (voir docs/theme.spec.md) : une application remappe
les tokens une seule fois.

Les styles des **libs tierces** suivent la règle opposée : ils restent des
imports littéraux dans le code (ex. la feuille SLDS, importée par le seul
export `salesforce` d'icon car elle porte les couleurs des sprites ; polices
bootstrap-icons / font-awesome / flag-icons), marqués **externals** au build.
C'est le bundler de l'application qui les résout depuis son node_modules et
émet les assets — pas le package. Règle : *styles du package = chaîne
injectée ; styles d'une dépendance = import littéral externe*.

## 5. Manifeste et build (library mode)

```ts
lib: { entry: { index: … } }          // une entrée par sous-chemin exporté
formats: ["es"]
external: react(-dom), @jointhedots/*, react-toastify (layout),
          *.css et *.svg des assets tiers (icon, input, layout)
output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" }
plugins: [dts({ entryRoot: "src", outDir: "dist" })]
```

Le `package.json` porte deux exports maps :

- `exports` pointe chaque sous-chemin vers sa source (`./src/index.ts` ;
  icon : `./src/<collection>/index.ts`) — c'est ce que résolvent le
  workspace et tout consumer lié ;
- `publishConfig.exports` mappe les mêmes sous-chemins vers le build
  (`types` → `./dist/<chemin>/index.d.ts`, `import` → `./dist/<entrée>.js`) ;
  `pnpm publish` l'applique, donc le manifeste publié pointe vers `dist`.

`files: ["dist"]` (icon y ajoute son `SKILL.md`). `sideEffects: true`
obligatoire : l'injection des styles et les entrées d'auto-enregistrement
(collections d'icônes) vivent d'effets de bord à l'import.

## 6. Publication

`scripts/publish.mts` (`pnpm run publish`) construit un plan de versions puis
publie dans l'ordre des dépendances :

1. refuse une version `0.0.0` (manifeste non finalisé) ;
2. **bump automatique** : toute version déjà présente sur le registry est
   bumpée — patch par défaut, `--minor` ou `--major` pour tout le run ; une
   version inédite est publiée telle quelle ;
3. réécrit les plages des dépendances `@jointhedots/*` de chaque package
   vers `^<version cible>` du package dont elles dépendent ;
4. **saute** tout `name@version` déjà sur le registry (idempotence, reprise
   après un échec OTP).

`--dry` affiche le plan (`from → to` par package) sans rien écrire ni
publier. Après un run réel, committer les `package.json` bumpés. Ne jamais
publier depuis un état non buildé — le script build d'abord.

## 7. Consommation externe

Une application consomme les packages publiés par plages npm normales :
elle reçoit le build (`dist`).

En développement croisé avec ce repo, elle **lie les dossiers des
packages** : par exemple des dépendances npm `file:` déclarées une seule
fois à la racine de son workspace et imposées à ses workspaces par
`overrides` (jamais de chemin local dans un manifeste publié) :

```json
"overrides": {
   "@jointhedots/icon": "file:../jointhedots-ui/packages/icon"
}
```

Le lien résout l'`exports` du package, donc ses sources : le Vite de
l'application les compile (TypeScript, imports `?inline`) — aucun build du
repo n'est requis. Comme les sources liées résolvent `react` depuis le
node_modules de ce repo, le Vite de l'application doit imposer sa propre
copie :

```ts
resolve: { dedupe: ["react", "react-dom"] }
```

Sans cette déduplication, deux instances de React coexistent et les hooks
échouent. Un consumer qui vérifie les types de ces sources doit accepter
les imports à extension `.ts`/`.tsx` et les types `vite/client`.

## 8. Ajouter un package — check-list

1. `packages/<name>/` : sources (une entrée `index.ts` + exports dédiés si
   collections, imports relatifs avec extension `.ts`/`.tsx`), styles en
   CSS natif importés en `?inline` + copie de `inject-styles.ts` appelée
   dans l'index, `package.json` (name `@jointhedots/<name>`, `exports` vers
   `src`, `publishConfig.exports` vers `dist`, `files: [dist]`,
   `sideEffects: true`, deps littérales, peer react), `tsconfig.json`
   (étend la base, `include: [src]`), `vite.config.ts` (modèle §5).
2. Inscrire le package dans les listes de `build.mts`, `typecheck.mts`,
   `clean.mts` et `publish.mts` — **à sa place dans l'ordre de dépendances**.
3. Ajouter l'override `link:` dans `pnpm-workspace.yaml` racine.
4. `README.md` (installation, usage) + `SKILL.md` (contrat complet, usages
   avancés, aide-mémoire).
5. Une démo dans `playground/` — c'est la vitrine et le test d'intégration
   des packages entre eux.
6. Vérifier : `pnpm typecheck && pnpm build`, puis `pnpm run publish --dry`.

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
