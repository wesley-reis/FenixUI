# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) ·
Versionamento [SemVer](https://semver.org/lang/pt-BR/).
Histórico anterior à 1.2.0: [releases do GitHub](https://github.com/wesley-reis/FenixUI/releases).

## [Não lançado]

### Corrigido

- **Ícones no bundle CDN/UMD (`fenix-ui.umd.min.js`)**: o `@font-face` saía com
  `url('./fenix-icons.woff2')` — caminho relativo que um `<style>` inline resolve
  contra a PÁGINA, não contra o script. Em qualquer página fora da raiz (ex.:
  `/app/home.jsp`) a fonte dava **404** e os ícones apareciam como **texto**
  (`home`, `search`). A URL agora é absolutizada contra a URL do script que
  carregou o bundle (`document.currentScript`, com fallback para a base do
  documento). Vale para `<fx-icon>`, para a classe `fx-icon fx-icon-<nome>` e
  para o atributo `icon` de todos os componentes.
- **Global `FenixUI` ausente no bundle CDN/UMD**: o entry `src/cdn.ts` não tinha
  exports, então o Rollup não gerava global nenhum e `FenixUI.theme('dark')`
  (snippet do README/doc) falhava com `ReferenceError` — só `FenixToast` era
  exposto, por atribuição explícita em `toast.ts`. O bundle passa a expor
  `FenixUI.theme`/`setTokens`/`configure`/`resetTheme`,
  `FenixUI.applyPreset`/`defineCustomPreset`/`listPresets` e
  `FenixUI.setFenixIconsFontUrl` (subset de ícones).
- **`fx-drawer` — header sem título e conteúdo passando por cima dele**: o
  header (com o ✕) só era renderizado quando havia `title`, então um drawer sem
  título ficava sem nenhum jeito de fechar pelo mouse. O header passa a ser
  renderizado sempre (o `<span class="title">` só recebe texto se houver
  título). O `z-index: 1` do header virou o token `--fx-drawer-header-z`
  (**20**): o Shadow DOM não cria stacking context, então o `.loading-overlay`
  do `fx-table` (`z-index: 10`) pintava por cima do header sticky.
- **`fx-toast` atrás do modal com overlay desfocado**: a região dos toasts era
  criada com `z-index: 1100` fixo no inline style — exatamente o valor de
  `--fx-z-modal`, então o overlay do drawer/dialog (que entra depois no DOM)
  cobria a notificação. A região passa a usar o token `--fx-z-toast` (**1200**)
  por uma regra `[data-fx-toast-region]`, continuando reativa ao tema.
- **`fx-button` variante `outline` "acinzentado"**: o fundo era `transparent`,
  deixando a superfície cinza do card/página aparecer através do botão. Agora o
  `outline` tem fundo sólido claro (`--fx-button-outline-bg`, padrão
  `--fx-surface-background`) com hover em `color-mix` de 10% da cor primária.

### Adicionado

- **`exemplos/cdn-icons.html`**: página de smoke test do CDN com painel de
  diagnóstico (URL do `@font-face`, status HTTP da fonte, `document.fonts`,
  globais do UMD) e todos os usos documentados de ícone — `<fx-icon>`, classe
  `fx-icon fx-icon-<nome>`, ligadura, `fx-button`/`fx-input` com
  `icon`/`icon-pos`/`slot="icon"` e demais componentes.
- **`absolutizeFontUrl()`** exportada por `@wrrdev/fenix-ui/icons` — helper que
  absolutiza caminhos relativos de fonte (usado pelo bundle CDN e disponível
  para reuso).
- **Harnesses de smoke test**:
  - `npm run test:cdn` (`scripts/cdn-smoke.mjs`, jsdom + servidor local) — carrega
    o UMD numa página em subpasta e valida que o `@font-face` resolve para a
    pasta do bundle e que o global `FenixUI` existe. Aceita outra URL/path de
    bundle como argumento.
  - `npm run test:consumer` (build Vite de um consumidor real, em
    `exemplos/consumer-smoke/`) — cobre o caminho "instalado via bundler", que
    não pode regredir: precisa copiar/reescrever o `.woff2` no bundle final.
- **`fx-drawer` — atributo `dismissible`** (padrão `true`):
  `dismissible="false"` remove o ✕ do header e bloqueia o fechamento por clique
  no overlay e por `ESC` — o drawer passa a fechar apenas por código
  (`open = false`).
- **Tokens novos**: `z.overlay` (`--fx-z-overlay`, padrão **1090** — camada do
  overlay desfocado dos drawers, abaixo dos painéis modais),
  `--fx-drawer-header-z` (padrão **20**, camada do header sticky do `fx-drawer`)
  e `--fx-button-outline-bg` (padrão `var(--fx-surface-background)`, fundo da
  variante `outline` do `fx-button`). Todos aparecem em *Tokens de tema*,
  *Variáveis de componente* e nos docs de `fx-drawer`/`fx-button`/`fx-toast`.

## [1.5.0] — 2026-10-23

### Adicionado

- **`type` do `fx-input` documentado e tipado como `'text' | 'number' | 'password'`**:
  qualquer outro valor (`email`, `tel`, `url`, `search`, `date`, `time`,
  `datetime-local`, `month`, `week`, `color`, `file`, `checkbox`, …) normaliza
  para `text` — para esses casos use o `<input>` nativo. Código, `FxInputType`,
  docs e playground agora contam a mesma história.
- **Seção “Two-way binding por framework”** na doc do `fx-input` e no README:
  a sintaxe que **funciona** em cada stack (Vue `v-model`, React `value` +
  `onInput`, Angular `[value]` + `(valueChange)`, Svelte `value` + `on:input`,
  HTML `addEventListener`) e o motivo de as demais falharem em silêncio.

### Alterado

- **Autofill do navegador passa a ser BLOQUEADO por padrão em `fx-input`,
  `fx-textarea` e `fx-autocomplete`**: valor colocado no campo **sem edição do
  usuário** (autofill, gerenciador de senha, script) é **desfeito** — o campo
  volta ao valor do host e nada é propagado (nem `value`/`FormData`, nem
  `input`/`valueChange`/`change`). Antes o valor era adotado e só os eventos de
  valor eram suprimidos, o que deixava o campo visualmente preenchido com
  credenciais salvas. O autofill só é **aceito** quando o host declara intenção:
  token semântico em `autocomplete` (`username`, `current-password`,
  `new-password`, `one-time-code`, `email`, `street-address`, … — ver
  `isSemanticAutocompleteToken` em `src/core/user-edit.ts`) ou o atributo
  `emit-autofill`.
- **`emit-autofill`** passa a significar “aceita o valor externo e propaga os
  eventos de valor como edição” (antes: “restaura o comportamento anterior”).
  Útil para testes/automação (`el.value = x; dispatchEvent(new Event('input'))`)
  e para quem depende do v-model atualizado pelo navegador.
- **`type` do `fx-input` limitado a `text`, `number` e `password`**: os demais
  tipos caem em `text` (ver Notas de migração).
- **Snippets da documentação**: o Vue agora gera `v-model`, o Angular
  `[value]` + `(valueChange)="x = $event.detail.value"`, o React `value` +
  `onInput` e o Svelte `value` + `on:input`.

### Corrigido

- **Campo preenchido com credenciais salvas** (`fx-input`/`fx-textarea`/
  `fx-autocomplete`): o preenchimento externo não fica mais no campo — era o
  sintoma que sobrava depois da v1.4.0, já que `autocomplete="off"` não impede o
  Chrome de preencher `type="password"` e o gerenciador de senha segue a
  heurística “primeiro campo de texto = usuário”.
- **Login sem valor no v-model depois do autofill**: com o token semântico
  (`username`/`current-password`) o autofill declarado emite `input`/
  `valueChange`, então o `v-model` do Vue acompanha o preenchimento — não é mais
  preciso capturar `@input` **e** `@autofill` para sincronizar a variável.
- **Documentação do two-way binding do Angular**: o repositório afirmava em
  ~25 lugares que `[(value)]`/`[(checked)]` funcionam em Web Components.
  **Não funcionam** — o açúcar vira `x = $event` e o `$event` é o `CustomEvent`,
  não o `detail`. JSDoc, docs e README passaram a mostrar
  `[value]` + `(valueChange)="x = $event.detail.value"` (e `[checked]` +
  `(checkedChange)` em checkbox/switch/radio).
- **Documentação do Svelte**: registrado que `bind:value` **não compila** em
  custom element (o compilador restringe o binding a
  `input`/`textarea`/`select`) — use `value` + `on:input` com `e.detail.value`.
- **`fx-autocomplete`**: valor externo é desfeito (antes era adotado) e a lista
  não abre.

### Notas de migração

- `<fx-input type="password">` continua **suportado** (é o único type além de
  `text`/`number`). Os demais types passam a renderizar `text` — se você
  dependia de `email`/`tel`/`date`/… no `fx-input`, use o `<input>` nativo.
- Quem dependia do valor autofillado **sem** declarar token semântico: declare o
  token (`autocomplete="username"`, `"current-password"`, `"email"`…) ou use
  `emit-autofill`.
- Testes/automação que simulavam digitação com
  `el.value = 'x'; dispatchEvent(new Event('input'))` precisam disparar
  `beforeinput` antes (ou usar `emit-autofill`).

## [1.4.0] — 2026-10-22

### Adicionado

- **Evento `autofill`** (`composed`, `detail: { value }`) em `fx-input`,
  `fx-textarea` e `fx-autocomplete`: valor colocado no campo **sem** edição do
  usuário (autofill do navegador, gerenciador de senha, script) agora tem
  evento próprio, sem acionar `input`/`valueChange`/`change`.
- **`emit-autofill`** (atributo booleano, por campo): restaura o comportamento
  anterior — eventos de valor também quando o valor vem do autofill.

### Corrigido

- **`fx-input`, `fx-textarea` e `fx-autocomplete`: `input` disparado por
  autofill/restauração do navegador** — o v-model do Vue (e o `[(value)]` do
  Angular) recebia valores que o usuário não digitou (ex.: o username do login
  salvo). Os eventos de valor agora só saem em edição real do usuário (prova
  positiva de `beforeinput`), de forma igual em todos os navegadores; o valor
  autofillado continua sincronizado em `value`/`FormData` e levanta a label do
  `fx-floatlabel`. Regra e limitações em `src/core/user-edit.ts` e na seção
  “Autofill do navegador × v-model” do README.
- `fx-input`/`fx-textarea`: o `change` sintetizado pelo autofill é absorvido
  junto do `input` (o `change` do blur após digitação continua saindo).
- **Callbacks diferidos disparando após o teardown do ambiente** (erro que
  derrubava a esteira com todos os testes verdes): o flush agendado pelo
  `MutationObserver` da diretiva `fx-tooltip` rodava depois de o jsdom ser
  desmontado e explodia com `ReferenceError: HTMLElement is not defined` —
  reportado como "Unhandled Errors" e exit code 1. Os callbacks diferidos de
  `fx-tooltip`, `fx-carousel`, `fx-editor`, `fx-toast`, `fx-dialog` e
  `fx-drawer` agora checam `isDomAvailable()` (`src/core/dom.ts`) antes de
  tocar o DOM, e o flush do tooltip é cancelado no `destroy()`. Cobertura nova:
  `src/components/teardown-safety.test.ts` (globais do DOM zerados + timers
  pendentes drenados — falha determinística, sem depender de timing).

> **Complementa a v1.3.0** (que passou a repassar `autocomplete`/`name`/`id` ao
> campo interno, com `off` como default): mesmo declarando os tokens semânticos
> no login (`username`, `current-password`) — quando o autofill é desejado — o
> valor injetado pelo navegador não aciona mais o v-model sem aviso; o app
> decide o que fazer pelo evento `autofill`.

## [1.3.0] — 2026-10-22

### Adicionado

- **`fx-input` · atributo `autocomplete`** (default `'off'`): o valor é repassado ao
  `<input>` interno — que é o campo que o navegador enxerga, já que o controle real vive no
  Shadow DOM. `name` e `id` do host também descem para o campo interno (ajudam a
  classificação do navegador). Com isso é possível desligar o autofill em buscas/filtros e
  declarar os tokens semânticos (`username`, `current-password`, `new-password`,
  `one-time-code`, `email`, `street-address`, …) no login e no cadastro.
- **`fx-textarea` · atributo `autocomplete`** (default `'off'`), com o mesmo repasse de
  `name`/`id` ao `<textarea>` interno.
- **Tipagem**: `autocomplete?: string` em `FxInputProps` e `FxTextareaProps` (Volar/TSX).
- **Documentação**: seção *“Autofill e gerenciadores de senha”* em `fx-input` (tabela de
  tokens, caso do login e exemplo) e nota em `fx-textarea`, `fx-floatlabel`, `fx-select`,
  `fx-multiselect`, `fx-autocomplete`, `fx-table`, `fx-datepicker`, `fx-orderlist`,
  `fx-picklist` e `fx-editor`. Novo controle *Autocomplete (autofill)* no playground do
  `fx-input`.

### Alterado

- **Campos internos de busca/filtro passam a sair com `autocomplete="off"`**: `fx-select` e
  `fx-multiselect` (`searchable`), linha de filtros do `fx-table`, `fx-datepicker`
  (exibição e hora), `fx-orderlist`, `fx-picklist` e diálogos do `fx-editor`. **Mudança de
  comportamento intencional** — evita que o gerenciador de senhas preencha campos comuns com
  o usuário salvo (heurística “primeiro campo de texto = usuário”).
- **`fx-input`/`fx-textarea`**: o campo interno passa a ter `autocomplete="off"` por padrão.
  Quem depende de autofill declara o token semântico no host (o atributo declarado vence).
  Observação: o Chrome ignora `off` em `type="password"` — use `current-password` (login) ou
  `new-password` (cadastro/troca).

### Corrigido

- Campos comuns (busca de tabela, filtros, diálogos) deixam de ser preenchidos pelo
  gerenciador de senhas quando o app tem um formulário de login na mesma sessão.

## [1.2.0] — 2026-10-21

### Adicionado

- **Tokens de tema**: novo grupo `table` — `table.text`, `table.header-text` e
  `table.header-weight`. Configurável por preset, JSON (`fenix-preset/v1`) ou
  `FenixUI.setTokens()`; os valores padrão usam `var(--fx-*)`, então claro/escuro
  continuam automáticos.
- **Documentação · Tokens de tema** (`#/tokens`): referência completa de todos os
  tokens (`--fx-*`) com valor claro/escuro, descrição, exemplo de `setTokens()`
  por grupo, valores ativos no tema atual e JSON de preset completo.
- **Documentação · Variáveis de componente** (`#/component-vars`): índice gerado
  a partir das `cssVars` de cada componente.
- **Customizador de tema (drawer)**: campos de texto (principal/secundário/
  desabilitado), tipografia (tamanho/peso) e tabela (corpo/cabeçalho/peso), com
  preview de tabela; esses tokens passam a sair no JSON baixado.
- **Menu “Exemplos”** na documentação: “Formulários” deixou de ficar em “Guia”.
- Busca do header passa a encontrar as páginas do guia/exemplos.

### Alterado

- **`fx-floatlabel`**: o destaque da label agora segue `:host([focus])` (foco ou
  dropdown aberto) em vez de `[active]` (valor **ou** foco). Com valor e sem foco
  a label volta à cor neutra, acompanhando a borda do campo. **Mudança visual
  intencional.**
- **`fx-table`**: texto do corpo/cabeçalho documentado por tokens
  (`--fx-table-*`); peso do corpo deixa de herdar o `font-weight` do body da
  página nos exemplos da documentação.
- **Temas** (`#/theming`): seção “Como alterar” com preset × `setTokens()` × CSS,
  precedência/merge e tabela de métodos com coluna “Exemplo”.

### Corrigido

- `fx-floatlabel`: label ficava primária com valor e sem foco (assimetria em
  relação à borda do campo).
- `fx-floatlabel` `variant="in"`: os estados `error`/`success` perdiam a cor para
  a regra `[variant="in"][active]` (especificidade).
- `fx-floatlabel`: dropdown aberto sem foco perdia o destaque; `open` agora entra
  no estado `focus`.
- `fx-floatlabel`: o `focusout` usava `setTimeout(60)` fixo; agora é um timer de
  0 ms cancelável no `focusin` e no `disconnectedCallback()`.
- `fx-table`: células do corpo podiam parecer mais claras que o cabeçalho por
  herdarem o peso de fonte da página (ver tokens acima).
