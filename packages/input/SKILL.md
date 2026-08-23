# SKILL — Usage avancé des champs @jointhedots/input

Ce document détaille le pilotage par schéma de `InputData` et le
constructeur `TextInputSchema`. Tout champ partage la famille de gabarits
`jtd-field*` (styles injectés au chargement, balise
`<style id="jtd-input-styles">`, idempotente, sans effet en SSR), habillée
par les tokens `--jtd-*` de @jointhedots/theme.

## 1. InputData — pilotage par schéma JSON

`InputData` rend le champ correspondant au `schema` (type `JSONSchema` de
@jointhedots/core) et coerce la valeur au changement :

| Schéma | Rendu | Coercion |
| --- | --- | --- |
| `{ type: "string" }` | `<input type="text">` | aucune |
| `{ type: "string", format: T }` | `<input type={T}>` (format = type HTML) | aucune |
| `{ type: "string", enum: […] }` | bouton déroulant → menu d'items | aucune |
| `{ type: "string", format: "textarea" }` | `<textarea>` | aucune |
| `{ type: "number" \| "integer" }` | `<input type="number">` | `Number(value)` |
| `{ type: "boolean" }` | `<input type="checkbox">` | `checked` (booléen) |

Le composant est entièrement contrôlé : `value` + `onChange(next)` — jamais
d'état interne. La coercion garantit que `onChange` reçoit déjà le bon type
pour les schémas numériques et booléens.

Le `default` du schéma est le **texte fantôme** du champ vide (placeholder
du contrôle natif) — le défaut d'un champ texte est sa suggestion.

```tsx
<InputData
   label="Level"
   value={port}
   schema={{ type: "integer" }}
   onChange={setPort}          // reçoit un number
/>
```

## 2. TextInputSchema — le champ texte comme schéma

`TextInputSchema(placeholder, type)` produit le schéma du champ texte :
`placeholder` (string | number) devient le `default`, `type` (tout
`HTMLInputTypeAttribute` — `text`, `password`, `email`, `search`, `tel`…)
devient le `format`. Le rendu sur `InputData` est celui d'un champ texte
typé avec texte fantôme.

```tsx
<InputData
   label="API token"
   value={token}
   schema={TextInputSchema("paste your token", "password")}
   onChange={setToken}
/>
```

## 3. InputData — le déroulant enum

Le schéma `enum` ne rend pas de `<select>` natif : le widget est un bouton
(`jtd-select`, valeur courante + chevron) qui ouvre un menu contextuel
flottant (`openContextualMenu` de @jointhedots/layout, ancré
`"down-left"`, variant menu). Chaque option est un `Menu.Item` — donc une
ligne compacte du modèle d'items (`ItemRowShort` : icône + nom) — où
l'option courante porte `bi:check-lg` et les autres l'icône `blank`
(l'énumération étant de simples chaînes, il n'y a pas d'icône métier à
montrer). Choisir une option ferme le menu et appelle `onChange(option)` ;
une annulation (clic extérieur) laisse la valeur inchangée. Le déroulant
hérite gratuitement du comportement des docks flottants : repositionnement,
fermeture au clic extérieur, empilement.

## 4. InputData — habillage

La boîte bordée est le **composite** `jtd-field-control` : elle enveloppe
l'icône gauche, le champ et les actions droites — les widgets intérieurs sont
nus (ni bordure ni fond), étirés sur la hauteur de la boîte, source unique de
la hauteur du champ (`min-height` 32px). Le focus se lit sur la boîte
(`:focus-within` → filet `--jtd-primary`).

- `label` : libellé affiché au-dessus du champ ;
- `icon` : nom d'icône @jointhedots/icon affiché à gauche dans la boîte
  (`"utility:search"`…) ;
- `size` : `xs` / `sm` / `md` (défaut) / `lg` — mêmes déclinaisons que les
  icônes. Met à l'échelle le composite (hauteur, police, espacements) ;
  icône, tooling et chevron héritent de la fonte du champ. Ne change ni le
  widget ni la coercion ;
- `tooling` : actions affichées à droite dans la boîte — chaque entrée est
  un `ToolingProps` de @jointhedots/layout (un `LabelProps` + `optional`),
  rendu par `DrawToolingWidgets` : pastille `LabelButton` par entrée, les
  entrées `optional` regroupées derrière un bouton débordement
  (three-dots). L'activation passe par `onActivate(label, dock)` — le
  `dock` est un FloatingDock ancré à la source du clic, prêt à recevoir un
  menu ou une bulle.

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
   tooling={[{
      name: "Clear",
      icon: "bi:x-lg",
      summary: "empty the query",
      onActivate: (label, dock) => { setQuery("") },
   }]}
   onChange={setQuery}
/>
```

## 5. Styles et dépendances

Aucune feuille tierce n'est requise : les gabarits consomment les tokens
`--jtd-*` (surface, filet, `--jtd-primary` au focus) et la checkbox native suit
`accent-color: var(--jtd-primary)`. Le package dépend de @jointhedots/core
(`JSONSchema`), @jointhedots/icon et @jointhedots/layout (modèle d'items et
menus flottants) — le graphe reste acyclique :
`theme → icon → button → layout`, `icon → input → layout`.

## Aide-mémoire

```
schema.type + enum          → bouton déroulant (menu d'items de layout)
schema.format               → type du contrôle natif (email, password…)
schema.format: "textarea"   → textarea
schema.default              → texte fantôme (placeholder)
number | integer            → coercé en number
boolean                     → checkbox (booléen)
size: xs | sm | md | lg     → métriques du composite, contenu par héritage
TextInputSchema(placeholder, type)  → schéma du champ texte typé
label                       → libellé du champ
icon                        → icône gauche (nom icon)
tooling: ToolingProps[]     → LabelButton à droite (+ débordement optional)
tooling onActivate(label, dock)  → dock flottant ancré à la source
onChange                    // toujours la valeur coercée du bon type
```
