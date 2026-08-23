# SKILL — Usage avancé des boutons @jointhedots/button

Ce document détaille le contrat des deux composants : variants SLDS, icônes,
tooltip, focus programmatique et accessibilité.

## 1. Button — variants et classes

`Button` est un bouton SLDS complet. La classe est calculée à partir de deux
axes : `variant` (nature du bouton) et `iconVariant` (présentation d'un
bouton-icône).

| `variant` | Rendu |
| --- | --- |
| `base` | nu, sans classe de variante |
| `neutral` (défaut) | `slds-button_neutral` |
| `brand` | bouton principal bleu |
| `outline-brand` | contour bleu |
| `destructive` / `text-destructive` | action dangereuse pleine / texte |
| `success` | action positive |
| `link` | `slds-button_reset` + `slds-text-link` (lien) |
| `icon` | bouton-icône (voir `iconVariant`) |

| `iconVariant` | Rendu |
| --- | --- |
| `bare` (défaut des icon) | icône nue |
| `container` | pastille de fond |
| `border` / `border-filled` | contour / contour rempli |
| `brand` / `more` | teinte marque / chevron de débordement |
| `global-header` | bouton d'entête globale (rendu container) |

`inverse` inverse le contraste (fond sombre) : `slds-button_inverse` pour un
bouton plein, `slds-button_icon-inverse` / `icon-border-inverse` pour un
bouton-icône. L'icône interne reçoit aussi `inverse` et rend avec le thème
contrasté (voir @jointhedots/theme).

## 2. Button — icônes

- `icon` : nom d'icône du système @jointhedots/icon (`"bi:save"`,
  `"utility:settings"`…). Toute la syntaxe de nommage s'applique.
- `iconPosition` : `"left"` (défaut) ou `"right"`.
- `iconSize` : `xs`/`sm`/`md`/`lg` — mappé sur IconSize ; ignoré quand un
  `iconVariant` à conteneur est actif (le conteneur porte la taille).

```tsx
<Button label="Delete" icon="bi:trash" iconPosition="right" variant="destructive" />
```

## 3. Button — tooltip

Quand `tooltip` est fourni (React node), le bouton est enveloppé dans le
`Tooltip` SLDS (`@salesforce/design-system-react`). Le hover affiche le
contenu ; `tabIndex` et le focus clavier suivent.

```tsx
<Button icon="bi:gear" variant="icon" tooltip={<span>Settings</span>} />
```

## 4. Button — focus et références

- `buttonRef: (node | null) => void` reçoit l'élément `<button>` monté.
- `requestFocus` + `onRequestFocus(node)` demandent le focus programmatique
  au montage (pattern SLDS).
- Événements : `onClick(event, data)` (le second argument est réservé),
  `onBlur`, `onFocus`, `onKeyDown/Press/Up`, `onMouse*`.

## 5. Button — accessibilité et passthrough

- `assistiveText` : texte lecteur d'écran quand le bouton est icône seule.
- `getHtmlProps` transmet automatiquement tout prop `aria-*`, `data-*` et les
  props de formulaire (`form`, `formAction`, `formMethod`…) à l'élément natif.
- `type` : `button` (défaut), `submit`, `reset`.
- `title` : infobulle native.
- `disabled`, `responsive`, `hint`, `id`, `style`, `className` standard.

## 6. ButtonIcon — pastille d'action

`ButtonIcon` est un déclencheur icône légèrement différent d'un `Button
variant="icon"` : c'est un `<div>` focusable via tabIndex passé au props,
idéal pour actions internes d'interface (tooling d'items, barres d'outils).

| Prop | Rôle |
| --- | --- |
| `icon` / `hoveredIcon` | icône affichée ; `hoveredIcon` bascule au survol (état vs repos : favori, coche…) |
| `size` | alias IconSize (`xs`…`lg`) ou valeur brute (`"2em"`) — appliquée en `font-size` |
| `variant` | `primary`, `secondary`, `watermark` — classe `jtd-button-icon-<variant>` |
| `inversed` | rend l'icône avec le thème contrasté |
| `title`, `className`, `style`, `onClick` | transmis au conteneur |

```tsx
<ButtonIcon icon="bi:star" hoveredIcon="bi:star-fill" size="lg" />
```

Le gabarit `jtd-button-icon` (styles injectés au chargement, id
`jtd-button-styles`) rend la pastille circulaire, son état de survol et ses
variantes. Tous les états sont bi-thème via `light-dark()` : le rendu suit
le `color-scheme` posé par @jointhedots/theme sans configuration. Le CSS
SLDS est importé littéralement par le package : le bundler de l'application
l'émet avec ses assets.

## Aide-mémoire

```
variant: brand | neutral | destructive | outline-brand | success | link | icon | base | text-destructive
iconVariant: bare | container | border | border-filled | brand | more | global-header
inverse: true            // fond opposé (bouton + icône)
tooltip: <node>          // Tooltip SLDS au hover
buttonRef / requestFocus // contrôle du focus
assistiveText            // a11y icône seule
aria-* / data-* / form*  // passthrough automatique
ButtonIcon: hoveredIcon  // bascule visuelle au survol
```
