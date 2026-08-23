# @jointhedots/input

Champs de saisie Join.The.Dots : `InputData`, piloté par un schéma JSON
(string, enum, textarea, nombre, booléen), et `TextInput`, champ texte simple
avec label.

## Installation

```bash
pnpm add @jointhedots/input
```

Peer dependency : `react` ≥ 18.2.0. Dépend de `@jointhedots/icon` pour les
glyphes et de `@jointhedots/core` pour le type `JSONSchema`.

## Usage

```tsx
import { InputData, TextInput } from "@jointhedots/input"

<InputData
   value={value}
   schema={{ type: "string", enum: ["small", "medium"] }}
   icon="utility:settings"
   onChange={setValue}
/>

<TextInput label="Name" value={name} onChange={setName} />
```

Les styles du package (gabarits `jtd-input_*`) sont injectés automatiquement
au chargement du module — aucun stylesheet à gérer.
