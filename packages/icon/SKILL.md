# SKILL — Usage avancé des icônes @jointhedots/icon

Ce document explique le modèle complet : le langage de nommage, les collections,
le comportement thématique, et l'écriture de collections personnalisées.

## 1. Le langage de nommage

Le prop `name` du composant `Icon` est un mini-langage composé de trois briques :

```
[options_base]élément|élément|…
```

où chaque `élément` vaut :

```
[namespace:]nom_du_glyph[options]
```

| Brique | Rôle | Exemple |
| --- | --- | --- |
| `namespace` | collection à interroger ; si absent, le nom nu désigne lui-même une collection intégrée (`blank`, `avatar:jean` ↔ `jean` via `getIconName`) | `bi`, `standard`, `avatar` |
| `nom` | glyph dans la collection | `house-door-fill`, `account` |
| `\|` | empile plusieurs éléments en calques absolus superposés (même boîte 1em) | `bi:bell\|label:3` |
| `[options]` | drapeaux et variables CSS, sur un élément ou sur toute la base | `[primary]`, `[badge,error]` |

### 1.1 Drapeaux

Disponibles dans toute option `[…]` :

| Drapeau | Effet |
| --- | --- |
| `error` / `warn` / `info` / `primary` / `secondary` / `success` | force `color` et `--color` (rouge, or, gris, #36f, #666, #6d0) |
| `badge` | réduit l'élément (0.6em) et le colle au coin haut-droit — usage typique : pastille de compteur ou d'état sur un glyph principal (souvent combiné à l'élément `label:`) |
| `RT` / `RB` / `LT` / `LB` | comme `badge` mais haut-droit / bas-droit / haut-gauche / bas-gauche |

Un drapeau inconnu est signalé en console (`invalid flag`) et ignoré.

### 1.2 Variables CSS

Toute paire `clé=valeur` dans `[…]` devient une variable CSS sur l'élément :
`[stroke=red]` → `--stroke: red`. C'est le canal pour paramétrer une collection
qui s'appuie sur des `var(--…)` dans son rendu.

### 1.3 Options de base

Placées en tête (`[error]bi:house`), les options s'appliquent au conteneur
(`div.jtd-icon`) plutôt qu'au calque. Combiner `[badge]` en base n'a pas de
sens (le conteneur est la boîte de référence) ; les drapeaux de couleur et les
variables y sont pertinents.

## 2. Collections

### 2.1 Collections intégrées (toujours enregistrées)

| Namespace | Rendu |
| --- | --- |
| `blank` | calque vide (1em) — cible de `undefined`/`null` |
| `?` | glyph d'erreur hachuré rouge — namespace inconnu ou nom invalide |
| `data` | image par URL relative (`data:images/foo.png` → `url(images/foo.png)`) |
| `avatar` | pastille circulaire colorée déterministe (hash du nom → teinte HSL), initiales (2 premières lettres significatives) |
| `label` | pastille grise affichant la valeur brute (`label:3`, `label:new`) |

Un `name` numérique est automatiquement converti en `label:<valeur>` ; une
valeur non-chaîne invalide devient `error:typeof <t>`.

### 2.2 Exports de collections dédiées

Chaque export enregistre son/ses namespaces et charge ses assets :

| Export | Namespaces | Source |
| --- | --- | --- |
| `@jointhedots/icon/bootstrap` | `bi` | police bootstrap-icons |
| `@jointhedots/icon/font-awesome` | `fa` | police Font Awesome 4 |
| `@jointhedots/icon/flag-icons` | `flag` | police flag-icons (`flag:fr`) |
| `@jointhedots/icon/salesforce` | `utility`, `standard`, `custom`, `action`, `doctype` | sprites SVG Salesforce Lightning |

L'export salesforce applique les classes SLDS attendues
(`slds-icon slds-icon-standard-…`, etc.) et convertit `_` en `-` dans les noms
(`salesforce_page` → `slds-icon-utility-salesforce-page`). L'export importe
lui-même la feuille SLDS — c'est le seul point du repository où elle est
chargée — car elle porte les couleurs des sprites ; l'application n'a rien à
configurer.

Import pour effet de bord, une seule fois au démarrage de l'application :

```tsx
import "@jointhedots/icon/bootstrap"
import "@jointhedots/icon/salesforce"
```

## 3. Thème et contraste

Le composant lit le thème via le contexte de `@jointhedots/theme` :

- une collection peut rendre différemment en clair/sombre (variantes light/dark
  de `IconSVGInnerCollection` et `IconSVGCollection`) ;
- le prop `inverse` bascule sur `theme.contrastTheme` : l'icône rend comme sur
  le fond opposé (utile sur bouton coloré, badge sélectionné…) ;
- un `LocalTheme` ancêtre surcharge le thème global pour un sous-arbre.

## 4. Tailles et gabarit

- `size` accepte un alias (`xs` 0.8em, `sm` 1em, `md` 1.5em, `lg` 2em — défaut
  `sm`) ou une valeur brute (`"3.2em"`), appliquée en `font-size` : tous les
  calques et la boîte suivent (dimensions en `em`).
- La boîte fait toujours 1em × 1em (`div.jtd-icon`, position relative) ; les
  calques sont absolus et remplissent la boîte.
- Le CSS du gabarit est auto-injecté au premier chargement du module (balise
  `<style id="jtd-icon-styles">`, idempotent, sans effet en SSR).
- `title`, `className`, `style`, `onClick` sont transmis au conteneur ;
  `className`/`style` fusionnent avec ceux calculés par le parseur.

## 5. Performance

- Chaque chaîne `name` est parsée une seule fois puis mémoïsée (cache par nom).
- `IconSVGInnerCollection` injecte chaque sprite une seule fois dans le
  `<body>` (préfixage des `id` pour éviter les collisions) et réutilise le
  `<use xlink:href>` par la suite.

## 6. Collections personnalisées

Implémenter l'interface `IconCollection` et l'enregistrer :

```tsx
import { IconCollection, IconElement, registerIconCollection } from "@jointhedots/icon"
import type { ThemeProvider } from "@jointhedots/theme"

class IconMapCollection implements IconCollection {
   setup(element: IconElement) {
      // Préparer className/style (les options du parseur y sont déjà appliquées)
   }
   draw(element: IconElement, theme: ThemeProvider): React.ReactElement {
      // Rendre le calque ; choisir selon theme.lighting si nécessaire
   }
}

registerIconCollection("myapp", new IconMapCollection())
```

Points de contrat :

- `setup` est appelé une fois par élément parsé (après application des
  drapeaux/variables) ; `draw` à chaque rendu ;
- `draw` reçoit le thème courant (ou son contraste si `inverse`) ;
- un namespace non enregistré retombe sur le glyph d'erreur `?` — pas d'exception ;
- pour une collection par images, voir `IconUrlCollection` (fichiers servis) ;
  pour une collection par police CSS, `IconFontCollection(classPrefix)` où
  `classPrefix + nom` doit donner la classe du glyph.

## 7. Aide-mémoire

```
bi:house-door-fill                          glyph simple
bi:bell[badge]                              pastille coin haut-droit
bi:bell|label:3                             compteur superposé
[error]bi:exclamation-triangle-fill         couleur forcée sur la base
bi:zap[primary]|utility:einstein[badge,info] empilement multi-collections
avatar:Jean Dupont                          pastille initiales déterministe
flag:fr                                     drapeau (export flag-icons)
label:new                                   pastille texte
standard:account                            icône SLDS standard
```
