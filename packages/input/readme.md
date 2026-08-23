# @jointhedots/input

Champs de saisie Join.The.Dots : `InputData`, piloté par un schéma JSON
(string, enum, textarea, nombre, booléen), et `TextInputSchema`, le
constructeur du schéma d'un champ texte typé. Le tooling d'un champ suit le
modèle d'items de @jointhedots/layout (`ToolingProps`), et le déroulant d'une
énumération est un menu flottant de lignes d'items.

## Installation

```bash
pnpm add @jointhedots/input
```

Peer dependency : `react` ≥ 18.2.0. Dépend de `@jointhedots/core` pour le
type `JSONSchema`, de `@jointhedots/icon` pour les glyphes et de
`@jointhedots/layout` pour le modèle d'items et les menus flottants.

## Usage

```tsx
import { InputData, TextInputSchema } from "@jointhedots/input"

<InputData
   value={value}
   schema={{ type: "string", enum: ["small", "medium"] }}
   icon="utility:settings"
   tooling={[{ name: "Reset", icon: "bi:arrow-clockwise", onActivate: reset }]}
   onChange={setValue}
/>

<InputData
   label="API token"
   value={token}
   schema={TextInputSchema("paste your token", "password")}
   onChange={setToken}
/>
```

Les styles du package (gabarits `jtd-field*`, `jtd-input`, `jtd-select`)
sont injectés automatiquement au chargement du module — aucun stylesheet
à gérer.
