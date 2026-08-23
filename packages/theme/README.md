# @jointhedots/theme

Thème global des applications Join.The.Dots : éclairage clair/sombre, thème
contrasté, contexte React et styles de base (tokens CSS + SLDS).

## Installation

```bash
pnpm add @jointhedots/theme
```

Peer dependency : `react` ≥ 18.2.0.

## Usage

```tsx
import "@jointhedots/theme"        // side-effect: styles + thème par défaut
import { LocalTheme, LightTheme } from "@jointhedots/theme"

<LocalTheme theme={LightTheme}>
   <MyApp />
</LocalTheme>
```

Un simple `import "@jointhedots/theme"` suffit pour la plupart des
applications : le thème par défaut est détecté (préférence système ou
préférence enregistrée), les classes `theme-dark`/`theme-light` sont posées
sur `<body>`, et les styles sont injectés — aucun stylesheet à gérer.

## Usage avancé

Contrat complet (éclairage, contraste, persistance, injection), voir
[SKILL.md](./SKILL.md).
