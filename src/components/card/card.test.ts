import { describe, it, expect } from 'vitest';
import './index';
import { FxCard } from './card';


describe('fx-card', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-card')).toBeDefined();
  });

  it('projection de slots header/content/footer', () => {
    const el = document.createElement('fx-card');
    el.setAttribute('heading', 'Título');
    el.setAttribute('padded', '');
    el.innerHTML =
      '<span slot="header">H</span><p>Corpo</p><span slot="footer">F</span>';
    document.body.appendChild(el);
    const header = el.shadowRoot!.querySelector('header');
    expect(header?.textContent).toContain('Título');
    // conteúdo dos slots fica no light DOM; os slots existem no shadow
    expect(el.querySelector('p')).toBeTruthy();
    expect(el.querySelector('p')?.textContent).toBe('Corpo');
    expect(el.querySelector('[slot="footer"]')?.textContent).toBe('F');
    expect(el.shadowRoot!.querySelector('slot[name="header"]')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('slot[name="footer"]')).toBeTruthy();
    el.remove();
  });

  it('variant outline flat ghost renderizam sem sombra', () => {
    for (const v of ['elevated', 'flat', 'outline', 'ghost']) {
      const el = document.createElement('fx-card');
      el.setAttribute('variant', v);
      document.body.appendChild(el);
      const card = el.shadowRoot!.querySelector('.card') as HTMLElement;
      expect(card).toBeTruthy();
      el.remove();
    }
  });

  it('radius controla o arredondamento (size segue como alias legado)', () => {
    const styles = (FxCard as unknown as { styles: string }).styles;
    const observed = (FxCard as unknown as { observedAttributes: string[] }).observedAttributes;
    expect(styles).toContain(":host([radius='sm'])");
    expect(styles).toContain(":host([radius='lg'])");
    expect(styles).toContain(":host([size='sm'])");
    expect(observed).toContain('radius');
  });

  it('padded é observado e re-renderiza o shadow (padding interno)', () => {
    const el = document.createElement('fx-card');
    document.body.appendChild(el);
    const before = el.shadowRoot!.querySelector('.body');
    el.setAttribute('padded', '');
    expect(el.hasAttribute('padded')).toBe(true);
    // o atributo observado refaz o template do shadow
    expect(el.shadowRoot!.querySelector('.body')).not.toBe(before);
    expect((FxCard as unknown as { styles: string }).styles).toContain(':host([padded]) .body { padding:');
    el.remove();
  });

  it('footer fica oculto quando o slot footer está vazio', () => {
    const el = document.createElement('fx-card');
    el.innerHTML = '<p>Corpo</p>';
    document.body.appendChild(el);
    const footer = el.shadowRoot!.querySelector('footer')!;
    expect(footer.hasAttribute('hidden')).toBe(true);
    // a linha divisória some junto (footer[hidden] { display: none })
    expect((FxCard as unknown as { styles: string }).styles).toContain('footer[hidden] { display: none; }');
    el.remove();
  });

  it('footer fica oculto mesmo COM heading e sem slot footer', () => {
    // Regressão: o atributo `heading` alimenta só o header. Contá-lo também no
    // footer fazia todo card com heading exibir padding + linha divisória no
    // rodapé, mesmo sem nada no slot `footer`.
    const el = document.createElement('fx-card');
    el.setAttribute('heading', 'Detalhes do pedido');
    el.innerHTML = '<p>Corpo</p>';
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('header')!.hasAttribute('hidden')).toBe(false);
    expect(el.shadowRoot!.querySelector('footer')!.hasAttribute('hidden')).toBe(true);
    el.remove();
  });

  it('footer aparece quando há conteúdo no slot footer', () => {
    const el = document.createElement('fx-card');
    el.innerHTML = '<p>Corpo</p><span slot="footer">Ação</span>';
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('footer')!.hasAttribute('hidden')).toBe(false);
    el.remove();
  });

  it('header fica oculto sem heading E sem conteúdo no slot header', () => {
    const el = document.createElement('fx-card');
    el.innerHTML = '<p>Corpo</p>';
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('header')!.hasAttribute('hidden')).toBe(true);

    // conteúdo no slot header também exibe o header, mesmo sem `heading`
    const el2 = document.createElement('fx-card');
    el2.innerHTML = '<span slot="header">H</span>';
    document.body.appendChild(el2);
    expect(el2.shadowRoot!.querySelector('header')!.hasAttribute('hidden')).toBe(false);
    el.remove();
    el2.remove();
  });

  it('reage a conteúdo do footer adicionado depois (slotchange)', () => {
    const el = document.createElement('fx-card');
    el.innerHTML = '<p>Corpo</p>';
    document.body.appendChild(el);
    const footer = el.shadowRoot!.querySelector('footer')!;
    expect(footer.hasAttribute('hidden')).toBe(true);

    const btn = document.createElement('button');
    btn.setAttribute('slot', 'footer');
    btn.textContent = 'Salvar';
    el.appendChild(btn);
    // `slotchange` é disparado pelo elemento <slot> do shadow root.
    el.shadowRoot!.querySelector('slot[name="footer"]')!.dispatchEvent(new Event('slotchange'));

    expect(el.shadowRoot!.querySelector('footer')!.hasAttribute('hidden')).toBe(false);
    el.remove();
  });

  it('espaços em branco no slot não contam como conteúdo do footer', () => {
    const el = document.createElement('fx-card');
    el.innerHTML = '<p>Corpo</p>';
    document.body.appendChild(el);
    const slot = el.shadowRoot!.querySelector('slot[name="footer"]')!;
    slot.appendChild(document.createTextNode('   \n  '));
    (el as unknown as { _syncSlots(): void })._syncSlots();
    expect(el.shadowRoot!.querySelector('footer')!.hasAttribute('hidden')).toBe(true);
    el.remove();
  });
});
