# SKILL — Usage avancé des champs @jointhedots/input

Ce document détaille le pilotage par schéma de `InputData` et le contrat de
`TextInput`.

## 1. InputData — pilotage par schéma JSON

`InputData` rend le champ correspondant au `schema` (type `JSONSchema` de
@jointhedots/core) et coerce la valeur au changement :

| Schéma | Rendu | Coercion |
| --- | --- | --- |
| `{ type: "string" }` | `<input type="text">` | aucune |
| `{ type: "string", enum: […] }` | `<select>` | aucune |
| `{ type: "string", format: "textarea" }` | `<textarea>` | aucune |
| `{ type: "number" \| "integer" }` | `<input type="number">` | `Number(value)` |
| `{ type: "boolean" }` | `<input type="checkbox">` | `checked` (booléen) |

Le composant est entièrement contrôlé : `value` + `onChange(next)` — jamais
d'état interne. La coercion garantit que `onChange` reçoit déjà le bon type
pour les schémas numériques et booléens.

```tsx
<InputData
   value={port}
   schema={{ type: "integer" }}
   onChange={setPort}          // reçoit un number
/>
```

## 2. InputData — habillage SLDS

Le rendu suit le gabarit SLDS `slds-form-element` avec zone d'icônes
gauche/droite :

- `icon` : nom d'icône @jointhedots/icon affiché à gauche du champ
  (`"utility:search"`…).
- `tooling` : liste d'actions affichées à droite — chaque entrée est un
  `{ icon, onClick }` rendu comme bouton-icône SLDS.

```tsx
<InputData
   value={query}
   schema={{ type: "string" }}
   icon="utility:search"
   tooling={[{ icon: "bi:x-lg", onClick: clear }]}
   onChange={setQuery}
/>
```

Le type `label` du prop est accepté mais le rendu actuel affiche un libellé
statique — le label dynamique est la seule limite connue du composant.

Un spinner décoratif SLDS est présent dans la zone droite (marquage
`role="status"`).

## 3. TextInput — champ texte simple

`TextInput` est le champ texte minimal (gabarit `jtd-input_*`, styles injectés
au chargement du package) :

| Prop | Rôle |
| --- | --- |
| `label` | libellé au-dessus du champ |
| `value` / `onChange(val)` | contrôlé ; `onChange` reçoit la **chaîne** |
| `placeholder` | texte fantôme (défaut `""`) |
| `type` | tout `HTMLInputTypeAttribute` (`text`, `password`, `email`…) |

```tsx
<TextInput label="API key" type="password" value={key} onChange={setKey} />
```

## 4. Styles et dépendances

Les styles des deux composants sont compilés puis injectés au chargement
(balise `<style id="jtd-input-styles">`, idempotent, sans effet en SSR) —
aucun stylesheet à gérer. Le bi-thème est natif : `jtd-input_*` utilise
`light-dark()` et les gabarits SLDS (`slds-input`, labels) sont remappés sur
les tokens `--app-*` par la cascade dark de @jointhedots/theme. Le rendu SLDS
de `InputData` suppose la feuille SLDS chargée (le package `@jointhedots/theme`
ou `@jointhedots/button` l'apportent déjà dans un empilement typique).

## Aide-mémoire

```
schema.type + enum          → select
schema.format: "textarea"   → textarea
number | integer            → coercé en number
boolean                     → checkbox (booléen)
icon                        → icône gauche (nom icon)
tooling: [{icon, onClick}]  → boutons d'action à droite
TextInput: type=…           → password, email, …
onChange                    → toujours la valeur coercée du bon type
```
