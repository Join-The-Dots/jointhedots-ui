# SKILL — Usage avancé du layout @jointhedots/layout

Ce document détaille le modèle de panneaux et docks — base unique de toute
fenêtre superposée (modale, tiroir, menu, popover) —, les ouvertures
asynchrones, le menu accessible, les empilements et le modèle d'items.

## 1. Principe — tout passe par un panneau

Il n'existe pas de composant `Modal` ou `Drawer` à poser dans l'arbre : une
modale, un tiroir, un menu ou un popover est un **panneau**
(`usePanel` / `createPanel`) ouvert sur un **dock** (`"modal"`, `"side"`,
`"left"`, flottant). Le dock décide du placement et du comportement ; le
panneau ne décrit que son contenu (`PanelContent`, §2).

```tsx
const [name, setName] = useState("")
const rename = usePanel((panel) => ({
   title: "Rename",
   size: "sm",
   content: <InputData label="Name" value={name} schema={nameSchema} onChange={setName} />,
   footer: <>
      <Button label="Cancel" onClick={() => panel.close()} />
      <Button label="Save" variant="primary" onClick={() => { save(name); panel.close() }} />
   </>,
}), [name])

<Button label="Rename…" aria-haspopup="dialog" onClick={() => rename.open("modal")} />
```

### Comportement des docks modal et latéraux

- Frame `role="dialog"`, `aria-labelledby` vers le titre (`<h2>`) ;
  `aria-modal` sur le dock modal.
- **En-tête** (`jtd-panel-header`) : icône, titre, `tooling`, bouton
  fermer (`ButtonIcon` « Close ») quand le panneau est `closable` (défaut).
  `closable: false` retire bouton, Escape et clic sur le voile.
- **Corps** `jtd-panel-body` défilant ; **pied** `jtd-panel-footer`
  (dock modal, actions alignées à droite).
- **Taille** (dock modal) : `size` `sm` 480px, `md` 640px (défaut), `lg`
  960px, `fullscreen` ; `height` fixe la hauteur de la frame.
- **Tiroir** : redimensionnable (200px – 70 % du viewport, double-clic →
  300px), non modal ; le dock garde la largeur d'une ouverture à l'autre.
- **Focus initial** : premier champ du corps, sinon premier élément
  focusable du corps, sinon la frame — sauf si le focus y est déjà. Il est
  repris chaque fois que le dock montre un autre panneau principal (pile).
- **Escape** ferme seulement le dock le plus haut, et seulement quand aucun
  dock flottant ouvert après lui (menu, popover) n'est encore affiché : le
  menu se ferme d'abord. Un tiroir (non modal) ne répond à Escape que si le
  focus est en lui.
- **Restitution** : à la fermeture, le focus revient à l'élément qui
  l'avait à l'ouverture.
- **Inertie** : le dock modal rend `inert` les autres enfants de
  `document.body`.
- Animation d'entrée désactivée sous `prefers-reduced-motion`.
- Plans : `--jtd-drawer-zindex` < `--jtd-modal-zindex` ; voile
  `--jtd-backdrop`, ombre `--jtd-shadow-panel`, rayon
  `--jtd-radius-panel`.

## 2. Le modèle Panel / Dock

Un **panneau** est une description affichable (`PanelContent`) associée à
un **dock** qui décide du placement :

```ts
{
   icon?, title?,             // en-tête
   content: ReactNode,        // corps
   footer?: ReactNode,        // pied (dock modal)
   tooling?: ToolingProps[],  // actions d'en-tête
   closable?,                 // bouton fermer, Escape, voile
   size?, height?,            // taille de la modale (dock modal)
   onClose?: () => void,      // notifié à la fermeture
}
```

Le panneau est un objet impératif :

```ts
const panel = createPanel()
panel.display({ content: <Foo /> })
panel.open("modal")    // "side" (défaut) | "left" | "modal" | un PanelDock
panel.close()
panel.switch("modal")  // ferme s'il est déjà dans la stack du dock, l'ouvre sinon
```

`display` est idempotent et différentiel : rappeler `display` avec des
propriétés identiques (comparaison superficielle) ne re-rend pas ; une
différence met à jour le panneau en place. Passer `undefined` ferme
le panneau.

Le hook `usePanel(render, deps)` crée un panneau stable : `render(panel)`
retourne (ou promet) un `PanelContent`, ré-évalué quand `deps` change, et
le panneau est fermé au démontage du composant.

```tsx
const panel = usePanel(async () => ({ content: await buildContent(data) }), [data])
```

**Dock par défaut.** `usePanel(render, deps, dock?)` et
`createPanel(displayed?, dock?)` prennent un dock optionnel
(`panel.defaultDock`), utilisé par `open()` et `switch()` appelés sans
argument. Un dock passé explicitement reste prioritaire ; sans aucun
dock, le panneau s'ouvre sur `"side"`.

Le namespace `Overlays` regroupe des raccourcis déjà liés à leur dock :

```tsx
const modal = Overlays.useModal((panel) => ({ title: "New", content, footer }), [deps])
const nav = Overlays.useLeftDrawer(() => ({ content: <Menu>…</Menu> }), [])
<Button onClick={() => modal.open()} /> <Button onClick={() => nav.switch()} />
```

| Helper | Dock par défaut |
| --- | --- |
| `Overlays.useModal(render, deps)` / `createModal(displayed?)` | `"modal"` |
| `Overlays.useLeftDrawer(render, deps)` / `createLeftDrawer(displayed?)` | `"left"` |
| `Overlays.useRightDrawer(render, deps)` / `createRightDrawer(displayed?)` | `"side"` |
| `Overlays.createPopover(target, displayed?, options?)` | dock flottant ancré à `target` |

`Overlays` réexpose aussi `usePanel`, `createPanel`, `createFloatingDock`,
`openDialog` et `openContextualMenu`.

## 3. Les docks

| Dock | Comportement |
| --- | --- |
| `"side"` / `"left"` → `DrawerDock` | tiroir redimensionnable à droite / à gauche ; les panneaux qu'il a remplacés sont listés en lignes `ItemRowRich` au-dessus du contenu et le ramènent au clic |
| `"modal"` → `ModalDock` | modale du panneau principal (titre, icône, tooling, pied, taille, hauteur) ; les panneaux remplacés reviennent à la fermeture du principal |
| `createFloatingDock(target, options)` | surcouche flottante ancrée à une cible (§4) |

Les docks nommés sont des singletons **créés au premier usage** : importer
le package ne touche pas au DOM. Un nom inconnu retombe sur `"side"`.
`DrawerDock`, `ModalDock` et `StackedDock` (la base d'un dock à panneau
principal + pile) sont exportés ; un dock personnalisé implémente
`PanelDock` (`appendPanel` / `removePanel` / `refresh`) et se passe à
`panel.open(monDock)`.

**Racine propre.** `ModalDock` et `DrawerDock` rendent leur frame dans une
**racine React à eux**, à la racine de `document.body` : le contenu d'un
panneau n'y voit pas le contexte de l'appelant (thème local, providers) —
l'état est passé par la closure de `usePanel` et ses `deps`. La racine est
démontée après le commit courant : un panneau peut être fermé depuis un
effet.

## 4. Le dock flottant

`createFloatingDock(target, options?)` crée un dock ancré à une **cible** :
`UIEvent`, `Element` ou `React.SyntheticEvent` (son `currentTarget`, sinon
son `target`). Les événements `click` / `contextmenu` passés en cible sont
`stopPropagation` + `preventDefault`. `dock.popup(displayed)` y ouvre
directement un panneau.

Options : `position` (`down-right` par défaut, `down-left`, `up-left`,
`up-right`, `left-up`, `left-down`, `right-up`, `right-down` — le côté se
retourne quand la place manque, marge 5px), `variant` (`menu` par défaut,
`popup`, `popover`), `className`, `noAutoClose`.

Comportement :

- suit sa cible à chaque frame (`requestAnimationFrame`), positionné contre
  le viewport ; se ferme si la cible quitte le document ;
- pose `aria-expanded="true"` sur la cible tant qu'il est affiché
  (`"false"` ensuite) ;
- se ferme sur Escape (seulement le dock le plus haut), sur un clic hors de
  la cible et hors des docks empilés au-dessus, et quand un panneau s'ouvre
  dans un dock modal ou latéral (sauf `noAutoClose`) ;
- à la fermeture, rend le focus à la cible s'il était dans le dock ;
- empilement : ouvrir un dock depuis un dock existant le place au-dessus
  (`--jtd-floating-zindex` calculé par niveau, au-dessus des modales) ;
  ouvrir un dock ailleurs ferme les docks qui ne contiennent pas sa cible —
  c'est ce qui referme les sous-menus. Rouvrir sur une cible déjà occupée
  ferme le dock existant au lieu de le recréer : un déclencheur agit en
  bascule.

Le variant **popover** est la bulle fléchée : surface, filet hairline,
rayon `--jtd-radius-floating`, ombre `--jtd-shadow-floating`, et une flèche (losange bordé) peinte
derrière le corps opaque, dont le contour prolonge le filet de la bulle. Le
côté porteur se déduit du placement effectif (après retournement), le
décalage suit le centre de la cible, borné aux marges de la bulle ; tout
est recalculé à chaque frame.

## 5. Les ouvertures asynchrones

### openDialog

```tsx
const value = await openDialog<string>(resolve => (
   <MyForm onSubmit={resolve} />
), { title: "Rename", size: "sm" })
```

Ouvre un panneau dans le dock `"modal"`. Options : `title`, `size`,
`height`. Retourne `Promise<T | undefined>` : la valeur passée à `resolve`,
ou `undefined` si l'utilisateur ferme (bouton, Escape, voile). Le contenu
est rendu dans la racine du `ModalDock` (voir « Racine propre », §3).

### openContextualMenu

```tsx
const action = await openContextualMenu(event, close => (
   <Menu aria-label="File">
      <Menu.Item name="Open" icon="bi:folder2-open" onClick={() => close("open")} />
      <Menu.Item name="Delete" icon="bi:trash" onClick={() => close("delete")} />
   </Menu>
))
if (action === "delete") …
```

Ouvre un dock flottant sur la cible (§4) avec les options données. Le
renderer peut être asynchrone. Retourne un `ContextualMenuPromise<T>` :
une promise de la valeur passée à `close`, ou `undefined` à toute autre
fermeture, augmentée de `.close()` pour refermer programmatiquement.
L'appelant enveloppe ses items dans `<Menu>` pour obtenir le rôle et la
navigation clavier.

## 6. Le composant Menu

```tsx
<Menu aria-label="Actions">                          // role="menu"
   <Menu.Section title="Edit">                       // role="group", titre affiché
      <Menu.Item name="Save" icon="bi:save" onClick={…} />
      <Menu.Item name="Export" icon="bi:box-arrow-up">  // sous-menu
         <Menu.Item name="PDF" onClick={…} />
      </Menu.Item>
   </Menu.Section>
   <Menu.Separator />                                // role="separator"
   <Menu.LargeItem name="Account" summary="…" />     // ligne riche
</Menu>
<Menu.Anchor onClick={openMenu}>…</Menu.Anchor>      // <button aria-haspopup="menu">
```

- `Menu` donne le focus à son premier item au montage ; ArrowUp / ArrowDown
  (cycliques), Home, End déplacent le focus entre items.
- Items (`Menu.Item` → `ItemRowShort`, `Menu.LargeItem` → `ItemRowRich`) :
  `role="menuitem"`, `tabIndex=-1`, Enter / Space les activent ; `current`
  → `aria-current`.
- Un item avec `children` porte `aria-haspopup="menu"` : son sous-menu
  (enveloppé dans un `<Menu>`) s'ouvre au survol (fermé au survol sortant),
  au clic si aucun `onClick` n'est défini, et à ArrowRight.
- `Menu.Anchor` est un déclencheur stylé, `aria-haspopup="menu"`.

## 7. Popup et Stack

- `Popup` : bulle au survol d'un enfant —
  `<Popup content={…}>{anchor}</Popup>`. Le contenu peut être une fonction
  async `(data) => Promise<ReactNode>` évaluée à l'ouverture. Props :
  `variant` (défaut `"popover"`), `position`, `className` (sur le wrapper).
- `Stack` : conteneur flex à espacement (`gap` = 4 par défaut, `padding` =
  gap/2, `vertical` pour une colonne). Sous-composants `Stack.FlexDock`
  (poids flexible + largeur min) et `Stack.FixedDock` (largeur fixe).
- `OverflowStack` : cache les enfants qui débordent et rend un bouton
  débordement (`ButtonIcon` « More ») ouvrant la suite dans un dock
  flottant ; `overflow: ({children}) => ReactNode` personnalise le
  déclencheur. Mesure par `ResizeObserver` + re-layout au resize.

## 8. Le modèle d'items

Les items sont le modèle de données commun des listes, menus et panneaux :

```ts
LabelProps = {
   name: string,                  // affiché (et fallback d'icône avatar)
   icon?: string,                 // nom d'icône explicite
   decorations?: (ShapeDecoration | BadgeDecoration)[],  // forme colorée / badge en coin
   tooling?: (ToolingProps | false | null | undefined)[], // actions ; entrées falsy ignorées
   summary?: ReactNode,           // description courte
   tooltip?: DisplayProps,        // déclaré, non rendu par les composants d'items
   content?: DisplayProps,        // contenu flottant au survol/clic
   data?: T,                      // charge utile libre
   onActivate?: (label, dock) => void | Promise<void>   // reçoit un FloatingDock ancré à l'élément
}
ItemProps = LabelProps & {
   avatar?: ReactNode,            // visuel de tête remplaçant l'icône
   tags?: TagProps[],             // pastilles après le nom (chaîne, élément ou LabelProps)
   actions?: ReactNode,           // actions de fin, après le tooling (clic non propagé à la ligne)
   selected?: LabelSelected,
   current?: boolean,             // élément courant de sa liste → aria-current
   onSelect?, variant?, textOverflow?
}
```

Les lignes sont des `div`. Une ligne activable (`onActivate`, `onSelect`
ou — pour la ligne riche — `content`) devient focusable avec
`role="button"` et s'active au clic, à Enter et à Space ; l'anneau de
focus est `--jtd-primary`.

Les lignes combinent une **taille** (`short` compacte / large riche :
titre 14px, summary 12px) et un **habillage** via `variant` : `minimal`
(défaut — survol en teinte douce, sélection et élément courant lus comme
une fine barre d'accent sur une rangée teintée) ou `outlined` (survol en
filet, sélection bordée sur trois côtés). Les accents lisent
`--jtd-item-color` (défaut thème : `--jtd-primary`), redéfinissable sur
un conteneur ; une décoration `shape` pose sa propre couleur sur l'anneau
de l'icône. `textOverflow` : `wrap` (défaut) ou `truncate`
(une ligne, ellipse, hauteur fixe).

| Composant | Usage |
| --- | --- |
| `ItemRowShort` | ligne compacte icône + nom ; `summary` en infobulle native ; activation → `onActivate(item, dock)` sinon `onSelect(item)` ; sélection éditable (Switch) via `LabelSelected.*Editable` |
| `ItemRowRich` | ligne large : nom + tags, summary, tooling, actions ; `content` s'ouvre en flottant au survol et au clic |
| `LabelButton` | `ButtonIcon` titré par `summary` (texte) ou `name` ; sans `onActivate`, ouvre `content` en menu contextuel |
| `ItemIcon` | icône seule activable |
| `DrawToolingWidgets(tooling)` | `LabelButton` par entrée + bouton « More actions » (`aria-haspopup="menu"`) ouvrant les entrées `optional` dans un `<Menu>` |

Le Switch d'une sélection éditable est un `ButtonIcon` `aria-pressed`
(« Select » / « Deselect »). `DisplayProps` est un ReactNode ou une
fonction `(label) => ReactNode`. `LabelSelected` est un champ de bits :
`None`, `Enabled`, `Disabled`, `Editable` et combinaisons.

Les erreurs d'activation (`onActivate` qui lève, y compris en async) sont
loguées en console avec le nom de l'item et affichées en toast
`react-toastify` — l'application monte un `ToastContainer` pour les voir.

## 9. Styles et pièges

La cascade (gabarits `jtd-panel-*` (header, body, footer, modal-dock, drawer-dock),
`jtd-panel-floating-dock` + `jtd-panel-floating-{menu,popup,popover}`, `jtd-menu-*`, `jtd-item-*`) est écrite en CSS
natif et injectée au chargement (balise `<style id="jtd-layout-styles">`,
idempotente, sans effet hors navigateur). Couleurs, ombres, rayons et plans
dérivent des tokens `--jtd-*` de @jointhedots/theme.

- Les glyphes internes (fermer, débordement, switch) sont des `bi:` :
  l'application importe `@jointhedots/icon/bootstrap`.
- Le contenu d'un panneau ne voit pas le contexte React de l'appelant :
  passer l'état par la closure de `usePanel` et ses `deps`.
- Les superpositions vivent à la racine de `document.body` : un remappage
  de tokens doit être posé sur `body` pour les atteindre.

## Aide-mémoire

```
createPanel(displayed?, dock?) ; panel.open(dock = panel.defaultDock ?? "side")
usePanel(render, deps, dock?)     // panneau stable, fermé au démontage
Overlays.useModal / useLeftDrawer / useRightDrawer(render, deps)   // open() / switch() sans argument
Overlays.createModal / createLeftDrawer / createRightDrawer / createPopover(target, …)
openDialog(resolve => node, { title, size, height })   // Promise<T | undefined>
openContextualMenu(target, close => <Menu>…</Menu>, opts?)   // Promise + .close()
createFloatingDock(target, { position, variant, className, noAutoClose })
<Menu aria-label> Item / LargeItem (+ children = sous-menu) / Anchor / Separator / Section
Popup content={node | async fn}   // bulle popover au survol
Stack gap padding vertical        // + FlexDock / FixedDock
OverflowStack overflow={fn}       // débordement mesuré
ItemRowShort / ItemRowRich / LabelButton / ItemIcon
avatar / tags / actions / current // ItemProps
onActivate(item, floatingDock)    // dock ancré à la source
```
