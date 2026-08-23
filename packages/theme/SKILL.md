# SKILL — Usage avancé du thème @jointhedots/theme

Ce document détaille le contrat du package : modèle d'éclairage, thème global,
contexte React, persistance et injection de styles.

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
`<html>`. Toute la cascade de tokens CSS repose sur ces classes — les feuilles
`.theme-dark { … }` / `.theme-light { … }` redéfinissent les variables.

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

## 4. La cascade de styles

Le package injecte au chargement (balise `<style id="jtd-theme-styles">`,
idempotent, sans effet hors navigateur) la cascade compilée :

1. `theme-dark.scss` — tokens `.theme-dark` (palette VS Code sombre) ;
2. `theme-light.scss` — tokens `.theme-light` (palette claire) ;
3. `theme.scss` — mapping `body { --app-*: var(--vscode-*) }`.

Les composants consomment exclusivement les variables `--app-*`
(`--app-background`, `--app-foreground`, `--app-button-prim-*`,
`--app-value-*`, `--app-highlight-*`, `--app-separator`…). Redéfinir les
`--app-*` sur un conteneur suffit à re-thémer un sous-arbre.

En complément, la feuille SLDS
(`@salesforce-ux/design-system/…/salesforce-lightning-design-system.css`)
est importée littéralement : le bundler de l'application la résout et
l'émet avec les assets de police — le rendu SLDS (boutons, inputs, modals)
est correct sans configuration.

## 5. Palettes supplémentaires

Deux variantes existent à l'état de sources : `theme-dark-solarized.scss` et
`theme-light-quiet.scss` (classes `.theme-dark-solarized`, `.theme-light-quiet`).
Elles ne sont pas dans la cascade par défaut. Pour les activer, les ajouter à
la liste `styles` du package dans `scripts/styles.mts` — la cascade compilée
les embarquera et il suffira de poser la classe correspondante sur `<body>`.

## 6. Contrat de consommation pour un composant

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
--app-*                                      // variables de consommation
```
