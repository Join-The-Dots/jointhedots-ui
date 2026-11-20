# SKILL — Usage avancé des boutons @jointhedots/button

Ce document détaille le contrat des deux composants : variants, icônes,
tooltip, rendu lien, focus programmatique et accessibilité. Les styles sont propres au
package (gabarits `jtd-*`, tokens `--jtd-*` de @jointhedots/theme) — aucune
feuille tierce n'est requise.

## 1. Button — variants et classes

`Button` rend un `<button type="button">` — ou un `<a>` quand `href` est
fourni (voir §5) — habillé par la classe de base `jtd-button` plus un
modificateur calculé à partir de deux axes : `variant` (nature du bouton) et
`iconVariant` (présentation d'un bouton-icône).

| `variant` | Modificateur | Rendu |
| --- | --- | --- |
| `base` | aucun | nu, sans modificateur |
| `neutral` (défaut) | `jtd-button--neutral` | surface + filet |
| `primary` | `jtd-button--primary` | remplissage `--jtd-primary`, texte `--jtd-on-emphasis` |
| `outline-primary` | `jtd-button--outline-primary` | contour `--jtd-primary` |
| `error` / `text-error` | `jtd-button--error` / `--text-error` | action d'échec pleine / texte |
| `warning` | `jtd-button--warning` | action d'attention pleine |
| `success` | `jtd-button--success` | action positive pleine |
| `link` | `jtd-button--link` | lien texte |
| `icon` | `jtd-button--icon` | bouton-icône (voir `iconVariant`) |

Tout variant coloré suit la palette sémantique du thème
(`primary` / `success` / `warning` / `error`) ; la base `jtd-button` est
transparente — un variant sans remplissage (outline, texte) ne montre
jamais le fond natif du `<button>`. Le texte posé sur un remplissage
saturé est toujours `--jtd-on-emphasis`.

| `iconVariant` | Modificateur | Rendu |
| --- | --- | --- |
| `bare` (défaut des icon) | aucun | icône nue, halo au survol |
| `container` | `jtd-button--icon-container` | pastille de fond |
| `border` / `border-filled` | `--icon-border` / `--icon-border-filled` | contour / contour rempli |
| `primary` | `jtd-button--icon-primary` | pastille `--jtd-primary` |
| `more` | `jtd-button--icon-more` | chevron de débordement (rendu bare) |
| `global-header` | rendu `container` | bouton d'entête globale |

`inverse` inverse le contraste (fond sombre) : `jtd-button--inverse` pour un
bouton plein, `--icon-inverse` / `--icon-border-inverse` pour un bouton-icône.
L'icône interne reçoit aussi `inverse` et rend avec le thème contrasté (voir
@jointhedots/theme).

## 2. Button — icônes

- `icon` : nom d'icône du système @jointhedots/icon (`"bi:save"`,
  `"utility:settings"`…). Toute la syntaxe de nommage s'applique.
- `iconPosition` : `"left"` (défaut) ou `"right"`.
- Le glyphe est décoratif (`aria-hidden`) : le nom accessible du bouton est
  son libellé, ou `assistiveText`.
- Avec `icon` **et** `assistiveText`, le libellé visible n'est pas rendu :
  `assistiveText` devient l'unique nom (`aria-label`) du bouton.

Le glyphe hérite toujours de la typographie du bouton (1em, aligné sur le
texte), comme les lignes de menu et les champs.

```tsx
<Button label="Delete" icon="bi:trash" iconPosition="right" variant="error" />
```

## 3. Button — taille

`size` : `xs`/`sm`/`md` (défaut)/`lg` — les mêmes déclinaisons que les icônes
et les champs. La taille met à l'échelle le bouton entier : hauteur, police,
espacements, rayon ; le glyphe suit par héritage de la fonte. Les métriques
sont celles du composite de champ (`jtd-field--*` de @jointhedots/input),
donc un bouton posé à côté d'un champ de même taille partage sa hauteur
(18/24/32/40 px). Le bouton-icône (`variant="icon"`) dérive sa boîte de la
même taille ; le variant `link` ne retient que la typographie.

```tsx
<Button label="Save" icon="bi:save" size="sm" variant="primary" />
```

## 4. Button — tooltip

Quand `tooltip` est fourni (React node), le bouton est enveloppé dans un
`span.jtd-tooltip` et la bulle `jtd-tooltip__content` (`role="tooltip"`)
s'affiche au survol ou au focus clavier (délai ~350 ms, contenu riche
autorisé), au plan `--jtd-tooltip-zindex`, avec l'ombre
`--jtd-shadow-floating`. La bulle suit la même grammaire visuelle que les
popovers du layout : surface, filet hairline, flèche dont le contour
prolonge celui de la bulle.

```tsx
<Button icon="bi:gear" variant="icon" assistiveText="Settings" tooltip={<span>Settings</span>} />
```

Pour une simple infobulle native, préférer `title`.

## 5. Button — lien

Avec `href`, `Button` rend un `<a>` portant exactement les mêmes classes :
un lien a l'apparence de n'importe quel variant.

- `target` et `rel` sont transmis ; avec `target="_blank"` et sans `rel`,
  `rel` vaut `noopener noreferrer` ;
- un lien `disabled` perd son `href` et porte `aria-disabled="true"` ;
- `type` ne s'applique qu'au `<button>`.

```tsx
<Button label="Documentation" icon="bi:box-arrow-up-right" iconPosition="right"
   variant="link" href="https://…" target="_blank" />
```

## 6. Button — focus, références et événements

- `buttonRef: (node | null) => void` reçoit l'élément monté (`<button>` ou
  `<a>`).
- `requestFocus` + `onRequestFocus(node)` demandent le focus programmatique
  au montage.
- Événements : `onClick(event)`, `onBlur`, `onFocus`, `onKeyDown`,
  `onKeyUp`, `onMouseDown/Enter/Leave/Up` — tous reçoivent l'événement
  React seul.
- `:focus-visible` rend un anneau `--jtd-primary` (outline + offset).

## 7. Button — accessibilité et passthrough

- `assistiveText` : libellé lecteur d'écran — rendu en `aria-label` ; pour un
  bouton-icône sans `assistiveText`, un `label` chaîne est promu en
  `aria-label`.
- ARIA typé : `aria-haspopup`, `aria-expanded`, `aria-controls`,
  `aria-pressed`, `aria-current`, `aria-describedby` — le bouton déclencheur
  d'un menu ou d'un panneau l'annonce ainsi.
- `getHtmlProps` transmet tout prop `aria-*`, `data-*` et les props de
  formulaire (`form`, `formAction`, `formMethod`…) à l'élément natif.
- `type` : `button` (défaut), `submit`, `reset`.
- `title` : infobulle native.
- `disabled`, `id`, `tabIndex`, `style`, `className` standard.

## 8. ButtonIcon — pastille d'action

`ButtonIcon` est un déclencheur icône léger, distinct d'un
`Button variant="icon"` : un `<button type="button">` natif et focusable, en
pastille circulaire, idéal pour les actions internes d'interface (tooling
d'items, en-têtes de panneaux, barres d'outils).

| Prop | Rôle |
| --- | --- |
| `icon` / `hoveredIcon` | icône affichée ; `hoveredIcon` bascule au survol (état vs repos : favori, coche…) — la bascule est toujours fondue |
| `title` | **obligatoire** : nom accessible (`aria-label`) et infobulle native — une pastille sans libellé visible doit être nommée |
| `size` | alias IconSize (`xs`…`lg`) ou valeur brute (`"2em"`) — appliquée en `font-size` |
| `variant` | `primary`, `neutral`, `watermark` — classe additionnelle du même nom |
| `inversed` | rend l'icône avec le thème contrasté |
| `disabled` | désactive le bouton natif |
| `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-pressed` | état ARIA (menu ouvert, bascule…) |
| `className`, `style`, `onClick` | transmis au `<button>` |

```tsx
<ButtonIcon icon="bi:star" hoveredIcon="bi:star-fill" title="Favorite" size="lg" />
<ButtonIcon icon="bi:three-dots-vertical" title="More actions" aria-haspopup="menu" onClick={open} />
```

Quand `hoveredIcon` est fourni, la bascule au survol est systématiquement
fondue : l'icône courante est rendue via `FadeIcon` de @jointhedots/icon
(300 ms) — pas de prop à activer. Sans `hoveredIcon`, l'icône unique est
rendue sans structure ni transition supplémentaire.

Le gabarit `jtd-button-icon` rend la pastille circulaire (1.8em), son état
de survol, l'anneau de focus `--jtd-primary` et ses variantes —
entièrement piloté par les tokens `--jtd-*`.

## 9. Styles

Les gabarits (`jtd-button*`, `jtd-tooltip`, `jtd-button-icon`) sont écrits
en CSS natif et injectés au chargement du module (balise
`<style id="jtd-button-styles">`, idempotente, sans effet hors
navigateur).

## Aide-mémoire

```
variant: primary | neutral | error | outline-primary | success | warning | link | icon | base | text-error
iconVariant: bare | container | border | border-filled | primary | more | global-header
size: xs | sm | md | lg   // métriques des champs — le bouton suit son input
inverse: true            // fond opposé (bouton + icône)
tooltip: <node>          // bulle CSS au hover/focus (~350 ms)
href / target / rel      // rendu <a>, mêmes classes (_blank → noopener noreferrer)
buttonRef / requestFocus // contrôle du focus
onClick(event)           // événement seul
assistiveText            // a11y icône seule (aria-label)
aria-* / data-* / form*  // passthrough automatique (ARIA courant typé)
ButtonIcon: title        // requis — aria-label + infobulle native
ButtonIcon: hoveredIcon  // bascule fondue au survol (imposée)
```
