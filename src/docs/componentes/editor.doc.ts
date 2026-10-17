/**
 * Documentação do componente <fx-editor>.
 */
import type { ComponentDoc } from '../types';

const SAMPLE = '&lt;p&gt;Texto com &lt;strong&gt;negrito&lt;/strong&gt;, &lt;em&gt;itálico&lt;/em&gt; e um &lt;a href=&quot;https://exemplo.com&quot;&gt;link&lt;/a&gt;.&lt;/p&gt;&lt;p&gt;Segundo parágrafo.&lt;/p&gt;';

export const editorDoc: ComponentDoc = {
  tag: 'fx-editor',
  title: 'Editor',
  group: 'Formulário',
  lead: 'Editor de texto rico nativo, sem dependências externas. Produz HTML sanitizado e canônico, com toolbar configurável, links, imagens, vídeo, tabelas, colunas, source view e integração com formulários.',
  imports: ["import '@wrrdev/fenix-ui/editor';"],
  demoHtml: (a) => `<fx-editor ${a} value="${SAMPLE}" placeholder="Escreva algo..."></fx-editor>`,
  variantsHtml: () => `
    <h4>Toolbar básica</h4>
    <fx-editor toolbar="basic" value="${SAMPLE}"></fx-editor>
    <h4>Somente leitura</h4>
    <fx-editor readonly value="${SAMPLE}"></fx-editor>
    <h4>Com contador</h4>
    <fx-editor show-count value="${SAMPLE}"></fx-editor>
  `,
  controls: [
    {
      kind: 'select',
      attr: 'toolbar',
      label: 'Toolbar',
      options: ['minimal', 'basic', 'standard', 'full'],
    },
    { kind: 'text', attr: 'placeholder', label: 'Placeholder', value: 'Escreva algo...' },
    { kind: 'text', attr: 'min-height', label: 'Altura mínima', value: '240px' },
    { kind: 'toggle', attr: 'show-count', label: 'Contador' },
    { kind: 'text', attr: 'maxlength', label: 'Limite de caracteres', value: '30000' },
    { kind: 'toggle', attr: 'readonly', label: 'Somente leitura' },
    { kind: 'toggle', attr: 'disabled', label: 'Desabilitado' },
    { kind: 'toggle', attr: 'full', label: 'Largura total' },
  ],
  attributes: [
    {
      name: 'value',
      type: 'string',
      default: "''",
      desc: 'Conteúdo inicial em HTML (atributo) ou conteúdo atual (propriedade). A propriedade sanitiza e canonicaliza o HTML.',
    },
    {
      name: 'name',
      type: 'string',
      default: "''",
      desc: 'Nome do campo no FormData quando dentro de um <form>.',
    },
    {
      name: 'toolbar',
      type: `'minimal' | 'basic' | 'standard' | 'full' | 'none'`,
      default: "'standard'",
      desc: 'Preset da toolbar.',
    },
    {
      name: 'features',
      type: 'string',
      default: 'todas',
      desc: 'Lista CSV para limitar inserções: link,image,video,table,columns,source,fullscreen.',
    },
    {
      name: 'paste-mode',
      type: `'clean' | 'plain'`,
      default: "'clean'",
      desc: 'Colagem limpa (sanitiza HTML) ou somente texto.',
    },
    {
      name: 'readonly / disabled',
      type: 'boolean',
      default: 'false',
      desc: 'Somente leitura (valor continua no form) / desabilitado (fora do FormData).',
    },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      desc: 'Valida conteúdo vazio via ElementInternals (valueMissing).',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      desc: 'Texto exibido quando o conteúdo está vazio.',
    },
    {
      name: 'min-height / max-height',
      type: 'CSS length',
      default: '240px / none',
      desc: 'Altura da área editável (também disponível como variáveis CSS).',
    },
    {
      name: 'show-count',
      type: 'boolean',
      default: 'false',
      desc: 'Exibe contador de palavras e caracteres na barra inferior.',
    },
    {
      name: 'maxlength',
      type: 'number',
      default: '30000',
      desc: 'Limite de caracteres de texto (0 desativa). Bloqueia digitação/colagem acima do limite e emite editor-error.',
    },
    {
      name: 'fullscreen',
      type: 'boolean',
      default: 'false',
      desc: 'Modo tela cheia (CSS fixed). Escape sai.',
    },
    {
      name: 'error / invalid',
      type: 'boolean',
      default: 'false',
      desc: 'Borda vermelha de validação.',
    },
    {
      name: 'success / valid',
      type: 'boolean',
      default: 'false',
      desc: 'Borda verde de validação.',
    },
    {
      name: 'uploadImage',
      type: 'function (property)',
      default: '—',
      desc: 'Callback assíncrono que recebe File e devolve URL (ou { url, alt }). Sem callback, imagens viram data URL comprimida.',
    },
    {
      name: 'sanitizeHtml',
      type: 'function (property)',
      default: '—',
      desc: 'Hook opcional para sanitização adicional depois do allowlist interno.',
    },
  ],
  events: [
    {
      name: 'input / valueChange',
      type: 'CustomEvent<{ value, html, text }>',
      desc: 'Durante a edição (rAF). value é o HTML sanitizado/canônico.',
    },
    {
      name: 'change',
      type: 'CustomEvent<{ value, html, text }>',
      desc: 'Ao sair do editor.',
    },
    {
      name: 'focus / blur',
      type: 'CustomEvent',
      desc: 'Foco e perda de foco da área editável.',
    },
    {
      name: 'ready',
      type: 'CustomEvent',
      desc: 'Editor montado e conteúdo inicial aplicado.',
    },
    {
      name: 'editor-error',
      type: 'CustomEvent<{ message }>',
      desc: 'Falha de URL/arquivo/upload.',
    },
  ],
  cssVars: [
    { name: '--fx-editor-min-height', type: 'CSS length', default: '240px', desc: 'Altura mínima da área editável.' },
    { name: '--fx-editor-max-height', type: 'CSS length', default: 'none', desc: 'Altura máxima (scroll interno).' },
    { name: '--fx-editor-radius', type: 'radius', default: 'var(--fx-radius-md)', desc: 'Raio da moldura.' },
    { name: '--fx-editor-toolbar-bg', type: 'cor', default: 'var(--fx-surface-surface)', desc: 'Fundo da toolbar.' },
    { name: '--fx-editor-content-padding', type: 'espaçamento', default: 'var(--fx-space-md) var(--fx-space-lg)', desc: 'Padding do conteúdo.' },
  ],
  extraSections: [
    {
      title: 'Contrato do HTML salvo',
      html: `<p>O valor é sempre HTML sanitizado e canônico: blocos no nível raiz, mídia em &lt;figure&gt;, tabelas com &lt;colgroup&gt; e grid como layout table. Exemplo de imagem:</p>
      <pre><code>&lt;figure class="fx-image" data-align="center" style="width:100%"&gt;
  &lt;img src="https://cdn.exemplo.com/foto.jpg" alt="Descrição" loading="lazy"&gt;
&lt;/figure&gt;</code></pre>
      <p>Use <code>FX_EDITOR_CONTENT_CSS</code> (exportado pelo subpath) ao renderizar o HTML fora do componente, para preservar tipografia, figuras, tabelas e grid.</p>`,
    },
    {
      title: 'Links',
      html: `<p>Selecione um texto e use <b>Link</b> (ou <code>Ctrl/Cmd+K</code>). O diálogo define URL, texto e destino: <b>Nova aba</b> (<code>target="_blank"</code>) ou <b>Mesma aba</b> (<code>target="_self"</code>).</p>
      <ul>
        <li>Clique em um link existente para abrir o overlay com <b>Abrir</b>, <b>Editar</b> e <b>Remover</b>.</li>
        <li><b>Abrir</b> respeita o destino configurado; <code>Ctrl/Cmd+clique</code> abre diretamente.</li>
        <li>Editar um link atualiza o próprio <code>&lt;a&gt;</code>, sem criar outro.</li>
      </ul>`,
    },
    {
      title: 'Tabelas e mídia',
      html: `<p>Selecione um retângulo de células e use <b>Mesclar</b>; para desfazer, posicione o cursor na célula e use <b>Dividir</b>. Clique em uma imagem ou vídeo para exibir o overlay com handles de redimensionamento, alinhamento e botão de excluir (duplo clique na imagem edita URL, legenda e alinhamento).</p>
      <ul>
        <li><code>editor.mergeCells()</code> e <code>editor.splitCell()</code> também estão disponíveis na API pública.</li>
        <li>Imagens e vídeos aceitam alinhamento esquerda/centro/direita e largura de 50%, 75% ou 100%.</li>
        <li>O grid de colunas continua sendo uma layout table com <code>role="presentation"</code>.</li>
      </ul>`,
    },
    {
      title: 'Segurança',
      html: `<p>O componente usa allowlist de tags/atributos, bloqueia <code>javascript:</code>, SVG em data URL, iframes fora de YouTube/Vimeo e força <code>rel="noopener noreferrer"</code>. Ainda assim, sanitize o HTML também no backend antes de renderizá-lo em outro contexto.</p>`,
    },
    {
      title: 'Frameworks',
      html: `<p><b>Vue:</b> <code>v-model</code> funciona pelo evento <code>input</code> e pela propriedade <code>value</code>. <b>React:</b> use a propriedade via ref para conteúdo grande; o atributo <code>value</code> é o valor inicial (semântica de textarea). <b>Angular:</b> use <code>[(value)]</code> com <code>valueChange</code>.</p>`,
    },
  ],

};
