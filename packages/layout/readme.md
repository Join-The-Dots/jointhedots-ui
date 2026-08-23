# @jointhedots/layout

Système de mise en page Join.The.Dots : docks et panneaux (`createPanel`,
`openDialog`, `openContextualMenu`, `DrawerDock`, `ModalDock`,
`createFloatingDock`), menus contextuels (`Menu`), empilements (`Stack`,
`OverflowStack`, `Popup`) et lignes d'items (`ItemRowShort`, `ItemRowRich`,
`LabelButton`, `ItemIcon`).

## Installation

```bash
pnpm add @jointhedots/layout
```

Peer dependencies : `react`, `react-dom` ≥ 18.2.0. Dépend de
`@jointhedots/icon` (glyphes), `@jointhedots/button` (actions) et
`@jointhedots/core` (utilitaires) ; `react-toastify` pour les retours
d'activation d'item.

## Usage

```tsx
import { openDialog, openContextualMenu, Stack, ItemRowShort } from "@jointhedots/layout"

const answer = await openDialog(resolve => <MyDialogContent onDone={resolve} />)

await openContextualMenu(event, close => (
   <Menu>
      <Menu.Item name="Open" icon="bi:folder" onClick={() => close("open")} />
   </Menu>
))
```

Le panneau est l'unité centrale : il expose un contenu (`display`) et s'ouvre
sur un dock — latéral (`side`), modal (`modal`) ou flottant accroché à une
cible (`createFloatingDock(target)`). Les styles du package (gabarits
`jtd-panel-*`, `jtd-menu-*`, `jtd-item-*`) sont injectés automatiquement au
chargement du module — aucun stylesheet à gérer.
