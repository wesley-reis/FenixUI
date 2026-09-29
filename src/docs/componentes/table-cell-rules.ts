/**
 * Seções extras da página do <fx-table> na documentação.
 *
 * Fica em arquivo próprio (e não inline no `table.doc.ts`) porque são blocos
 * grandes de HTML + código, e porque os testes importam daqui para garantir que
 * as regras continuam coerentes com o que os compiladores de fato aceitam —
 * ver `table.doc.test.ts`.
 *
 * Contexto: o conteúdo do `<fx-cell>` é TEXTO CRU. O `{{ }}` é avaliado pelo
 * motor de expressões do `<fx-table>` (`src/components/table/expr.ts`), e não
 * pelo framework hospedeiro — que tem a sua própria sintaxe para `{}` e
 * interpreta o texto antes de o componente o receber.
 */
import { codeBlock } from '../ui/code';
import type { ComponentDoc } from '../types';

export const FX_CELL_FRAMEWORK_SECTIONS: NonNullable<
  ComponentDoc['extraSections']
> = [
  {
    title: 'Regras por framework (o v-pre é obrigatório no Vue)',
    html: `
<p>O conteúdo do <code>&lt;fx-cell&gt;</code> é <b>texto cru</b>. As chaves <code>{{ }}</code>
são avaliadas pelo <b>motor de expressões do próprio fx-table</b> (sem <code>eval</code>), e
<b>não</b> pelo seu framework. Cada template engine tem uma sintaxe para <code>{}</code> e
interpreta o conteúdo antes de o componente o receber — por isso cada stack precisa de uma
neutralização diferente. O TypeScript não ajuda aqui: para o compilador, o conteúdo é apenas
uma string dentro de um elemento qualquer.</p>

${codeBlock(`<!-- Vue 3 / Nuxt — v-pre é OBRIGATÓRIO -->
<fx-table :data="rows">
  <fx-column field="salario" header="Salário">
    <fx-cell v-pre>R$ {{ value | number }}</fx-cell>
  </fx-column>
</fx-table>`)}

<div class="note"><strong>Por que o v-pre é obrigatório no Vue?</strong> Sem ele, o
compilador do Vue transforma <code>{{ value | number }}</code> na interpolação
<code>_toDisplayString(_ctx.value | _ctx.number)</code>: o texto chega <em>sem as chaves</em> no
<code>innerHTML</code>, a célula fica vazia e o <code>vue-tsc</code> acusa
<code>Property 'value' does not exist</code> e <code>Property 'number' does not exist</code>.
Com <code>v-pre</code> o Vue entrega o texto literal e a expressão chega intacta ao fx-table.
O mesmo <code>v-pre</code> vale para o <code>&lt;template&gt;</code> externo
(<code>template="#id"</code>) e para o conteúdo direto da <code>&lt;fx-column&gt;</code>.</div>

${codeBlock(`// React / JSX — o {{ }} solto é ERRO DE SINTAXE no parser JSX.
// Use uma string JS (vira texto e o innerHTML chega certo ao fx-table):
<fx-table data={rows}>
  <fx-column field="salario" header="Salário">
    <fx-cell>{'R$ {{ value | number }}'}</fx-cell>
  </fx-column>
</fx-table>

// Ou o template inteiro como HTML:
<fx-cell dangerouslySetInnerHTML={{ __html: '<b>R$</b> {{ value | number }}' }} />`)}

${codeBlock(`<!-- Angular — ngNonBindable desliga a interpolação do Angular -->
<fx-table [attr.data]="json">
  <fx-column field="salario" header="Salário">
    <fx-cell ngNonBindable>R$ {{ value | number }}</fx-cell>
  </fx-column>
</fx-table>

// schemas: [CUSTOM_ELEMENTS_SCHEMA] continua obrigatório para as tags fx-*`)}

${codeBlock(`<!-- Svelte — string JS ou entidades HTML ({{ }} solto é erro de compilação) -->
<fx-cell>{'R$ {{ value | number }}'}</fx-cell>

<!-- equivalente com entidades, útil quando o texto está num atributo -->
<fx-cell>&lbrace;&lbrace; value | number &rbrace;&rbrace;</fx-cell>`)}

${codeBlock(`<!-- HTML puro / CDN / JSF / JSP / Thymeleaf — nada a fazer -->
<fx-table id="tbl" data='[{"salario":1234.5}]'>
  <fx-column field="salario" header="Salário">
    <fx-cell>R$ {{ value | number }}</fx-cell>
  </fx-column>
</fx-table>`)}

<table class="api">
  <thead><tr><th>Stack</th><th>Configuração</th><th>Por quê</th></tr></thead>
  <tbody>
    <tr><td><b>Vue 3 / Nuxt</b></td><td><code>isCustomElement</code> + <code>v-pre</code></td><td><code>{{ }}</code> é a interpolação do Vue</td></tr>
    <tr><td><b>React / Preact</b></td><td>string JS <code>{'{{ }}'}</code> ou <code>dangerouslySetInnerHTML</code></td><td><code>{{ }}</code> vira objeto aninhado e quebra o parser JSX</td></tr>
    <tr><td><b>Angular</b></td><td><code>CUSTOM_ELEMENTS_SCHEMA</code> + <code>ngNonBindable</code></td><td><code>{{ }}</code> é a interpolação do Angular</td></tr>
    <tr><td><b>Svelte</b></td><td>string JS ou <code>&amp;lbrace;</code></td><td><code>{{ }}</code> abre um <em>template expression</em></td></tr>
    <tr><td><b>HTML / CDN / JSF / JSP</b></td><td>nenhuma</td><td>o navegador não interpreta <code>{{ }}</code></td></tr>
  </tbody>
</table>

<div class="note"><strong>O <code>&lt;fx-cell&gt;</code> só funciona dentro do
<code>&lt;fx-table&gt;</code></strong>, como filho direto de <code>&lt;fx-column&gt;</code> — fora
da tabela a tag é inerte e nada acontece. E o light DOM do <code>&lt;fx-table&gt;</code> nunca
aparece na tela (a tabela não usa <code>&lt;slot&gt;</code>): o conteúdo-fonte serve só como
template, e o que o usuário vê é sempre a célula já renderizada no shadow root.</div>`,
  },
  {
    title: 'Variáveis disponíveis no template',
    html: `
<p>Estas são as <b>únicas</b> variáveis do escopo. Como o conteúdo é uma string, o TypeScript
não valida nada — se um nome não existir, a expressão simplesmente devolve
<code>undefined</code> e a célula sai vazia, sem erro no console.</p>

<table class="api">
  <thead><tr><th>Identificador</th><th>Significado</th><th>Exemplo</th></tr></thead>
  <tbody>
    <tr><td><code>value</code></td><td>Valor do campo da coluna (<code>row[field]</code>)</td><td><code>{{ value }}</code></td></tr>
    <tr><td><code>row</code></td><td>Objeto completo da linha</td><td><code>{{ row.nome }}</code></td></tr>
    <tr><td><code>nomeDireto</code></td><td>Atalho: identificador solto resolve para <code>row[nomeDireto]</code></td><td><code>{{ nome }}</code> equivale a <code>{{ row.nome }}</code></td></tr>
    <tr><td><code>true</code> <code>false</code> <code>null</code></td><td>Literais</td><td><code>{{ row.ativo ? 'Sim' : 'Não' }}</code></td></tr>
  </tbody>
</table>

<h4>Pipes</h4>
<table class="api">
  <thead><tr><th>Pipe</th><th>O que faz</th><th>Exemplo</th></tr></thead>
  <tbody>
    <tr><td><code>currency</code></td><td>Moeda pt-BR (R$)</td><td><code>{{ value | currency }}</code></td></tr>
    <tr><td><code>number</code></td><td>Número pt-BR; argumento = casas decimais</td><td><code>{{ value | number }}</code> · <code>{{ value | number: 2 }}</code></td></tr>
    <tr><td><code>date</code></td><td>Data; argumento = <code>short</code>, <code>medium</code>, <code>long</code>, <code>full</code></td><td><code>{{ value | date: 'short' }}</code></td></tr>
    <tr><td><code>dateTime</code></td><td>Data + hora (medium/short)</td><td><code>{{ value | dateTime }}</code></td></tr>
  </tbody>
</table>

<h4>Operadores aceitos</h4>
<p><code>+ - * /</code> (aritméticos — o <code>+</code> concatena quando algum lado é string),
<code>== != &gt; &lt; &gt;= &lt;=</code> (comparações), <code>!</code> (negação),
<code>? :</code> (ternário) e parênteses para agrupar. Não há <code>&amp;&amp;</code>,
<code>||</code>, funções ou chamadas: o parser é propositalmente pequeno e não executa
código.</p>

${codeBlock(`<!-- exemplos combinando pipes, ternário e row.* -->
<fx-column field="salario" header="Salário">
  <fx-cell v-pre><b>R$ {{ value | number: 2 }}</b> — {{ row.salario >= 6000 ? 'Sênior' : 'Júnior' }}</fx-cell>
</fx-column>

<fx-column field="nascimento" header="Nascimento">
  <fx-cell v-pre>{{ value | date: 'long' }} ({{ row.idade }} anos)</fx-cell>
</fx-column>

<fx-column field="status" header="Status">
  <fx-cell v-pre><i class="pi pi-{{ row.ativo == 'Sim' ? 'check' : 'times' }}"></i> {{ row.ativo }}</fx-cell>
</fx-column>`)}

<div class="note"><strong>Sem <code>eval</code>:</strong> o avaliador é um parser próprio
(<code>src/components/table/expr.ts</code>, tokenizer + Pratt parser) que nunca executa código
do template, e o resultado passa por escape HTML antes de entrar na célula. Isso é propósito:
o conteúdo vem de dados de servidor e não deve virar vetor de XSS.</div>`,
  },
];
