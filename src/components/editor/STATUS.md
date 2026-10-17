# FX Editor — Andamento das fases

> Arquivo de acompanhamento do desenvolvimento do `<fx-editor>`.
> Atualizar ao final de CADA fase (checklist + data + decisões + pendências).

## Status geral

| Fase | Descrição | Status | Início | Fim |
|---|---|---|---|---|
| 0 | Schema/sanitize/normalize + testes | Concluída | 2026-10-17 | 2026-10-17 |
| 1 | Núcleo + MVP (value/form/eventos/toolbar/comandos) | Concluída | 2026-10-17 | 2026-10-17 |
| 2 | Mídia, tabela e grid | Concluída | 2026-10-17 | 2026-10-17 |
| 3 | Polimento (source/fullscreen/count/paste/a11y/perf) | Em andamento (QA pendente) | 2026-10-17 | — |
| 4 | Docs, tipagens, registros, README e release | Em andamento (build ok) | 2026-10-17 | — |

## Decisões travadas

- Tag: `fx-editor`; classe `FxEditor extends FxFormElement`; subpath `@wrrdev/fenix-ui/editor`.
- `value`: atributo = inicial/default; propriedade = atual (semântica de `<textarea>`).
- Fonte da verdade: DOM do `contenteditable` + normalização para HTML canônico.
- Toolbar: botões nativos + tokens + `fenixIconHtml` (sem dezenas de custom elements).
- Grid: `<table role="presentation">` (layout table).
- Mídia: `figure` atômico com `contenteditable="false"`; tabela/grid editáveis.
- Undo: nativo primeiro; snapshots como fallback.
- Saída: `inline` padrão; `classes` opcional.
- Runtime: zero dependências novas.
- Shadow DOM: open + delegatesFocus; Plano B light DOM se o spike falhar.

## Fase 0 — checklist

- [x] Pasta do componente criada
- [x] Arquivo de andamento criado
- [x] `schema.ts`
- [x] `sanitize-html.ts` + testes de payload
- [x] `normalize-html.ts` + testes de estrutura
- [ ] Spike manual em Chrome/Firefox/Safari (execCommand em Shadow DOM)
- [x] `npm run typecheck` e testes do editor verdes

## Fase 1 — checklist

- [x] `editor.ts` (shell, value, form, eventos)
- [x] `selection.ts` (shadow-aware + fallback)
- [x] `commands.ts` (execCommand + fallback Range)
- [x] Histórico (snapshots dentro de `editor.ts`)
- [x] Toolbar (dentro de `editor.ts`)
- [x] Dialogs de link/imagem/vídeo (dentro de `editor.ts`)
- [x] Testes de integração

## Fase 2 — checklist

- [x] Mídia (imagem/vídeo/embed/upload/compressão)
- [x] Blocos atômicos (`figure` + `contenteditable=false`)
- [x] Tabela (grid picker, linhas/colunas, cabeçalho, excluir)
- [x] Grid/colunas
- [x] Dialogs de mídia/tabela
- [x] Merge/split de células
- [x] Handles de redimensionamento de imagem

## Fase 3 — checklist

- [x] Source view
- [x] Fullscreen
- [x] Contador de palavras/caracteres
- [x] Paste cleaning (HTML sanitizado / plain)
- [x] Acessibilidade básica (role/aria, atalhos, dialog)
- [x] Foco preso no dialog + roving tabindex na toolbar
- [ ] Auditoria manual com leitor de tela (NVDA/VoiceOver)
- [ ] Benchmark de performance (100 KB/500 KB)
- [ ] Teste manual cross-browser/IME

## Fase 4 — checklist

- [x] `src/docs/componentes/editor.doc.ts`
- [x] `src/index.ts`
- [x] `src/core/jsx.ts`
- [x] `src/core/vue.ts`
- [x] `src/plugins/auto-import.ts`
- [x] `package.json`
- [x] `src/docs/componentes/index.ts`
- [x] `README.md`
- [x] `npm run build` final
- [ ] Revisão de bundle/tree-shaking

## Log de andamento

### 2026-10-17 — Fase 0 concluída

- `schema.ts`: allowlist de tags/atributos, protocolos, hosts de embed e limites.
- `sanitize-html.ts`: DOMParser inerte, filtro de style, URLs, iframe allowlist, `rel` forçado e remoção de `contenteditable`.
- `normalize-html.ts`: canonicalização, figuras, tabelas, colgroup, grid, raiz e limpeza.
- 17 testes de sanitização/normalização passando.

### 2026-10-17 — Fase 1 concluída

- `FxEditor` form-associated com `value` atributo/propriedade, reset, required, readonly/disabled.
- Toolbar por preset, estados de seleção, atalhos, undo nativo + snapshots.
- `input`/`valueChange` (rAF) e `change` no blur; `ready`, `focus`, `blur`, `editor-error`.
- 26 testes do componente passando (jsdom).

### 2026-10-17 — Fase 2 concluída (básico)

- Imagem: URL, upload com callback, fallback data URL comprimido (WebP ≤ 1600px), paste/drop.
- Vídeo: mp4/webm e embed YouTube/Vimeo com sandbox.
- Tabela: grid picker 8×8, +linha/+coluna/−linha/−coluna, cabeçalho, excluir.
- Grid/colunas: 1–4 colunas via layout table com `data-stack`.
- Faltam merge/split e handles de resize.

### 2026-10-17 — Fase 3/4 em andamento

- Source view, fullscreen, contador e paste cleaning implementados.
- Registros de tipos/docs/package/README atualizados.
- Próximos passos: auditoria a11y, teste manual cross-browser e benchmark.

### 2026-10-17 — Suíte completa + build

- `tsc --noEmit`: 0 erros.
- Vitest: 1075 testes, 1071 passando, 4 pendentes, 0 falhas.
- `npm run build`: ESM + types + CDN concluídos com sucesso.
- Bundle do editor: `editor.js` 64,55 kB (gzip 13,38 kB) + `styles.js` 11,54 kB (gzip 2,61 kB).
- UMD completo: 450,40 kB (gzip 106,41 kB).
- Pendente para fechar a fase: QA manual em navegadores reais/IME, merge/split de tabela, resize handles de imagem, auditoria a11y e benchmark.

### 2026-10-17 — Tabelas, resize e a11y

- Merge/split de células com `table-utils.ts` (matriz lógica com colspan/rowspan) e API pública `mergeCells()`/`splitCell()`.
- Painel de tabela ganhou ações **Mesclar** e **Dividir**.
- Handles de redimensionamento de imagem (4 cantos, largura percentual 15–100%, overlay com tamanho em px).
- Dialog com foco preso (Tab/Shift+Tab), retorno de foco ao fechar e `aria-modal`.
- Toolbar com roving tabindex e navegação por ArrowLeft/ArrowRight/Home/End.
- Testes do editor: 34 passando; `tsc` 0.

### 2026-10-17 — Build pós-melhorias

- Testes de editor + docs-quality + typings: 335 passando, 0 falhas.
- `tsc --noEmit`: 0 erros; `npm run build`: 0.
- Bundle atualizado: `editor.js` 75,70 kB (gzip 15,42 kB); UMD 544,71 kB (gzip 114,11 kB).

### 2026-10-17 — Ajustes de UX e tipagem

- `fx-input`: `type` agora tem getter/setter com override, reflete no input interno e aceita somente `text|number|password`; qualquer outro tipo cai em `text`.
- `fx-toast`: toast somente com mensagem ganhou `.no-title` com `min-height: 48px` (sem título o card fica mais baixo).
- Editor: links com `cursor: pointer` e overlay ao clicar no link com ações **Abrir / Editar / Remover**; `Abrir` respeita `target="_blank"` (nova aba) ou `target="_self"` (mesma janela), e Ctrl/Cmd+clique abre direto.
- Editor: edição de link existente atualiza o próprio `<a>` (sem duplicar), inclusive com o cursor dentro do link.
- Editor: overlay de imagem/vídeo ganhou botão de excluir e suporte a `Delete`/`Backspace` quando a mídia está focada.
- Editor: quick actions (alinhar/esquerda/centro/direita e excluir) sobre imagens, vídeos e embeds — inclusive iframes, que não borbulham clique.
- Editor: imagem e vídeo agora aceitam alinhamento esquerda/centro/direita; o diálogo de vídeo ganhou o campo de alinhamento.
- Testes alvo: 375 passando; `tsc` 0; build 0.

### 2026-10-17 — Benchmark e avaliação de release

- Benchmark Edge headless de `normalizeForStorage(sanitizeHtml(html))`: ~45 ms para 10 KB, ~275 ms para 100 KB e ~1,34 s para 500 KB.
- Serialização agora usa `sanitizeBody` + `normalizeElement` no MESMO DOM (uma parseada): ~35 ms/10 KB, ~290 ms/100 KB e ~1,22 s/500 KB.
- Documentos com mais de 20.000 caracteres usam emissão com debounce de 140 ms, evitando serializar a cada frame durante a digitação.
- `maxlength` com padrão de 30.000 caracteres de texto; `maxlength="0"` desativa. Digitação, colagem e `insertHTML` acima do limite são bloqueados e emitem `editor-error`.
- Recomendação: liberar com o padrão de 30.000 caracteres. Para documentos maiores, o consumidor pode aumentar `maxlength`, mas 100 KB/500 KB continuam exigindo avaliação de performance.
- `tsc` 0; 51 testes do editor + 10 de tipagens passando; build 0.

## Pendências conhecidas

1. Validar `execCommand` dentro do Shadow DOM em Chrome/Firefox/Safari reais.
2. Testar IME (composição) e mobile (iOS Safari/Android Chrome).
3. Validar merge/split em tabelas com spans complexos e resize em touch.
4. Auditoria a11y manual com NVDA/VoiceOver.
5. Benchmark de documentos grandes e revisão de bundle.
6. Validar `toggleSource` + `syncChrome` no navegador.

