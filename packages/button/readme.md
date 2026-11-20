# @jointhedots/button

Boutons Join.The.Dots : `Button` (label, icône, variante, taille,
tooltip, rendu lien avec `href`) et `ButtonIcon` (pastille icône accessible,
survol alternatif, pastilles colorées).

## Installation

```bash
pnpm add @jointhedots/button
```

Peer dependency : `react` ≥ 18.2.0. Le package dépend de
`@jointhedots/icon` pour les glyphes et consomme les tokens `--jtd-*` de
`@jointhedots/theme`.

## Usage

```tsx
import { Button, ButtonIcon } from "@jointhedots/button"
import "@jointhedots/icon/bootstrap"

<Button label="Save" icon="bi:save" variant="primary" onClick={...} />
<Button label="Save" icon="bi:save" variant="primary" size="sm" />
<Button label="Docs" variant="link" href="https://…" target="_blank" />
<ButtonIcon icon="bi:trash" variant="primary" title="Delete" />
<ButtonIcon icon="bi:star" hoveredIcon="bi:star-fill" title="Favorite" size="lg" />
```

`size` (`xs`/`sm`/`md`/`lg`) partage les métriques des champs
d'@jointhedots/input : un bouton aligné sur un champ de même taille partage
sa hauteur. `ButtonIcon` exige un `title` : c'est son nom accessible et son
infobulle.

Les styles du package (gabarits `jtd-button*`, `jtd-tooltip`) sont injectés
automatiquement au chargement du module — aucun stylesheet à gérer.
