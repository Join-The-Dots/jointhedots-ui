# SKILL — Usage avancé du thème @jointhedots/theme

Ce document détaille le contrat du package : modèle d'éclairage, thème global,
contexte React, persistance, tokens de design et injection de styles.

## 1. Le modèle d'éclairage

L'éclairage est un enum binaire :

```ts
enum ThemeLighting { Dark = 0, Light = 1 }
```

Un **ThemeProvider** porte un éclairage et expose les prédicats `isLight` /
`isDark`. Deux instances singleton existent : `LightTheme` et `DarkTheme`.

Chaque thème connaît son **thème contrasté** (`theme.contrastTheme`) — le
thème du fond opposé. C'est le canal officiel pour les composants qui doivent
s'inverser sur un fond coloré (prop `inverse` de `Icon` et `Button`).

## 2. Le thème global

`ThemeProvider.globalTheme` est le thème actif de l'application. Au chargement
du module, `loadDefaultTheme()` le détermine dans cet ordre :

1. préférence enregistrée dans `localStorage["application#theme"]` ;
2. `prefers-color-scheme: dark` / `light` du système ;
3. fallback sombre.

La pose du thème global a des effets de bord DOM : classe `theme-dark` ou
`theme-light` sur `<body>`, attributs `data-theme` / `data-color-mode` sur
`<html>`. Toute la cascade de tokens CSS repose sur la classe posée sur
`<body>`.

Pour basculer le thème d'une application :

```tsx
document.body.className = light ? "theme-light" : "theme-dark"
localStorage.setItem("application#theme", light ? "light" : "dark")
```

et re-rendre l'arbre sous un `LocalTheme` correspondant.

## 3. Le contexte React

`ThemeContext` porte le thème courant pour un sous-arbre. Deux façons de le
lire :

```tsx
const theme = React.useContext(ThemeContext)   // directement
const theme = getGlobalTheme()                 // accès hors React
```

`LocalTheme` surcharge le thème d'un sous-arbre sans toucher au global —
utile pour un panneau clair posé sur une application sombre :

```tsx
<LocalTheme theme={LightTheme}>
   <PanelAlwaysLight />
</LocalTheme>
```

Le prop `theme` optionnel retombe sur le thème global quand il est absent.

## 4. Les tokens de design

Le package injecte au chargement (balise `<style id="jtd-theme-styles">`,
idempotent, sans effet hors navigateur) la cascade compilée de
`src/theme.scss` : un reset minimal (`box-sizing`, `margin` de `body`) et
l'ensemble des tokens. Le sombre est la palette par défaut sur `body` ;
`body.theme-light` la surcharge.

| Token | Rôle |
| --- | --- |
| `--jtd-background` / `--jtd-foreground` | fond et texte de la page |
| `--jtd-surface` / `--jtd-surface-foreground` | surfaces élevées : popovers, menus, champs, panneaux |
| `--jtd-border` | filet hairline : bordures, séparateurs |
| `--jtd-muted` | texte secondaire / désactivé |
| `--jtd-hover` | teinte de survol |
| `--jtd-accent` / `--jtd-on-accent` | accent interactif (boutons primaires, focus, sélection) et texte posé dessus |
| `--jtd-danger` / `--jtd-success` | accents sémantiques destructif / positif |
| `--jtd-font-family` | police de l'interface |

Règles d'usage pour les composants :

- consommer exclusivement ces tokens — jamais de couleur littérale ni de
  `light-dark()` dans un gabarit de package ;
- dériver les états (hover d'un bouton accenté…) par `color-mix()` sur un
  token plutôt qu'en ajoutant un token ;
- `color-scheme` (`dark` par défaut, `light` sur `body.theme-light`) suit le
  thème : les contrôles natifs (scrollbars, checkboxes) s'alignent seuls ;
- re-thémer un sous-arbre : redéfinir les `--jtd-*` sur un conteneur.

## 5. Contrat de consommation pour un composant

Un composant sensible à l'éclairage lit `ThemeContext` et décide selon
`theme.lighting` ; il reçoit au dessin le thème courant, ou son contraste si
le contexte l'inverse. Il ne doit jamais muter le thème global — la pose des
classes `body` appartient au chargeur de thème.

## Aide-mémoire

```
import "@jointhedots/theme"                  // tout-en-un au démarrage
ThemeLighting.Dark | .Light                  // éclairage
LightTheme / DarkTheme                       // singletons
theme.contrastTheme                          // fond opposé (prop inverse)
<LocalTheme theme={…}>                       // surcharge de sous-arbre
React.useContext(ThemeContext)               // lecture dans un composant
localStorage["application#theme"]            // persistance du choix
body.theme-dark / body.theme-light           // cascade de tokens
--jtd-*                                      // variables de consommation
```
