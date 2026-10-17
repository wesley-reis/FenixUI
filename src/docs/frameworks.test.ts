/**
 * Snippets por framework: valores reais, booleanos, eventos e bindings.
 */
import { describe, expect, it } from 'vitest';
import { buildFragmentSnippets, buildSnippets, frameworkTabsHtml, parseAttrs, splitTag } from './frameworks';

describe('docs: frameworks.parseAttrs', () => {
  it('lê strings e booleanos', () => {
    expect(parseAttrs('variant="primary" disabled size="md"')).toEqual([
      { name: 'variant', value: 'primary', quote: '"' },
      { name: 'disabled', value: true },
      { name: 'size', value: 'md', quote: '"' },
    ]);
  });

  it('preserva aspas simples (JSON em atributo)', () => {
    expect(parseAttrs(`source='["A","B"]'`)).toEqual([
      { name: 'source', value: '["A","B"]', quote: "'" },
    ]);
  });
});

describe('docs: frameworks.splitTag', () => {
  it('extrai tag, attrs e inner', () => {
    const p = splitTag('<fx-select value="rj"><option value="rj">Rio</option></fx-select>');
    expect(p?.tag).toBe('fx-select');
    expect(p?.attrs).toContainEqual({ name: 'value', value: 'rj', quote: '"' });
    expect(p?.inner).toContain('Rio');
  });
});

describe('docs: frameworks.buildSnippets', () => {
  const base = {
    tag: 'fx-input',
    imports: ["import '@wrrdev/fenix-ui/input';"],
    events: [{ name: 'input' }, { name: 'change' }],
  };

  it('propaga o valor real do playground para os 5 frameworks', () => {
    const raw = '<fx-input type="text" value="maria@ex.com" placeholder="Seu e-mail"></fx-input>';
    const s = buildSnippets({ ...base, prettyHtml: raw, rawHtml: raw });
    expect(s.html).toContain('value="maria@ex.com"');
    expect(s.vue).toContain(`const value = ref("maria@ex.com")`);
    expect(s.vue).toContain(':value="value"');
    expect(s.react).toContain(`useState("maria@ex.com")`);
    expect(s.angular).toContain('[value]="value"');
    expect(s.svelte).toContain('let value = "maria@ex.com"');
  });

  it('booleanos viram binding por framework', () => {
    const raw = '<fx-button variant="danger" disabled>Excluir</fx-button>';
    const s = buildSnippets({
      tag: 'fx-button',
      imports: ["import '@wrrdev/fenix-ui/button';"],
      events: [{ name: 'click' }],
      prettyHtml: raw,
      rawHtml: raw,
    });
    expect(s.html).toContain('disabled');
    expect(s.react).toContain('disabled');
    // Angular: atributo estático (o componente só lê a presença).
    expect(s.angular).toContain('disabled');
    expect(s.vue).toContain('disabled');
  });

  it('eventos usam detail.value em toda stack', () => {
    const raw = '<fx-input value="a"></fx-input>';
    const s = buildSnippets({ ...base, prettyHtml: raw, rawHtml: raw });
    for (const code of [s.html, s.vue, s.react, s.angular, s.svelte]) {
      expect(code).toContain('detail.value');
    }
    // React 19: props on* em custom elements viram addEventListener.
    expect(s.react).toContain('onChange');
    // Angular avisa que ngModel não funciona; Svelte avisa sobre bind:.
    expect(s.angular).toContain('CUSTOM_ELEMENTS_SCHEMA');
    expect(s.svelte).toContain('bind:');
  });
});

describe('docs: frameworks.buildFragmentSnippets', () => {
  const FORM = `<div>
  <fx-input full icon="mail" name="email" placeholder="E-mail"></fx-input>
  <fx-select full name="uf" placeholder="UF"><option value="sp">SP</option></fx-select>
  <fx-checkbox name="termos" value="aceito">Aceito</fx-checkbox>
  <fx-button type="submit">Enviar</fx-button>
</div>`;

  it('converte TODOS os componentes do fragmento (não só o primeiro)', () => {
    const s = buildFragmentSnippets({ html: FORM });
    for (const code of [s.html, s.vue, s.react, s.angular, s.svelte]) {
      expect(code).toContain('fx-input');
      expect(code).toContain('fx-select');
      expect(code).toContain('fx-checkbox');
      expect(code).toContain('fx-button');
    }
  });

  it('nomeia o estado pelo atributo name e mantém o value do checkbox', () => {
    const s = buildFragmentSnippets({ html: FORM });
    expect(s.vue).toContain('const email = ref("");');
    expect(s.vue).toContain('const uf = ref("");');
    expect(s.vue).toContain('const termos = ref(false);');
    expect(s.vue).toContain(':value="email"');
    expect(s.react).toContain('useState("")');
    expect(s.svelte).toContain('let email = "";');
    // `value="aceito"` do checkbox continua estático (vai para o FormData).
    expect(s.react).toContain('value="aceito"');
    // Button submit não recebe handler de clique (quem trata é o <form>).
    expect(s.vue).not.toContain('@click="onClick"');
  });

  it('props JSON viram binding com literal JS por framework', () => {
    const s = buildFragmentSnippets({
      html: `<fx-table data='[{"nome":"Ana","cargo":"Dev"}]'></fx-table>`,
    });
    expect(s.vue).toContain(`:data='[{"nome":"Ana","cargo":"Dev"}]'`);
    expect(s.react).toContain(`data={[{"nome":"Ana","cargo":"Dev"}]}`);
    expect(s.angular).toContain(`[data]='[{"nome":"Ana","cargo":"Dev"}]'`);
    expect(s.svelte).toContain(`data={[{"nome":"Ana","cargo":"Dev"}]}`);
    // HTML puro mantém o atributo como está (o componente faz o parse).
    expect(s.html).toContain(`data='[{"nome":"Ana","cargo":"Dev"}]'`);
  });

  it('deriva os imports dos subpaths e remove atributos internos da doc', () => {
    const s = buildFragmentSnippets({
      html: '<div data-form-validate><fx-input data-save></fx-input></div>',
    });
    expect(s.html).toContain("import '@wrrdev/fenix-ui/input';");
    expect(s.vue).not.toContain('data-save');
    expect(s.vue).not.toContain('data-form-validate');
    expect(s.html).not.toContain('data-form-validate');
  });
});

describe('docs: frameworks.frameworkTabsHtml', () => {
  it('renderiza 5 abas com HTML ativo por padrão', () => {
    const html = frameworkTabsHtml({ html: 'a', vue: 'b', react: 'c', angular: 'd', svelte: 'e' });
    for (const id of ['html', 'vue', 'react', 'angular', 'svelte']) {
      expect(html).toContain(`data-fw="${id}"`);
      expect(html).toContain(`data-pane="${id}"`);
    }
    expect(html).toContain('fw-tab active');
  });
});
