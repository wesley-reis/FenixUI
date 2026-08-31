# FenixUI

Design System Web **nativo** — Web Components + Shadow DOM + Design Tokens.
Independente de framework: funciona em Vue, React, Angular, Svelte, HTML puro, Java/JSP, PHP, .NET.

## Instalação

```bash
npm i @wrrdev/fenix-ui
```

O pacote expõe **subpaths** por componente — importe apenas o que usa e o bundler aplica tree-shaking automático:

```ts
import '@wrrdev/fenix-ui/button';            // registra <fx-button>
import { FenixUI } from '@wrrdev/fenix-ui';  // API de tema/tokens (índice)

FenixUI.theme('dark');
```

> 📦 npm: [`@wrrdev/fenix-ui`](https://www.npmjs.com/package/@wrrdev/fenix-ui) — **v1.0.3**, acesso público.
> Subpaths disponíveis: `./theme`, `./tokens`, `./button`, `./badge`, `./spinner`, `./select`, `./input`, `./switch`, `./textarea`, `./checkbox`, `./radio`, `./calendar`, `./datepicker`, `./multiselect`, `./table`, `./floatlabel`, `./dialog`, `./toast`, `./tooltip`, `./tabs`, `./progress`, `./skeleton`, `./alert`, `./drawer`, `./dropdown`, `./sidebar`, `./pagination`, `./autocomplete`, `./auto-import` e o curinga `./components/*`.


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

Carregue o bundle **UMD** único: ele registra todos os componentes e expõe os globals
`FenixUI` (API de tema/tokens) e `FenixToast` (toasts imperativos).

```html
<!-- jsDelivr (recomendado) — link direto para uso -->
<script src="https://cdn.jsdelivr.net/npm/@wrrdev/fenix-ui@latest/dist/fenix-ui.umd.min.js"></script>

<!-- alternativa: unpkg -->
<!-- <script src="https://unpkg.com/@wrrdev/fenix-ui@latest/dist/fenix-ui.umd.min.js"></script> -->

<!-- ou a última versão publicada -->
<script src="https://cdn.jsdelivr.net/npm/@wrrdev/fenix-ui/dist/fenix-ui.umd.min.js"></script>

<script>
  // tema claro/escuro em runtime (reflete em todos os componentes, incl. Shadow DOM)
  FenixUI.theme('dark');

  // toasts imperativo via global
  FenixToast.success('Salvo!', 'Registro atualizado.');
</script>

<!-- pronto: estas tags já funcionam -->
<fx-button variant="danger" size="sm">Excluir</fx-button>
<fx-badge variant="success">Aprovado</fx-badge>
<fx-toast></fx-toast>

<!--
  🔗 Links diretos para CDN (versão 1.0.3):
  • https://cdn.jsdelivr.net/npm/@wrrdev/fenix-ui@latest/dist/fenix-ui.umd.min.js
  • https://unpkg.com/@wrrdev/fenix-ui@latest/dist/fenix-ui.umd.min.js
-->
```

### Auto Import (plugin Vite/Rollup)

Cansado de importar componente por componente? O plugin `FenixAutoImport` percorre seus arquivos
(`.ts`, `.js`, `.tsx`, `.jsx`, `.vue`, `.html`, `.svelte`) em busca de tags `fx-*` conhecidas e injeta
o `import` do subpath de cada componente **automaticamente** — mantendo o tree-shaking: só entra no
bundle o que é usado, e ele não duplica imports já existentes.

### Instale

```bash
npm i @wrrdev/fenix-ui
npm i -D vite   # ou rollup/webpack
```

### Configure no build

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { FenixAutoImport } from '@wrrdev/fenix-ui/auto-import';

export default defineConfig({
  plugins: [FenixAutoImport()],
});
```

> Opcional: `FenixAutoImport({ packageName: '@minha-empresa/ui' })` reescreve todos os subpaths
> para apontar a outro escopo (útil em monorepos/forks). O padrão é `@wrrdev/fenix-ui`.

### Use sem importar

```html
<!-- Vue / React / Svelte / HTML -->
<fx-button variant="primary">Salvar</fx-button>
<fx-select clearable>
  <option value="sp">São Paulo</option>
</fx-select>

<!-- O plugin injeta estes imports por você: -->
<!-- import '@wrrdev/fenix-ui/button'; -->
<!-- import '@wrrdev/fenix-ui/select'; -->
```

### Componentes suportados

| Tag | Subpath injetado |
|-----|------------------|
| `fx-button` | `@wrrdev/fenix-ui/button` |
| `fx-badge` | `@wrrdev/fenix-ui/badge` |
| `fx-spinner` | `@wrrdev/fenix-ui/spinner` |
| `fx-select` | `@wrrdev/fenix-ui/select` |
| `fx-multiselect` | `@wrrdev/fenix-ui/multiselect` |
| `fx-input` | `@wrrdev/fenix-ui/input` |
| `fx-switch` | `@wrrdev/fenix-ui/switch` |
| `fx-calendar` | `@wrrdev/fenix-ui/calendar` |
| `fx-datepicker` | `@wrrdev/fenix-ui/datepicker` |
| `fx-checkbox` | `@wrrdev/fenix-ui/checkbox` |
| `fx-radio` | `@wrrdev/fenix-ui/radio` |
| `fx-table` | `@wrrdev/fenix-ui/table` |
| `fx-floatlabel` | `@wrrdev/fenix-ui/floatlabel` |
| `fx-textarea` | `@wrrdev/fenix-ui/textarea` |
| `fx-dialog` | `@wrrdev/fenix-ui/dialog` |
| `fx-drawer` | `@wrrdev/fenix-ui/drawer` |
| `fx-toast` | `@wrrdev/fenix-ui/toast` |
| `fx-tooltip` | `@wrrdev/fenix-ui/tooltip` |
| `fx-tabs` | `@wrrdev/fenix-ui/tabs` |
| `fx-tab-panel` | `@wrrdev/fenix-ui/tabs` |
| `fx-progress` | `@wrrdev/fenix-ui/progress` |
| `fx-skeleton` | `@wrrdev/fenix-ui/skeleton` |
| `fx-alert` | `@wrrdev/fenix-ui/alert` |
| `fx-dropdown` | `@wrrdev/fenix-ui/dropdown` |
| `fx-dropdown-item` | `@wrrdev/fenix-ui/dropdown` |
| `fx-pagination` | `@wrrdev/fenix-ui/pagination` |
| `fx-autocomplete` | `@wrrdev/fenix-ui/autocomplete` |

### Compatibilidade com frameworks

| Framework | Suporte |
|-----------|---------|
| Vue 3 / Nuxt | ✅ via Vite/Rollup (inclusive SFC) |
| React / Next | ✅ via Vite/Rollup/Webpack (transform genérico) |
| HTML puro / JSP / .NET / PHP | ✅ use o bundle CDN (`fenix-ui.umd.min.js`) que registra tudo |

## Temas em runtime (sem recompilar)

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

Presets sobrescrevem **apenas** os tokens informados — o restante herda do tema base (claro/escuro).


> 📏 Convenções: elemento `fx-{component}` · token `--fx-{grupo}-{chave}` · tema `light | dark`
> Sem dependência de Tailwind/Vue/React; acessibilidade desde a primeira implementação.
