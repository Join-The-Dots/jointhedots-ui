# @jointhedots/button

Boutons Join.The.Dots : `Button` (label, icône, variante,
tooltip) et `ButtonIcon` (icône seule, survol alternatif, pastilles colorées).

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

<Button label="Save" icon="bi:save" variant="brand" onClick={...} />
<ButtonIcon icon="bi:trash" variant="primary" title="Delete" />
<ButtonIcon icon="bi:star" hoveredIcon="bi:star-fill" size="lg" />
```

Les styles du package (gabarits `jtd-button*`, `jtd-tooltip`) sont injectés
automatiquement au chargement du module — aucun stylesheet à gérer.
