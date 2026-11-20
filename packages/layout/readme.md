# @jointhedots/layout

Système de mise en page Join.The.Dots : panneaux et docks — base de toute
modale, tiroir, menu ou popover (`usePanel`, `createPanel`, `openDialog`,
`openContextualMenu`, `createFloatingDock`, `DrawerDock`, `ModalDock`),
menu accessible (`Menu`), empilements (`Stack`, `OverflowStack`, `Popup`)
et lignes d'items (`ItemRowShort`, `ItemRowRich`, `LabelButton`,
`ItemIcon`).

## Installation

```bash
pnpm add @jointhedots/layout
```

Peer dependencies : `react`, `react-dom` ≥ 18.2.0. Dépend de
`@jointhedots/icon` (glyphes), `@jointhedots/button` (actions) et
`react-toastify` (retours d'erreur d'activation d'item). Les glyphes
internes sont des `bi:` : importer `@jointhedots/icon/bootstrap` dans
l'application.

## Usage

```tsx
import { Overlays, Menu, openDialog, openContextualMenu } from "@jointhedots/layout"

const settings = Overlays.useModal(() => ({ title: "Settings", content: <SettingsForm />, footer: actions }), [])
settings.open()

const answer = await openDialog(resolve => <MyDialogContent onDone={resolve} />, { title: "Pick" })

const action = await openContextualMenu(event, close => (
   <Menu aria-label="File">
      <Menu.Item name="Open" icon="bi:folder" onClick={() => close("open")} />
   </Menu>
))
```

Toute superposition est un panneau ouvert sur un dock — latéral (`side`,
`left`), modal (`modal`) ou flottant accroché à une cible
(`createFloatingDock(target)`) — qui gère focus, Escape et inertie du reste
de la page. Les styles du package sont injectés
automatiquement au chargement du module — aucun stylesheet à gérer.

## Usage avancé

Contrat complet (panneaux, docks, menus, items, pièges) : voir
[SKILL.md](./SKILL.md).
