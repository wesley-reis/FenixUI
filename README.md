# FenixUI

Design System Web **nativo** — Web Components + Shadow DOM + Design Tokens.
Independente de framework: funciona em Vue, React, Angular, Svelte, HTML puro, Java/JSP, PHP, .NET.

## Arquitetura (por que tree-shaking de verdade)

```
src/
├── core/                  # NÚCLEO compartilhado
│   ├── tokens.ts          # Design Tokens (claro/escuro) → var(--fx-*)
│   ├── theme.ts           # API global: FenixUI.configure/theme/setTokens/resetTheme
│   ├── base.ts            # FxElement: classe-base (Shadow DOM + render)
│   ├── define.ts          # registro seguro no CustomElementRegistry
│   └── css.ts             # helpers CSS
└── components/
    ├── button/            # cada componente importa APENAS o core
    ├── badge/
    └── spinner/
```

O build usa **Rollup `preserveModules`**: o `dist/` espelha o `src/`, um arquivo por módulo.
Quando o cliente importa apenas um componente, o bundler dele puxa **somente** esse módulo +
o core compartilhado — nunca a biblioteca inteira:

```ts
// O cliente compila apenas Button + core (~9 kB não-minificado).
import '@wrrdev/fenix-ui/button';
import { FenixUI } from '@wrrdev/fenix-ui/theme';

FenixUI.theme('dark');
```

> Verificação real: bundle de consumidor contendo apenas `fx-button` e o core;
> `fx-badge`/`fx-spinner` ficaram **fora** do output do cliente.

## Consumo

### npm + bundler (recomendado — tree-shaking automático)

```ts
import '@wrrdev/fenix-ui/button';
import '@wrrdev/fenix-ui/badge';

const el = document.createElement('fx-button');
el.setAttribute('variant', 'primary');
el.textContent = 'Salvar';
document.body.append(el);
```

### CDN / HTML puro / JSP / .NET

```html
<script src="https://cdn.exemplo.com/fenix-ui@0.1.0/dist/fenix-ui.umd.min.js"></script>
<script>
  FenixUI.configure({ theme: 'dark' });
</script>

<fx-button variant="danger" size="sm">Excluir</fx-button>
<fx-badge variant="success">Aprovado</fx-badge>
```

### Temas em runtime (sem recompilar)

```ts
FenixUI.theme('dark');                                  // claro | escuro
FenixUI.setTokens({ color: { primary: '#0d9488' } });   // override parcial profundo
FenixUI.resetTheme();
```

Os tokens viram CSS Custom Properties (`--fx-color-primary`, `--fx-radius-md`, …) no `:root`,
atravessando o Shadow DOM. Todo componente reage automaticamente.

## Componentes (fase 1)

| Elemento     | Atributos principais                          | Slots        |
|--------------|-----------------------------------------------|--------------|
| `fx-button`  | `variant` (primary/secondary/success/warning/danger/ghost/outline), `size`, `disabled`, `loading`, `type`, `full` | default, `icon` |
| `fx-badge`   | `variant` (default/primary/success/warning/danger/info), `round` | default |
| `fx-input`   | `type` (text/number/email/password/search/tel/url), `value`, `size`, `placeholder`, `disabled`, `readonly`, `min/max/step` | — |
| `fx-select`  | `value`, `size` (sm/md/lg), `disabled`, `placeholder` — filhos `<option>` nativos | `(padrão)` |
| `fx-switch`  | `checked`, `disabled`, `size` (sm/md/lg)      | `(padrão)`   |
| `fx-spinner` | `size` (sm/md/lg)                             | —            |

Todos os componentes com tamanho usam **`md` como padrão** (valores inválidos caem para `md`).
Escala alinhada ao mercado (Material/Ant): **sm ≈ 32px · md ≈ 40px (padrão) · lg ≈ 48px**.

Eventos usam o nativo `click` no botão; `input`, `change` e o `change` do select são
`CustomEvent`s **composed** com `detail: { value }` (atravessam o Shadow DOM).

### Tokens de efeito (configuráveis por preset)

```ts
FenixUI.setTokens({
  effect: {
    ripple: '0',        // desativa o efeito ripple do fx-button
    'focus-ring': 'none', // campos sem anel de foco/sobra
  },
});
```

Presets sobrescrevem **apenas** os tokens informados — o restante herda do tema
base (claro/escuro) via deep merge (`deepMerge`).

## Scripts

| Comando              | Ação                                                        |
|----------------------|-------------------------------------------------------------|
| `npm run dev`        | Playground local (`index.html`)                             |
| `npm run test`       | Testes unitários (Vitest + jsdom)                           |
| `npm run typecheck`  | TypeScript estrito                                          |
| `npm run build`      | ESM modular + `.d.ts` + bundle CDN UMD                      |

## Convenções

- Elemento: `fx-{component}` · Token: `--fx-{grupo}-{chave}` · Tema: `light | dark`
- Sem dependência de Tailwind/Vue/React; reset interno mínimo; acessibilidade desde a primeira implementação.
