# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) ·
Versionamento [SemVer](https://semver.org/lang/pt-BR/).
Histórico anterior à 1.2.0: [releases do GitHub](https://github.com/wesley-reis/FenixUI/releases).

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
