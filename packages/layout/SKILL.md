# SKILL — Usage avancé du layout @jointhedots/layout

Ce document détaille le modèle de panneaux et docks, les fonctions d'ouverture
asynchrones, les empilements et le modèle d'items.

## 1. Le modèle Panel / Dock

Un **panneau** est une description affichable (`PanelDisplay` :

```ts
{
   icon?, title?,          // en-tête (selon dock)
   content: ReactNode,     // corps
   tooling?: ToolingProps[],  // actions d'en-tête (rendu ItemRow)
   closable?, height?,     // hauteur min/max (dock modal/drawer)
   onClose?: () => void,   // notifié à la fermeture
}
```

) associée à un **dock** qui décide du placement. Le panneau est un objet
imperatif :

```ts
const panel = createPanel()
panel.display({ content: <Foo /> })
panel.open("side")     // dock nommé : "side" | "modal" | "default"
panel.close()
```

`display` est idempotent et différentiel : rappeler `display` avec un contenu
équivalent ne re-rend pas ; un contenu différent met à jour le panneau en
place (comparaison par `areSimilarObjects` de @jointhedots/core). Passer
`null`/`undefined` ferme le panneau.

Le hook `usePanel(render, deps)` gère le cycle de vie React : `render(panel)`
retourne (ou promet) un `PanelDisplay`, re-évalué quand `deps` change, et le
panneau est fermé au démontage.

```tsx
const panel = usePanel(async () => ({ content: await buildContent(data) }), [data])
```

## 2. Les docks

| Dock | Comportement |
| --- | --- |
| `DrawerDock` (side) | tiroir latéral ancré droite/gauche, redimensionnable à la souris (bornes min/max/défaut), en-tête riche `ItemRowRich` |
| `ModalDock` | superposition centrée, empilable, hauteur contrôlée par `height` (CSS `--jtd-panel-min/max-height`) |
| `FloatingDock` | surcouche ancrée à une cible, repositionnée en continu (25 ms), refermée au clic extérieur ou survol sortant ; `variant: "popover"` rend une bulle avec flèche pointant la cible |

Les docks nommés (`side`, `modal`) sont des singletons ; un dock personnalisé
peut implémenter `PanelDock` (`appendPanel` / `removePanel` / `refresh`) et
être passé à `panel.open(monDock)`.

La pile `overlays_stack` maintient l'ordre d'empilement ; `getStackZIndex`
produit les z-index (base 10000000 + 1000/niveau). L'ouverture d'un
floating dock purge les docks supérieurs qui ne contiennent pas sa cible —
c'est ce qui referme les sous-menus.

## 3. Les ouvertures asynchrones

### openDialog

```tsx
const value = await openDialog<string>(resolve => (
   <MyForm onSubmit={resolve} />
), "400px")      // hauteur optionnelle
```

Retourne la valeur passée à `resolve`, ou `undefined` si fermé sans résoudre
(bouton fermer, clic extérieur). `content` est re-rendu dans un `ModalDock`.

### openContextualMenu

```tsx
const action = await openContextualMenu(event, close => (
   <Menu>
      <Menu.Item name="Open" icon="bi:folder2-open" onClick={() => close("open")} />
      <Menu.Item name="Delete" icon="bi:trash" onClick={() => close("delete")} />
   </Menu>
))
if (action === "delete") …
```

La **cible** peut être un `UIEvent` (clic), un `Element`, un
`React.SyntheticEvent` ou une classe React — les événements cliquables sont
automatiquement `stopPropagation`/`preventDefault`. La promise retournée
expose `promise.close()` pour refermer programmatiquement. Options du dock
flottant : `position` (voir computeEdgeBox), `variant: "menu" | "popup" |
"popover"`, `className`, `noAutoClose`.

Le variant **popover** est la bulle classique : coins arrondis, ombre portée,
et une **flèche** (losange CSS) collée au bord qui pointe vers le centre de la
cible. Le côté porteur de la flèche se déduit du placement effectif (après
retournement par computeEdgeBox) : bulle sous la cible → flèche en haut
(pointe vers le haut), etc. Le décalage le long du bord suit le centre de la
cible, borné aux marges de la bulle — tout est recalculé à chaque repositionnement
(25 ms), donc la flèche suit une cible mobile.

`PopupCancel` (sous-classe d'`Error`) est le signal d'annulation du modèle.

## 4. Le composant Menu

Menu composé (pas de JSX wrapper — les items sont directement enfants) :

```tsx
<Menu.Anchor onClick={toggle}>…</Menu.Anchor>       // zone d'ancrage stylée
<Menu.Item name="Save" icon="bi:save" onClick={…} />        // rend ItemRowShort
<Menu.LargeItem …>…sous-menu…</Menu.LargeItem>     // rend ItemRowRich + hover
<Menu.Separator />                                  // trait
<Menu.Section title="Actions">…</Menu.Section>     // séparé titré
```

`Menu.Item` / `Menu.LargeItem` acceptent un `children` : au survol de l'item,
un sous-menu flottant s'ouvre automatiquement (fermeture au survol sortant),
et au clic si aucun `onClick` n'est défini.

## 5. Popup et Stack

- `Popup` : bulle au survol de n'importe quel enfant —
  `<Popup content={…}>{anchor}</Popup>`. Le contenu peut être une fonction
  async `(data) => Promise<ReactNode>` évaluée à l'ouverture. Props :
  `variant` (défaut `"popover"` — bulle fléchée ; `"menu"` / `"popup"` pour
  les gabarits nus), `position` (PlacementType, ex. `"up-right"`), `className`
  (transmis au wrapper, p.ex. pour un affichage inline).
- `Stack` : conteneur flex à espacement (`gap` = 4 par défaut, `padding` =
  gap/2, `vertical` pour une colonne). Sous-composants `Stack.FlexDock`
  (poids flexible + largeur min) et `Stack.FixedDock` (largeur fixe).
- `OverflowStack` : cache les enfants qui débordent et rend un bouton
  débordement (chevrons) ouvrant la suite dans un dock flottant ; fournir
  `overflow: ({children}) => ReactNode` pour un rendu personnalisé du
  déclencheur. Mesure par `ResizeObserver` + re-layout au resize.

## 6. Le modèle d'items

Les items sont le modèle de données commun des listes/menus/panneaux :

```ts
LabelProps = {
   name: string,                  // affiché (et fallback d'icône avatar)
   icon?: string,                 // nom d'icône explicite
   decorations?: (ShapeDecoration | BadgeDecoration)[],   // forme colorée / badge en coin
   tooling?: ToolingProps[],      // actions (rendu DrawToolingWidgets)
   summary?: ReactNode,           // description courte (tooltip natif)
   tooltip?: DisplayProps,        // tooltip flottant au survol
   content?: DisplayProps,        // contenu flottant au survol/clic
   data?: T,                      // charge utile libre
   onActivate?: (label, dock) => void    // activation : reçoit un FloatingDock collé à l'élément
}
ItemProps = LabelProps & { tags?, selected?, onSelect? }
```

Composants de rendu :

| Composant | Usage |
| --- | --- |
| `ItemRowShort` | ligne compacte icône + nom ; clic → `onActivate(item, floatingDock)` ; sélection éditable (Switch) via `LabelSelected.EnabledEditable` / `DisabledEditable` |
| `ItemRowRich` | ligne large avec summary, tooling, survol de `content` dans un dock flottant |
| `LabelButton` | pastille `ButtonIcon` activable ; sans `onActivate`, ouvre `content` en menu contextuel |
| `ItemIcon` | icône seule activable |
| `DrawToolingWidgets(tooling)` | rend une liste de `LabelButton` + bouton débordement (three-dots) pour les entrées `optional` |

`DisplayProps` est un ReactNode ou une fonction `(label) => ReactNode`.
`LabelSelected` est un champ de bits : `None`, `Enabled`, `Disabled`,
`Editable` et combinaisons.

Les erreurs d'activation (`onActivate` qui throw async) sont remontées en
toast (`react-toastify`) et loguées en console avec le nom de l'item.

## 7. Positionnement — computeEdgeBox

`PositionType` est un masque binaire combinant direction verticale et
horizontale (chaînes documentées : `"down-right"`, `"up-left"`, `"down-left"`,
`"up-right"`…). `computeEdgeBoxDOM(position, element, tracked, host?)` place
`element` au plus près de la position demandée autour de `tracked`, en
retournant le côté quand la place manque (marge 5 px), relative à `host`
(défaut : viewport). C'est le moteur de placement des docks flottants,
réutilisable pour tout popover maison.

## 8. Styles

La cascade compilée (gabarits `jtd-panel-*`, `jtd-menu-*`, `jtd-item-*`) est
injectée au chargement (balise `<style id="jtd-layout-styles">`, idempotent,
sans effet en SSR). Les variables notables : `--jtd-floating-zindex` (dock
flottant), `--jtd-panel-min-height` / `--jtd-panel-max-height` (modal).

## Aide-mémoire

```
createPanel().display({content}).open("side" | "modal" | dock)
usePanel(render, deps)            // cycle de vie React
openDialog(resolve => node)       // Promise<T | undefined>
openContextualMenu(e, close => node, opts?)   // Promise + .close()
Menu.Item / LargeItem + children  // sous-menus au survol
Popup content={node | async fn}   // bulle popover au survol (par défaut)
Popup position="up-right" variant="menu" className=…
Stack gap padding vertical        // + FlexDock / FixedDock
OverflowStack overflow={fn}       // débordement mesuré
ItemRowShort / Rich / LabelButton / ItemIcon
onActivate(item, floatingDock)    // dock collé à la source
LabelSelected flags               // sélection + édition
computeEdgeBoxDOM(position, el, tracked)     // placement maison
```
