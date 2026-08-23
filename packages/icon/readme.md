# @jointhedots/icon

Système d'icônes composable pour les applications Join.The.Dots. Une icône est
décrite par une **chaîne de nom** (`name`) qui combine des éléments issus de
collections enregistrées, avec options et positionnement — rendu via un unique
composant React `Icon`.

## Installation

```bash
pnpm add @jointhedots/icon
```

Peer dependency : `react` ≥ 18.2.0. Le package tire lui-même les librairies
d'assets des collections (bootstrap-icons, font-awesome, flag-icons,
Salesforce Lightning Design System).

## Usage

```tsx
import Icon from "@jointhedots/icon"
import "@jointhedots/icon/bootstrap"

<Icon name="bi:house-door-fill[primary]|bi:exclamation-triangle-fill[badge,error]" />
```

Le CSS du cœur du système (boîte unitaire, pastilles) est injecté
automatiquement au chargement du module — aucun import de stylesheet à gérer.
Les styles et sprites des collections sont résolus par le bundler de
l'application au moment où elle importe l'export dédié.

## Exports

| Import | Effet |
| --- | --- |
| `@jointhedots/icon` | Composant `Icon`, types (`IconProps`, `IconSize`, `IconCollection`…), classes de collection génériques, collections intégrées (`avatar`, `badge`, `data`, `blank`, `?`) |
| `@jointhedots/icon/bootstrap` | Enregistre la collection `bi` (bootstrap-icons, CSS inclus) |
| `@jointhedots/icon/font-awesome` | Enregistre la collection `fa` (Font Awesome 4, CSS inclus) |
| `@jointhedots/icon/flag-icons` | Enregistre la collection `flag` (flag-icons, CSS inclus) |
| `@jointhedots/icon/salesforce` | Enregistre les collections `utility`, `standard`, `custom`, `action`, `doctype` (sprites SVG Salesforce, classes `slds-icon*` incluses) |

Chaque export de collection s'importe **pour son effet de bord**
(`import "@jointhedots/icon/bootstrap"`) : la collection est enregistrée dans le
registre global sous son namespace, et ses assets (CSS / sprites) sont chargés.
Le package est `singleton` de fait : une seule instance du registre existe à
l'exécution.

## Dépendances

- `@jointhedots/theme` — contrat d'éclairage (clair/sombre) et thème global.
- `react` en peer dependency (≥ 18.2.0).

## Usage avancé

La syntaxe complète des noms d'icônes (empilement, drapeaux, variables CSS),
l'écriture de collections personnalisées et le comportement au thème sont
documentés dans [SKILL.md](./SKILL.md).
