# @jointhedots/input

Champs de saisie Join.The.Dots : `InputData`, piloté par un schéma JSON
(texte typé, zone de texte, fichier, date, nombre, booléen, choix
restreints en menu, radios, segments ou cases à cocher), avec libellé, aide,
erreur et validation (`validateData`) ; `TextInputSchema`, le constructeur
du schéma d'un champ texte typé. Le tooling d'un champ suit le modèle
d'items de @jointhedots/layout (`ToolingProps`), et le déroulant de choix
est un `Menu` flottant de lignes d'items.

## Installation

```bash
pnpm add @jointhedots/input
```

Peer dependency : `react` ≥ 18.2.0. Dépend de `@jointhedots/icon` pour les
glyphes et de `@jointhedots/layout` pour le modèle d'items et les menus
flottants. Le déroulant utilise les glyphes `bi:` : importer
`@jointhedots/icon/bootstrap` dans l'application.

## Usage

```tsx
import { InputData, TextInputSchema } from "@jointhedots/input"

<InputData
   label="Size"
   value={value}
   schema={{ type: "string", oneOf: [{ const: "s", title: "Small" }, { const: "m", title: "Medium" }] }}
   tooling={[{ name: "Reset", icon: "bi:arrow-clockwise", onActivate: reset }]}
   onChange={setValue}
/>

<InputData
   label="API token"
   hint="Found in your account settings"
   value={token}
   schema={TextInputSchema("paste your token", "password")}
   required
   error={tokenError}
   onChange={setToken}
/>
```

Les styles du package (gabarits `jtd-field*`, `jtd-input`, `jtd-select`,
`jtd-choice`) sont injectés automatiquement au chargement du module — aucun
stylesheet à gérer.

## Usage avancé

Widgets par schéma, validation, accessibilité et pièges : voir
[SKILL.md](./SKILL.md).
