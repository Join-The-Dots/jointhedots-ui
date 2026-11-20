# SKILL — Usage avancé des champs @jointhedots/input

Ce document détaille le pilotage par schéma de `InputData`, la validation
`validateData` et le constructeur `TextInputSchema`. Tout champ partage la
famille de gabarits `jtd-field*` (CSS natif injecté au chargement, balise
`<style id="jtd-input-styles">`, idempotente, sans effet hors navigateur),
habillée par les tokens `--jtd-*` de @jointhedots/theme.

## 1. Le schéma — `JSONSchema`

`JSONSchema` est un sous-ensemble typé de JSON Schema :

| Champ | Rôle |
| --- | --- |
| `type` | `string`, `number`, `integer`, `boolean`, `array` |
| `format` | type du contrôle texte (voir §2) |
| `enum` / `oneOf: [{ const, title }]` | choix restreints |
| `items` | schéma des éléments d'un `array` (porte ses choix) |
| `default` | valeur par défaut — **jamais** affichée par le champ |
| `examples` | `examples[0]` est le texte fantôme du champ vide |
| `minLength`, `maxLength`, `pattern` | contraintes de chaîne |
| `minimum`, `maximum`, `multipleOf` | contraintes numériques |
| `minItems`, `maxItems` | contraintes de sélection multiple |
| `contentMediaType` | types acceptés d'un champ fichier |

`getSchemaOptions(schema)` renvoie les choix restreints `{ value, label }[]` :
les constantes de `oneOf` avec leur `title` (à défaut, la constante en
texte), sinon les valeurs d'`enum` ; `undefined` sans choix.

## 2. InputData — le widget choisi par le schéma

`InputData` est entièrement contrôlé (`value` + `onChange(next)`) et coerce
la valeur au type du schéma :

| Schéma | Rendu | `onChange` reçoit |
| --- | --- | --- |
| `string` | `<input type="text">` | la chaîne |
| `string` + `format: F` | `<input type={F}>` (`email`, `password`, `search`, `tel`, `url`, `date`, `time`…) | la chaîne |
| `format: "date-time"` | `<input type="datetime-local">` | la chaîne |
| `format: "textarea"` | `<textarea>` (`rows`, défaut 3) | la chaîne |
| `format: "file"` | `<input type="file" accept={contentMediaType}>` | le `File` choisi |
| `number` / `integer` | `<input type="number">` | un `number`, `undefined` si vidé |
| `boolean` | case à cocher dans un `<label>` | un booléen |
| choix (`enum` / `oneOf`) | bouton déroulant → `Menu` (§4) | la valeur de l'option |
| choix + `variant: "radio"` | groupe de radios (`role="radiogroup"`) | la valeur de l'option |
| choix + `variant: "segmented"` | radios en contrôle segmenté | la valeur de l'option |
| `array` + `items` à choix | groupe de cases à cocher (`role="group"`) | le tableau des valeurs cochées, dans l'ordre des options |

Contraintes reportées sur le contrôle natif : `minLength` / `maxLength`
(texte et zone de texte), `pattern` (texte), `minimum` / `maximum` → `min` /
`max`, `multipleOf` → `step` (sinon `1` pour `integer`, `any` pour
`number`).

Le texte fantôme est `placeholder`, sinon `schema.examples[0]` ; le
`default` du schéma n'est jamais un texte fantôme.

## 3. InputData — libellé, aide, erreur, validation

| Prop | Rôle |
| --- | --- |
| `label` | vrai `<label for>` du contrôle (`<legend>` d'un groupe de choix, texte de la case pour un booléen) |
| `hint` | aide sous le champ, reliée par `aria-describedby` |
| `error` | erreur sous le champ (`role="alert"`) : pose `aria-invalid`, l'ajoute à `aria-describedby` et la classe `jtd-field--invalid` (filet `--jtd-error`) |
| `onValidate(error \| undefined)` | reçoit le résultat de `validateData(schema, value, required)` à chaque changement de `schema`, `value` ou `required` |
| `required` | attribut natif + contrainte `required` de la validation |

Le champ n'affiche jamais seul le résultat de la validation : l'appelant
décide quand le montrer (au blur, à la soumission) en le repassant dans
`error`.

```tsx
const [error, setError] = useState<ValidationError>()
const [touched, setTouched] = useState(false)

<InputData
   label="Email"
   hint="Used for notifications"
   value={email}
   schema={emailSchema}
   required
   error={touched ? error?.message : undefined}
   onValidate={setError}
   onBlur={() => setTouched(true)}
   onChange={setEmail}
/>
```

### validateData

`validateData(schema, value, required?)` renvoie la **première** contrainte
violée `{ code, message }`, ou `undefined` :

| `code` | Condition |
| --- | --- |
| `required` | valeur vide (`undefined`, `null`, `""`, tableau vide) et `required` |
| `minLength` / `maxLength` | longueur d'une chaîne |
| `pattern` | chaîne ne correspondant pas à `pattern` (regex Unicode) |
| `format` | chaîne invalide pour `email`, `url` ou `uri` |
| `integer` | nombre non entier sous `type: "integer"` |
| `minimum` / `maximum` | bornes d'un nombre |
| `minItems` / `maxItems` | taille d'un tableau |

Une valeur vide non requise est valide. Les autres formats, `multipleOf`,
l'appartenance aux choix et le type ne sont pas vérifiés. Les messages sont
en anglais ; `code` permet de les remplacer.

## 4. InputData — le déroulant de choix

Le variant `select` (défaut) ne rend pas de `<select>` natif : le widget est
un bouton (`jtd-select`, `aria-haspopup="menu"`, libellé de l'option
courante — ou texte fantôme — et chevron) qui ouvre un menu contextuel
flottant (`openContextualMenu` de @jointhedots/layout, ancré
`"down-left"`). Le menu est un `<Menu>` de `Menu.Item` (ligne compacte du
modèle d'items) : l'option courante porte `current` (`aria-current`) et
l'icône `bi:check-lg`, les autres `blank`. Le menu prend le focus et se
parcourt aux flèches ; choisir une option ferme le menu et appelle
`onChange(option.value)` ; Escape ou un clic extérieur laisse la valeur
inchangée. Avec `oneOf`, le menu affiche les `title` et `onChange` reçoit
les constantes.

## 5. InputData — habillage

La boîte bordée est le **composite** `jtd-field-control` : elle enveloppe
l'icône gauche, le contrôle et les actions droites — les widgets intérieurs
sont nus (ni bordure ni fond), étirés sur la hauteur de la boîte, source
unique de la hauteur du champ (`min-height` 32px). Le focus se lit sur la
boîte (`:focus-within` → filet `--jtd-primary`).

- `icon` : nom d'icône @jointhedots/icon affiché à gauche dans la boîte ;
- `size` : `xs` / `sm` / `md` (défaut) / `lg` — met à l'échelle le composite
  (hauteur 18/24/32/40 px, police, espacements) ; icône, tooling et chevron
  héritent de la fonte. Ne change ni le widget ni la coercion ;
- `tooling` : actions affichées à droite dans la boîte — chaque entrée est
  un `ToolingProps` de @jointhedots/layout, rendu par `DrawToolingWidgets`
  (pastille `LabelButton` par entrée, entrées `optional` derrière un bouton
  de débordement). `onActivate(label, dock)` reçoit un FloatingDock ancré
  à la source du clic ;
- `monospace` : police `--jtd-font-mono` (texte, zone de texte) ;
- `autoGrow` : la zone de texte suit la hauteur de son contenu ;
- `suggestions` : valeurs proposées d'un champ texte (`<datalist>`) ;
- `className` : ajoutée au conteneur `jtd-field`.

La case à cocher booléenne et les groupes de choix échappent au composite.
L'espacement entre champs appartient au conteneur (Stack, formulaire) — le
gabarit `jtd-field` n'impose aucune marge.

## 6. InputData — attributs natifs et référence

`id` (sinon généré — il relie `label`, aide et erreur), `name`, `disabled`,
`readOnly`, `required`, `autoFocus`, `autoComplete` (champs texte),
`onBlur`, `onKeyDown` sont transmis au contrôle natif. `ref` (forwardRef)
reçoit ce contrôle : `<input>`, `<textarea>` ou le `<button>` du déroulant.

`readOnly` désactive le déroulant et les choix ; une case booléenne en
lecture seule ignore le clic. Dans un groupe de radios ou de cases, `name`
(sinon l'`id`) nomme les entrées ; `ref`, `onBlur` et `onKeyDown` n'y sont
pas reliés.

## 7. TextInputSchema — le champ texte comme schéma

`TextInputSchema(placeholder, type)` produit
`{ type: "string", format: type, examples: [placeholder] }` : `type` (tout
`HTMLInputTypeAttribute`) devient le type du contrôle, `placeholder` son
texte fantôme.

```tsx
<InputData
   label="API token"
   value={token}
   schema={TextInputSchema("paste your token", "password")}
   onChange={setToken}
/>
```

## 8. Pièges

- `onValidate` dépend de l'identité de `schema` : un schéma littéral recréé
  à chaque rendu rappelle `onValidate` à chaque rendu — mémoïser le schéma
  ou le déclarer hors du composant.
- Le déroulant utilise les glyphes `bi:` (`bi:chevron-down`,
  `bi:check-lg`) : l'application importe `@jointhedots/icon/bootstrap`.
- `value` d'un groupe de cases est un tableau ; `undefined` vaut aucun
  choix.

## 9. Dépendances

Aucune feuille tierce n'est requise : les gabarits consomment les tokens
`--jtd-*` et la case native suit `accent-color: var(--jtd-primary)`. Le
package dépend de @jointhedots/icon (glyphes) et @jointhedots/layout
(modèle d'items, menus flottants) — le graphe reste acyclique :
`theme → icon → button → layout → input`.

## Aide-mémoire

```
string (+ format)              → input typé ; date-time → datetime-local
format: "textarea" | "file"    → textarea (rows, autoGrow) | fichier (File)
number | integer               → number, undefined si vide ; min/max/step
boolean                        → case dans un label
enum | oneOf [{const,title}]   → déroulant Menu ; variant radio | segmented
array + items à choix          → cases à cocher (tableau)
placeholder ?? examples[0]     → texte fantôme (jamais default)
label / hint / error           → label for, aria-describedby, aria-invalid
onValidate(err | undefined)    ← validateData(schema, value, required)
suggestions                    → datalist
size: xs | sm | md | lg        → métriques du composite
icon / tooling                 → icône gauche / actions droites
ref                            → contrôle natif
TextInputSchema(placeholder, type)
getSchemaOptions(schema)       → [{ value, label }]
```
