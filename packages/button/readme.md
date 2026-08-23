# @jointhedots/button

Boutons Join.The.Dots, stylés SLDS : `Button` (label, icône, variante,
tooltip) et `ButtonIcon` (icône seule, survol alternatif, pastilles colorées).

## Installation

```bash
pnpm add @jointhedots/button
```

Peer dependency : `react` ≥ 18.2.0. Le package tire ses assets SLDS
(`@salesforce-ux/design-system`, `@salesforce/design-system-react`) et dépend
de `@jointhedots/icon` pour les glyphes.

## Usage

```tsx
import { Button, ButtonIcon } from "@jointhedots/button"
import "@jointhedots/icon/bootstrap"

<Button label="Save" icon="bi:save" variant="brand" onClick={...} />
<ButtonIcon icon="bi:trash" variant="primary" title="Delete" />
<ButtonIcon icon="bi:star" hoveredIcon="bi:star-fill" size="lg" />
```

Les styles du package (gabarit `jtd-button-icon`) sont injectés
automatiquement au chargement du module — aucun stylesheet à gérer.
