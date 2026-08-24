# SKILL — Usage avancé des boutons @jointhedots/button

Ce document détaille le contrat des deux composants : variants, icônes,
tooltip, focus programmatique et accessibilité. Les styles sont propres au
package (gabarits `jtd-*`, tokens `--jtd-*` de @jointhedots/theme) — aucune
feuille tierce n'est requise.

## 1. Button — variants et classes

`Button` rend un `<button>` habillé par la classe de base `jtd-button` plus un
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
`span.jtd-tooltip` et la bulle `jtd-tooltip__content` s'affiche au survol ou
au focus clavier (délai ~350 ms, contenu riche autorisé). La bulle suit la
même grammaire visuelle que les popovers du layout : surface, filet hairline,
flèche dont le contour prolonge celui de la bulle.

```tsx
<Button icon="bi:gear" variant="icon" tooltip={<span>Settings</span>} />
```

Pour une simple infobulle native, préférer `title`.

## 5. Button — focus et références

- `buttonRef: (node | null) => void` reçoit l'élément `<button>` monté.
- `requestFocus` + `onRequestFocus(node)` demandent le focus programmatique
  au montage.
- Événements : `onClick(event, data)` (le second argument est réservé),
  `onBlur`, `onFocus`, `onKeyDown/Press/Up`, `onMouse*`.
- `:focus-visible` rend un anneau `--jtd-primary` (outline + offset).

## 6. Button — accessibilité et passthrough

- `assistiveText` : libellé lecteur d'écran — rendu en `aria-label` ; pour un
  bouton-icône sans `assistiveText`, un `label` chaîne est promu en
  `aria-label`.
- `getHtmlProps` transmet automatiquement tout prop `aria-*`, `data-*` et les
  props de formulaire (`form`, `formAction`, `formMethod`…) à l'élément natif.
- `type` : `button` (défaut), `submit`, `reset`.
- `title` : infobulle native.
- `disabled`, `responsive`, `hint`, `id`, `style`, `className` standard.

## 7. ButtonIcon — pastille d'action

`ButtonIcon` est un déclencheur icône légèrement différent d'un `Button
variant="icon"` : c'est un `<div>` focusable via tabIndex passé au props,
idéal pour actions internes d'interface (tooling d'items, barres d'outils).

| Prop | Rôle |
| --- | --- |
| `icon` / `hoveredIcon` | icône affichée ; `hoveredIcon` bascule au survol (état vs repos : favori, coche…) — la bascule est toujours fondue |
| `size` | alias IconSize (`xs`…`lg`) ou valeur brute (`"2em"`) — appliquée en `font-size` |
| `variant` | `primary`, `neutral`, `watermark` — classe additionnelle du même nom |
| `inversed` | rend l'icône avec le thème contrasté |
| `title`, `className`, `style`, `onClick` | transmis au conteneur |

```tsx
<ButtonIcon icon="bi:star" hoveredIcon="bi:star-fill" size="lg" />
```

Quand `hoveredIcon` est fourni, la bascule au survol est systématiquement
fondue : l'icône courante est rendue via `FadeIcon` de @jointhedots/icon
(300 ms) — pas de prop à activer. Sans `hoveredIcon`, l'icône unique est
rendue sans structure ni transition supplémentaire.

Le gabarit `jtd-button-icon` (styles injectés au chargement, id
`jtd-button-styles`) rend la pastille circulaire, son état de survol et ses
variantes — entièrement piloté par les tokens `--jtd-*`.

## Aide-mémoire

```
variant: primary | neutral | error | outline-primary | success | warning | link | icon | base | text-error
iconVariant: bare | container | border | border-filled | primary | more | global-header
size: xs | sm | md | lg   // métriques des champs — le bouton suit son input
inverse: true            // fond opposé (bouton + icône)
tooltip: <node>          // bulle CSS au hover/focus (~350 ms)
buttonRef / requestFocus // contrôle du focus
assistiveText            // a11y icône seule (aria-label)
aria-* / data-* / form*  // passthrough automatique
ButtonIcon: hoveredIcon  // bascule fondue au survol (imposée)
```
