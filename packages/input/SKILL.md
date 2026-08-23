# SKILL — Usage avancé des champs @jointhedots/input

Ce document détaille le pilotage par schéma de `InputData` et le contrat de
`TextInput`. Les deux composants partagent la famille de gabarits `jtd-field*`
(styles injectés au chargement, balise `<style id="jtd-input-styles">`,
idempotente, sans effet en SSR), habillée par les tokens `--jtd-*` de
@jointhedots/theme.

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
   label="Level"
   value={port}
   schema={{ type: "integer" }}
   onChange={setPort}          // reçoit un number
/>
```

## 2. InputData — habillage

La boîte bordée est le **composite** `jtd-field-control` : elle enveloppe
l'icône gauche, le champ et les actions droites — les widgets intérieurs sont
nus (ni bordure ni fond), étirés sur la hauteur de la boîte, source unique de
la hauteur du champ (`min-height` 32px). Le focus se lit sur la boîte
(`:focus-within` → filet accent).

- `label` : libellé affiché au-dessus du champ ;
- `icon` : nom d'icône @jointhedots/icon affiché à gauche dans la boîte
  (`"utility:search"`…) ;
- `tooling` : liste d'actions affichées à droite dans la boîte — chaque entrée
  est un `{ icon, onClick }` rendu comme bouton-icône (`jtd-field-action`),
  le `onClick` est câblé.

Le schéma `boolean` rend une checkbox nue, hors boîte composite (une coche
seule dans une boîte bordée serait du bruit). L'espacement entre champs
appartient au conteneur (Stack, formulaire) — le gabarit `jtd-field` n'impose
aucune marge.

```tsx
<InputData
   label="Query"
   value={query}
   schema={{ type: "string" }}
   icon="utility:search"
   tooling={[{ icon: "bi:x-lg", onClick: clear }]}
   onChange={setQuery}
/>
```

## 3. TextInput — champ texte simple

`TextInput` est le champ texte minimal, sur la même famille de gabarits :

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

Aucune feuille tierce n'est requise : les gabarits consomment les tokens
`--jtd-*` (surface, filet, accent au focus) et la checkbox native suit
`accent-color: var(--jtd-accent)`. Le package ne dépend que de
@jointhedots/core et @jointhedots/icon.

## Aide-mémoire

```
schema.type + enum          → select
schema.format: "textarea"   → textarea
number | integer            → coercé en number
boolean                     → checkbox (booléen)
label                       → libellé du champ
icon                        → icône gauche (nom icon)
tooling: [{icon, onClick}]  → boutons d'action à droite
TextInput: type=…           → password, email, …
onChange                    // toujours la valeur coercée du bon type
```
