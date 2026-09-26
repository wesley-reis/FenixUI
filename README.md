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

> 📦 npm: [`@wrrdev/fenix-ui`](https://www.npmjs.com/package/@wrrdev/fenix-ui) — **v1.1.7**, acesso público.
> Subpaths disponíveis: `./theme`, `./tokens`, `./jsx`, `./vue`, `./button`, `./badge`, `./spinner`, `./select`, `./input`, `./switch`, `./textarea`, `./checkbox`, `./radio`, `./calendar`, `./datepicker`, `./multiselect`, `./table`, `./floatlabel`, `./dialog`, `./toast`, `./tooltip`, `./tabs`, `./progress`, `./skeleton`, `./alert`, `./drawer`, `./dropdown`, `./sidebar`, `./pagination`, `./autocomplete`, `./auto-import` e o curinga `./components/*`.


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
  🔗 Links diretos para CDN (versão 1.1.7):
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

### Configuração completa (`FenixUI.configure`)

Alternativa a chamar `theme()`/`setTokens()` separadamente — define tema e tokens numa chamada só:

```ts
import { FenixUI } from '@wrrdev/fenix-ui';

FenixUI.configure({
  theme: 'light',                 // 'light' | 'dark'
  tokens: {
    color: {
      primary: '#0d9488',         // sobrescreve apenas o primary (merge profundo)
    },
    effect: {
      ripple: '1',                // '0' desativa o ripple do fx-button
      'focus-ring': 'none',       // campos sem anel de foco/sobra
      // error-ring/success-ring acompanham o focus-ring automaticamente:
      // desligado, a validação error/success mostra só a borda (sem brilho).
    },
  },
});
```

Grupos de tokens disponíveis: `color`, `surface`, `text`, `border`, `font`, `space`,
`radius`, `size`, `shadow`, `motion`, `effect` e `z` (veja `@wrrdev/fenix-ui/tokens`).

### Presets prontos (temas padrão)

O FenixUI já vem com temas prontos — **não é preciso definir nada**. Basta aplicar:

```ts
import { applyPreset } from '@wrrdev/fenix-ui';

applyPreset('seiya');          // aplica o preset Seiya em modo claro
applyPreset('shiryu', 'dark'); // preset + modo escuro
```

Presets disponíveis: `fenix` (padrão), `seiya`, `shiryu`, `hyoga`, `shun`, `ikki`, `aiolia`.

```ts
import { listPresets } from '@wrrdev/fenix-ui';

listPresets(); // [{ name, label, tokens }, ...] — inclui os presets customizados
```

**Criando seu próprio preset** (fica registrado junto aos padrões):

```ts
import { defineCustomPreset, applyPreset } from '@wrrdev/fenix-ui';

defineCustomPreset('minha-marca', 'Minha Marca', {
  color: { primary: '#7c3aed', secondary: '#a78bfa' },
  radius: { md: '14px' },
});

applyPreset('minha-marca'); // ✅ disponível como qualquer preset nativo
```

**Sobrescrevendo apenas uma config de um preset** (merge profundo — o restante herda):

```ts
import { applyPreset, FenixUI } from '@wrrdev/fenix-ui';

applyPreset('shiryu', 'dark');                          // aplica o tema base
FenixUI.setTokens({ color: { primary: '#0ea5e9' } });   // sobrescreve só o primary
```

> Presets sobrescrevem **apenas** os tokens informados — o restante herda do tema base (claro/escuro).

### Tipagem / autocomplete no TypeScript

A partir da v1.x, importar a lib (ou o subpath `@wrrdev/fenix-ui/jsx`) habilita no TypeScript:

- **autocomplete + validação de atributos** de `fx-*` em TSX/JSX (React, Preact, Vue JSX);
- tipos nomeados por componente (`FxButtonProps`, `FxInputProps`, …) e uniões (`FxSize`, `FxButtonVariant`, …);
- tipagem imperativa de `document.createElement('fx-button')` via `HTMLElementTagNameMap`.

```tsx
import '@wrrdev/fenix-ui'; // registra componentes + habilita as tipagens JSX

<fx-button variant="primary" size="lg" loading>Salvar</fx-button>
```

Se o autocomplete ainda não aparecer, garanta que o `tsconfig` do seu projeto tem
`"moduleResolution": "bundler"` (ou `"node16"`/`"nodenext"`) para resolver os `exports` do pacote.

#### React

- **`"jsx": "react-jsx"` (padrão no Create React App, Vite e Next):** importe o subpath `./react`
  **uma única vez** no `main.tsx` — o namespace `React.JSX` não herda a augmentação global de `JSX`:

```tsx
import '@wrrdev/fenix-ui/react'; // tipa fx-* em React.JSX (react-jsx)

<fx-button variant="primary" size="lg" loading>Salvar</fx-button>
```

- **`"jsx": "react"` clássico / Preact / Vue JSX:** basta `import '@wrrdev/fenix-ui/jsx'`
  (ou importar a lib inteira), que faz a augmentação do namespace global `JSX`.

> Requer `@types/react` instalado no projeto para resolver a augmentação do módulo `react`.

#### Angular

Importe os subpaths dos componentes usados (ou use o plugin Auto Import) e adicione
`CUSTOM_ELEMENTS_SCHEMA` ao componente — templates Angular não são typecheckados como TSX,
mas o código TypeScript imperativo é tipado via `HTMLElementTagNameMap`:

```ts
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import '@wrrdev/fenix-ui/stepper';
import '@wrrdev/fenix-ui/button';

@Component({
  selector: 'app-demo',
  template: `
    <fx-stepper active="0" show-numbers>
      <div slot="step-0" step-title="Dados">Conteúdo do passo.</div>
    </fx-stepper>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // permite tags fx-* no template
})
export class DemoComponent {}
```

#### TypeScript puro / HTML / JSF

Importar a lib (ou qualquer subpath) habilita a tipagem imperativa — `document.createElement('fx-*')`,
classes, propriedades e eventos ficam conhecidos do compilador:

```ts
import '@wrrdev/fenix-ui/button';

const btn = document.createElement('fx-button'); // tipado via HTMLElementTagNameMap
btn.setAttribute('variant', 'primary');
```

Veja a página **Tipagens** da documentação para o guia completo por framework.

#### Vue 3 / Nuxt

No Vue, o autocomplete dos atributos `fx-*` nos templates é habilitado por um módulo próprio.
Importe o subpath `./vue` **uma única vez** no `main.ts`:

```ts
import '@wrrdev/fenix-ui/vue'; // habilita autocomplete de fx-* nos templates SFC
```

**Configuração essencial do Vue 3** — diga ao compilador que `fx-*` são Web Components:

```ts
import { createApp } from 'vue';
import App from './App.vue';
import '@wrrdev/fenix-ui';           // registra todos os componentes
import '@wrrdev/fenix-ui/vue';       // tipos + autocomplete
import { defineFxTooltipDirective } from '@wrrdev/fenix-ui/tooltip';
defineFxTooltipDirective();         // diretiva fx-tooltip="texto"

const app = createApp(App);
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('fx-');
app.mount('#app');
```

Requisitos:

- `vue` ≥ 3.5 (usa `IntrinsicElementAttributes`);
- Volar / vue-tsc (já incluído no `@vue/language-tools` usado pelo VS Code + Volar);
- no `tsconfig`, `"moduleResolution": "bundler"`.

Com isso o editor mostra as propriedades de cada componente (`variant`, `size`, `loading`, …)
nos templates. Para além do autocomplete, **validar** valores inválidos (ex.: `variant="foo"`),
ative o modo estrito do Volar no `tsconfig.json`:

```jsonc
{
  "vueCompilerOptions": {
    "strictTemplates": true
  }
}
```

> Sem `strictTemplates`, o Vue não reporta atributos desconhecidos de elementos nativos
> (comportamento padrão do Volar) — mas o autocomplete das propriedades continua funcionando.
>
> **Para Nuxt:** `isCustomElement` é opção de compilação — configure em `nuxt.config.ts`
> (`vue: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('fx-') } }`) e use um
> plugin `plugins/fenix-ui.client.ts` apenas para os imports (componentes, tema e tipos Volar).

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

### Largura dos campos de formulário

Os campos (fx-input, fx-textarea, fx-autocomplete, fx-select, fx-multiselect)
têm largura padrão fixa, mas ela **respeita CSS externo**: qualquer largura definida no
elemento — folha de estilo, classe do framework (ex.: w-full/w-64 do Tailwind) ou
style inline — vence o default, sem precisar do atributo full:

```html
<fx-input style="width: 320px"></fx-input>
<fx-input class="w-full"></fx-input>
```

O default global também é trocável por tokens: --fx-input-width, --fx-textarea-width,
--fx-autocomplete-width, --fx-multiselect-width e --fx-select-width (com sufixos
-sm/-lg; para o select, --fx-select-min-width). O atributo full continua
disponível como atalho para largura 100%.

Eventos usam o nativo `click` no botão; `input`, `change` e o `change` do select são
`CustomEvent`s **composed** com `detail: { value }` (atravessam o Shadow DOM).

### Tokens de efeito (configuráveis por preset)

```ts
FenixUI.setTokens({
  effect: {
    ripple: '0',        // desativa o efeito ripple do fx-button
    'focus-ring': 'none', // campos sem anel de foco/sobra
    // 'error-ring' e 'success-ring' acompanham o focus-ring (desligado ⇒
    // validação error/success apenas com a borda, sem brilho) — ou defina
    // explicitamente um brilho próprio.
  },
});
```

Presets sobrescrevem **apenas** os tokens informados — o restante herda do tema base (claro/escuro).


> 📏 Convenções: elemento `fx-{component}` · token `--fx-{grupo}-{chave}` · tema `light | dark`
> Sem dependência de Tailwind/Vue/React; acessibilidade desde a primeira implementação.
