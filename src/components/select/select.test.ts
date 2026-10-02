import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import './index';
import { FxSelect } from './select';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

const optionsHtml =
  '<option value="a">Opção A</option><option value="b">Opção B</option>';

describe('fx-select', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('é um Custom Element registrado', () => {
    expect(customElements.get('fx-select')).toBeTruthy();
  });

  it('espelha as <option> do light DOM no painel', () => {
    const el = mount(`<fx-select class="fx-select-host">${optionsHtml}</fx-select>`);
    const opts = el.shadowRoot!.querySelectorAll('.opt');
    expect(opts.length).toBe(2);
    expect(opts[0].textContent).toBe('Opção A');
  });

  it('reflete atributo value na opção selecionada (aria-selected)', () => {
    const el = mount(`<fx-select class="fx-select-host" value="b">${optionsHtml}</fx-select>`);
    const sel = el.shadowRoot!.querySelector('.opt[aria-selected="true"]')!;
    expect(sel.getAttribute('data-value')).toBe('b');
  });

  it('mostra o rótulo selecionado no trigger', () => {
    const el = mount(`<fx-select class="fx-select-host" value="b">${optionsHtml}</fx-select>`);
    expect(el.shadowRoot!.querySelector('.label')!.textContent).toBe('Opção B');
  });

  it('abre o dropdown, escolhe opção e emite change composto', () => {
    const el = mount(`<fx-select class="fx-select-host">${optionsHtml}</fx-select>`) as any;
    let received = '';
    el.addEventListener('change', (e: Event) => {
      received = (e as CustomEvent).detail?.value ?? '';
    });
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.hasAttribute('open')).toBe(true);
    // re-consultar após re-render do open
    (el.shadowRoot.querySelector('.opt[data-value="a"]') as HTMLElement)!.click();
    expect(received).toBe('a');     // evento atravessou o Shadow DOM
    expect(el.value).toBe('a');      // refletido no host
    expect(el.hasAttribute('open')).toBe(false); // fechou após escolher
  });

  it('placeholder aparece quando nada está selecionado', () => {
    const el = mount(
      `<fx-select class="fx-select-host" placeholder="Escolha…">${optionsHtml}</fx-select>`,
    );
    expect(el.shadowRoot!.querySelector('.placeholder')!.textContent).toBe('Escolha…');
  });

  it('clearable: × limpa e emite change com valor vazio', () => {
    const el = mount(`<fx-select class="fx-select-host" clearable value="a">${optionsHtml}</fx-select>`) as any;
    let received: string | null = null;
    el.addEventListener('change', (e: Event) => { received = (e as CustomEvent).detail.value; });
    const clear = el.shadowRoot.querySelector('.clear') as HTMLElement;
    expect(clear).toBeTruthy();
    clear.click();
    expect(received).toBe('');
    expect(el.value).toBe('');
  });

  it('searchable: filtra opções ao digitar', () => {
    const el = mount(`<fx-select class="fx-select-host" searchable>${optionsHtml}</fx-select>`) as any;
    el.shadowRoot.querySelector('.trigger')!.click();
    const input = el.shadowRoot.querySelector('.search') as HTMLInputElement;
    input.value = 'B';
    input.dispatchEvent(new Event('input'));
    const opts = el.shadowRoot.querySelectorAll('.opt');
    expect(opts.length).toBe(1);
    expect(opts[0].textContent).toBe('Opção B');
  });

  it('disabled não abre o dropdown', () => {
    const el = mount(`<fx-select class="fx-select-host" disabled>${optionsHtml}</fx-select>`) as any;
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.hasAttribute('open')).toBe(false);
  });
});

/**
 * jsdom não calcula geometria nem layout. Como `render()` recria o trigger e
 * o painel a cada abertura, o stub precisa ser global (no prototype) e keyed
 * pelo ShadowRoot — assim o elemento recriado herda a métrica sem gambiarra.
 */
interface Metrics {
  viewportHeight: number;
  viewportWidth: number;
  trigger: { top: number; bottom: number; left: number };
  panelScrollHeight: number;
  panelOffsetWidth: number;
}
const metrics = new Map<ShadowRoot, Metrics>();
const original = new Map<object, Record<string, PropertyDescriptor | undefined>>();
/** Elemento de sondagem: seu prototype é a cadeia realmente usada pelos nós. */
const probe = document.createElement('div');

/**
 * `getBoundingClientRect` é um MÉTODO (valor), enquanto `scrollHeight` e
 * `offsetWidth` são GETTERS — por isso o `kind`. O patch é instalado no
 * prototype que REALMENTE declara a propriedade na cadeia do elemento
 * (offsetWidth é declarado em Element E redeclarado em HTMLElement; patchar
 * só em Element.prototype não teria efeito por sombreamento).
 */
function patch(_proto: object, prop: string, kind: 'method' | 'getter', compute: (self: any, fallback: any, m: Metrics) => any): void {
  let target: any = Object.getPrototypeOf(probe);
  while (target && !Object.getOwnPropertyDescriptor(target, prop)) target = Object.getPrototypeOf(target);
  const desc = target ? Object.getOwnPropertyDescriptor(target, prop)! : undefined;
  original.set(target, { ...(original.get(target) ?? {}), [prop]: desc });
  Object.defineProperty(target, prop, {
    configurable: true,
    get(this: any) {
      const m = metrics.get(this.getRootNode?.());
      if (!m) return desc ? (kind === 'method' ? desc.value : desc.get!.call(this)) : undefined;
      if (kind === 'method') {
        const base = desc!.value.bind(this);
        const m2 = m;
        return () => compute(this, base, m2);
      }
      return compute(this, desc ? desc.get!.call(this) : undefined, m);
    },
  });
}

function rectOf(top: number, bottom: number, left: number): DOMRect {
  return {
    top, bottom, left, right: left + 220, width: 220, height: bottom - top,
    x: left, y: top, toJSON: () => ({}),
  } as DOMRect;
}

beforeAll(() => {
  patch(Element.prototype, 'getBoundingClientRect', 'method', (self, base, m) =>
    self.classList.contains('trigger')
      ? rectOf(m.trigger.top, m.trigger.bottom, m.trigger.left)
      : base());
  patch(Element.prototype, 'scrollHeight', 'getter', (self, base) =>
    self.classList.contains('panel') ? metrics.get(self.getRootNode())!.panelScrollHeight : base);
  patch(Element.prototype, 'offsetWidth', 'getter', (self, base) =>
    self.classList.contains('panel') ? metrics.get(self.getRootNode())!.panelOffsetWidth : base);
});

afterAll(() => {
  for (const [proto, props] of original) {
    for (const prop of Object.keys(props)) {
      const desc = props[prop];
      if (desc) Object.defineProperty(proto, prop, desc);
      else delete (proto as any)[prop]; // nunca existiu no jsdom
    }
  }
});

/** Define viewport + geometria do trigger e do painel para um elemento. */
function stubGeometry(el: any, opts: {
  trigger: { top: number; bottom: number; left: number };
  panelScrollHeight: number;
  panelOffsetWidth?: number;
  viewportHeight: number;
  viewportWidth?: number;
}): void {
  setViewportHeight(opts.viewportHeight);
  setViewportWidth(opts.viewportWidth ?? 1024);
  metrics.set(el.shadowRoot, {
    viewportHeight: opts.viewportHeight,
    viewportWidth: opts.viewportWidth ?? 1024,
    trigger: opts.trigger,
    panelScrollHeight: opts.panelScrollHeight,
    panelOffsetWidth: opts.panelOffsetWidth ?? 220,
  });
}

/** Troca a geometria do trigger depois do mount (para testar reflow). */
function moveTrigger(el: any, top: number, bottom: number, left: number): void {
  const m = metrics.get(el.shadowRoot)!;
  metrics.set(el.shadowRoot, { ...m, trigger: { top, bottom, left } });
}

function setViewportHeight(h: number): void {
  Object.defineProperty(window, 'innerHeight', { value: h, configurable: true, writable: true });
}

/** A largura também precisa ser controlada: o overflow horizontal depende dela. */
function setViewportWidth(w: number): void {
  Object.defineProperty(window, 'innerWidth', { value: w, configurable: true, writable: true });
}

function clearMetrics(): void {
  metrics.clear();
  setViewportHeight(768);
  setViewportWidth(1024);
}

describe('fx-select — posicionamento do painel', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    clearMetrics();
  });

  it('placement é atributo observado e tem regras de CSS para top/bottom', () => {
    const styles = (FxSelect as unknown as { styles: string }).styles;
    const observed = (FxSelect as unknown as { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain('placement');
    expect(styles).toContain(":host([open][placement='top']) .panel");
    expect(styles).toContain(":host([open][data-placement='top']) .panel");
    expect(styles).toContain("bottom: calc(100% + var(--fx-select-panel-offset, 4px))");
    // `top` não pode mais estar fixo na regra base do painel
    expect(styles).not.toMatch(/\.panel \{\s*position: absolute;\s*top: calc/);
  });

  it('placement="top" abre o painel para cima mesmo com espaço embaixo', () => {
    const el = mount(`<fx-select placement="top">${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 100, bottom: 140, left: 20 }, panelScrollHeight: 300, viewportHeight: 800 });
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.getAttribute('data-placement')).toBe('top');
  });

  it('placement="top" segura o painel mesmo com o trigger colado na base', () => {
    const el = mount(`<fx-select placement="top">${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 700, bottom: 740, left: 20 }, panelScrollHeight: 260, viewportHeight: 768 });
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.getAttribute('data-placement')).toBe('top');
  });

  it('auto inverte quando não cabe embaixo e há mais espaço acima', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 500, bottom: 540, left: 20 }, panelScrollHeight: 260, viewportHeight: 600 });
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.getAttribute('data-placement')).toBe('top');
  });

  it('auto NÃO inverte quando há espaço dos dois lados', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 300, bottom: 340, left: 20 }, panelScrollHeight: 260, viewportHeight: 900 });
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.hasAttribute('data-placement')).toBe(false);
  });

  it('auto só inverte quando couber MELHOR acima (não apenas "há espaço")', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    // acima = 100 é MENOR que abaixo = 300; como 300 < desejado (400), não inverte
    stubGeometry(el, { trigger: { top: 100, bottom: 400, left: 20 }, panelScrollHeight: 400, viewportHeight: 700 });
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.hasAttribute('data-placement')).toBe(false);
  });

  it('placement="bottom" nunca inverte', () => {
    const el = mount(`<fx-select placement="bottom">${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 500, bottom: 540, left: 20 }, panelScrollHeight: 400, viewportHeight: 600 });
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.hasAttribute('data-placement')).toBe(false);
  });

  it('limita a maxHeight ao espaço disponível sem estourar a viewport', () => {
    const el = mount(`<fx-select placement="top">${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 400, bottom: 440, left: 20 }, panelScrollHeight: 1000, viewportHeight: 500 });
    el.shadowRoot.querySelector('.trigger')!.click();
    const panel = el.shadowRoot.querySelector('.panel') as HTMLElement;
    const max = parseInt(panel.style.maxHeight, 10);
    expect(Number.isFinite(max)).toBe(true);
    // espaço acima = 400 - gap 4 = 396 → nunca passa de 396px nem de 1000
    expect(max).toBeLessThanOrEqual(396);
    expect(max).toBeGreaterThan(0);
  });

  it('maxHeight nunca fica zerada quando o painel não tem rolagem', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 10, bottom: 50, left: 0 }, panelScrollHeight: 0, viewportHeight: 800 });
    el.shadowRoot.querySelector('.trigger')!.click();
    const panel = el.shadowRoot.querySelector('.panel') as HTMLElement;
    expect(parseInt(panel.style.maxHeight, 10)).toBeGreaterThan(0);
  });

  it('respeita --fx-select-panel-max-height do consumidor', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 20, bottom: 60, left: 0 }, panelScrollHeight: 1000, viewportHeight: 900 });
    el.style.setProperty('--fx-select-panel-max-height', '120px');
    el.shadowRoot.querySelector('.trigger')!.click();
    const panel = el.shadowRoot.querySelector('.panel') as HTMLElement;
    expect(parseInt(panel.style.maxHeight, 10)).toBeLessThanOrEqual(120);
  });

  it('puxa o painel para dentro quando ele estoura a borda direita', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    // trigger em x=700 numa viewport de 800, painel de 220px → estoura
    stubGeometry(el, {
      trigger: { top: 100, bottom: 140, left: 700 },
      panelScrollHeight: 200,
      panelOffsetWidth: 220,
      viewportHeight: 800,
      viewportWidth: 800,
    });
    el.shadowRoot.querySelector('.trigger')!.click();
    const panel = el.shadowRoot.querySelector('.panel') as HTMLElement;
    // excesso = 700 + 220 - (800 - 8) = 128 → deslocado 128px para a esquerda
    expect(panel.style.left).toBe('-128px');
    expect(panel.style.right).toBe('auto');
  });

  it('não desloca o painel quando ele cabe na viewport', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 100, bottom: 140, left: 20 }, panelScrollHeight: 200, viewportHeight: 800 });
    el.shadowRoot.querySelector('.trigger')!.click();
    const panel = el.shadowRoot.querySelector('.panel') as HTMLElement;
    expect(panel.style.left).toBe('');
  });

  it('reposiciona ao redimensionar a janela com o painel aberto', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 300, bottom: 340, left: 20 }, panelScrollHeight: 260, viewportHeight: 900 });
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.hasAttribute('data-placement')).toBe(false);

    // encolhe a janela: agora não cabe embaixo → deve inverter
    moveTrigger(el, 500, 540, 20);
    setViewportHeight(600);
    window.dispatchEvent(new Event('resize'));
    expect(el.getAttribute('data-placement')).toBe('top');
  });

  it('reposiciona também em scroll de container interno (capture)', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 300, bottom: 340, left: 20 }, panelScrollHeight: 260, viewportHeight: 900 });
    el.shadowRoot.querySelector('.trigger')!.click();
    moveTrigger(el, 560, 600, 20);
    setViewportHeight(620);
    // O scroller precisa estar NO documento: o listener vive no `window`
    // com capture, então só enxerga eventos que atravessam a árvore.
    const scroller = document.createElement('div');
    document.body.appendChild(scroller);
    scroller.appendChild(el);
    scroller.dispatchEvent(new Event('scroll', { bubbles: false }));
    expect(el.getAttribute('data-placement')).toBe('top');
  });

  it('não reposiciona quando o painel está fechado', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 500, bottom: 540, left: 20 }, panelScrollHeight: 400, viewportHeight: 600 });
    window.dispatchEvent(new Event('resize')); // nunca abriu
    expect(el.hasAttribute('data-placement')).toBe(false);
  });

  it('remove os listeners de reflow ao fechar o painel', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 300, bottom: 340, left: 20 }, panelScrollHeight: 260, viewportHeight: 900 });
    el.shadowRoot.querySelector('.trigger')!.click();
    el.shadowRoot.querySelector('.trigger')!.click(); // fecha
    moveTrigger(el, 450, 490, 20);
    setViewportHeight(500);
    window.dispatchEvent(new Event('resize'));
    expect(el.hasAttribute('data-placement')).toBe(false);
  });

  it('remove os listeners de reflow ao desconectar o elemento', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 300, bottom: 340, left: 20 }, panelScrollHeight: 260, viewportHeight: 900 });
    el.shadowRoot.querySelector('.trigger')!.click();
    expect(el.hasAttribute('open')).toBe(true);
    el.remove();
    moveTrigger(el, 450, 490, 20);
    setViewportHeight(500);
    window.dispatchEvent(new Event('resize'));
    expect(el.hasAttribute('data-placement')).toBe(false);
  });

  it('teclado continua funcionando com o painel invertido', () => {
    const el = mount(`<fx-select>${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 500, bottom: 540, left: 20 }, panelScrollHeight: 260, viewportHeight: 600 });
    const trigger = el.shadowRoot.querySelector('.trigger') as HTMLElement;
    trigger.click();
    expect(el.getAttribute('data-placement')).toBe('top');

    const key = (k: string) =>
      trigger.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    const opts = () => Array.from(el.shadowRoot.querySelectorAll('.opt')) as HTMLElement[];

    key('ArrowDown');
    expect(opts()[0]).toBe(el.shadowRoot.activeElement);
    key('ArrowDown');
    expect(opts()[1]).toBe(el.shadowRoot.activeElement);
    key('End');
    expect(opts()[opts().length - 1]).toBe(el.shadowRoot.activeElement);
    key('Home');
    expect(opts()[0]).toBe(el.shadowRoot.activeElement);
    key('ArrowUp');
    expect(opts()[0]).toBe(el.shadowRoot.activeElement); // não passa de 0
    key('Escape');
    expect(el.hasAttribute('open')).toBe(false);
    expect(el.hasAttribute('data-placement')).toBe(false);
  });

  it('continua escolhendo opção e emitindo change com placement="top"', () => {
    const el = mount(`<fx-select placement="top">${optionsHtml}</fx-select>`) as any;
    stubGeometry(el, { trigger: { top: 500, bottom: 540, left: 20 }, panelScrollHeight: 260, viewportHeight: 600 });
    let received = '';
    el.addEventListener('change', (e: Event) => { received = (e as CustomEvent).detail.value; });
    el.shadowRoot.querySelector('.trigger')!.click();
    (el.shadowRoot.querySelector('.opt[data-value="b"]') as HTMLElement).click();
    expect(received).toBe('b');
    expect(el.hasAttribute('open')).toBe(false);
  });
});
