# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) ·
Versionamento [SemVer](https://semver.org/lang/pt-BR/).
Histórico anterior à 1.2.0: [releases do GitHub](https://github.com/wesley-reis/FenixUI/releases).

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
