import { describe, it, expect } from 'vitest';
import './index';

describe('fx-pagination', () => {
  it('registra e emite page-change ao navegar', async () => {
    expect(customElements.get('fx-pagination')).toBeDefined();
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '1');
    el.setAttribute('total', '50');
    el.setAttribute('rows', '10');
    document.body.appendChild(el);
    await Promise.resolve();
    let detail: any = null;
    el.addEventListener('page-change', (e) => { detail = (e as CustomEvent).detail; });
    const next = el.shadowRoot!.querySelector('[part="next"]') as HTMLButtonElement;
    next?.click();
    await Promise.resolve();
    expect(detail?.page).toBe(2);
    expect(el.getAttribute('page')).toBe('2');
    el.remove();
  });

  it('hover não se aplica à página ativa (número não desaparece)', () => {
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '1');
    el.setAttribute('total', '50');
    document.body.appendChild(el);
    const styles = (el.constructor as any).styles as string;
    // O hover muda cor de texto/borda para primary — na página ativa o fundo
    // também é primary, então o hover deve excluir .active para o texto não sumir.
    expect(styles).toContain('.nav:hover:not([disabled]):not(.active)');
    el.remove();
  });

  it('oferece primeira/última página com glifos próprios', () => {
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '2');
    el.setAttribute('total', '250');
    el.setAttribute('rows', '10'); // 25 páginas
    document.body.appendChild(el);
    const root = el.shadowRoot!;
    const ico = (part: string) => root.querySelector(`[part="${part}"] .fx-icon`)?.textContent;
    expect(ico('first')).toBe('first_page');
    expect(ico('prev')).toBe('navigate_before');
    expect(ico('next')).toBe('navigate_next');
    expect(ico('last')).toBe('last_page');
    // Setas duplas no mesmo padrão do <fx-table>.
    expect(root.querySelector('[part="first"]')?.getAttribute('data-go')).toBe('1');
    expect(root.querySelector('[part="last"]')?.getAttribute('data-go')).toBe('25');
    el.remove();
  });

  it('desabilita primeira/última nas extremidades', () => {
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '1');
    el.setAttribute('total', '250');
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('[part="first"]')?.hasAttribute('disabled')).toBe(true);
    expect(el.shadowRoot!.querySelector('[part="prev"]')?.hasAttribute('disabled')).toBe(true);
    el.setAttribute('page', '25');
    expect(el.shadowRoot!.querySelector('[part="last"]')?.hasAttribute('disabled')).toBe(true);
    expect(el.shadowRoot!.querySelector('[part="next"]')?.hasAttribute('disabled')).toBe(true);
    el.remove();
  });

  it('navega para a última página pelo botão last', async () => {
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '1');
    el.setAttribute('total', '250');
    el.setAttribute('rows', '10');
    document.body.appendChild(el);
    let detail: any = null;
    el.addEventListener('page-change', (e) => { detail = (e as CustomEvent).detail; });
    (el.shadowRoot!.querySelector('[part="last"]') as HTMLButtonElement).click();
    await Promise.resolve();
    expect(detail?.page).toBe(25);
    el.remove();
  });

  it('o glifo da seta tem 1px a mais que o dígito (altura óptica)', () => {
    const el = document.createElement('fx-pagination');
    document.body.appendChild(el);
    const styles = (el.constructor as any).styles as string;
    expect(styles).toMatch(/\.nav \.fx-icon\s*\{\s*font-size:\s*calc\(var\(--fx-font-size\) - 1px\)/s);
    el.remove();
  });

  it('usa <fx-select> temático e emite page-change ao trocar itens por página', async () => {
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '1');
    el.setAttribute('total', '50');
    el.setAttribute('rows', '10');
    document.body.appendChild(el);
    await Promise.resolve();

    const sel = el.shadowRoot!.querySelector('fx-select.rows-sel') as HTMLElement;
    expect(sel).toBeTruthy();
    expect(el.shadowRoot!.querySelector('select')).toBeNull();

    let detail: any = null;
    el.addEventListener('page-change', (e) => { detail = (e as CustomEvent).detail; });

    // Escolhe a opção "20" no dropdown customizado.
    const opt = sel.shadowRoot!.querySelector('.opt[data-value="20"]') as HTMLElement;
    expect(opt).toBeTruthy();
    opt.click();
    await Promise.resolve();

    expect(detail?.rows).toBe(20);
    expect(detail?.page).toBe(1);
    expect(el.getAttribute('rows')).toBe('20');
    el.remove();
  });

  it('com muitas páginas exibe janela compacta com elipse (não todos os números)', () => {
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '1');
    el.setAttribute('total', '10000');
    el.setAttribute('rows', '10'); // 1.000 páginas
    document.body.appendChild(el);

    const root = el.shadowRoot!;
    const numeros = [...root.querySelectorAll('[part="page"]')].map((b) => Number(b.getAttribute('data-go')));
    // Primeira + vizinhas + última: 6 botões, nunca 1.000.
    expect(numeros).toEqual([1, 2, 3, 4, 5, 1000]);
    expect(root.querySelectorAll('[part="page"]').length).toBeLessThanOrEqual(6);
    const elipses = [...root.querySelectorAll('[part="ellipsis"]')];
    expect(elipses).toHaveLength(1);
    expect(elipses[0].textContent).toBe('…');
    expect(elipses[0].getAttribute('aria-hidden')).toBe('true');
    el.remove();
  });

  it('no meio da lista mostra elipses dos dois lados e marca a página atual', () => {
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '500');
    el.setAttribute('total', '10000');
    el.setAttribute('rows', '10');
    document.body.appendChild(el);

    const root = el.shadowRoot!;
    const numeros = [...root.querySelectorAll('[part="page"]')].map((b) => Number(b.getAttribute('data-go')));
    expect(numeros).toEqual([1, 499, 500, 501, 1000]);
    expect(root.querySelectorAll('[part="ellipsis"]')).toHaveLength(2);
    const atual = root.querySelector('[part="page"][aria-current="page"]')!;
    expect(atual.textContent).toBe('500');
    el.remove();
  });

  it('na última página a janela encosta no fim e as setas desabilitam', () => {
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '1000');
    el.setAttribute('total', '10000');
    el.setAttribute('rows', '10');
    document.body.appendChild(el);

    const root = el.shadowRoot!;
    const numeros = [...root.querySelectorAll('[part="page"]')].map((b) => Number(b.getAttribute('data-go')));
    expect(numeros).toEqual([1, 996, 997, 998, 999, 1000]);
    expect(root.querySelector('[part="next"]')?.hasAttribute('disabled')).toBe(true);
    expect(root.querySelector('[part="last"]')?.hasAttribute('disabled')).toBe(true);
    expect(root.querySelector('[part="first"]')?.hasAttribute('disabled')).toBe(false);
    el.remove();
  });

  it('navegar de uma em uma desloca a janela', async () => {
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '1');
    el.setAttribute('total', '10000');
    el.setAttribute('rows', '10');
    document.body.appendChild(el);

    for (let i = 0; i < 4; i++) {
      (el.shadowRoot!.querySelector('[part="next"]') as HTMLButtonElement).click();
      await Promise.resolve();
    }
    expect(el.getAttribute('page')).toBe('5');

    const root = el.shadowRoot!;
    const numeros = [...root.querySelectorAll('[part="page"]')].map((b) => Number(b.getAttribute('data-go')));
    expect(numeros).toEqual([1, 4, 5, 6, 1000]);
    expect(root.querySelector('[part="page"][aria-current="page"]')!.textContent).toBe('5');
    el.remove();
  });

  it('poucas páginas continuam sem elipses', () => {
    const el = document.createElement('fx-pagination');
    el.setAttribute('page', '3');
    el.setAttribute('total', '50');
    el.setAttribute('rows', '10'); // 5 páginas
    document.body.appendChild(el);

    const root = el.shadowRoot!;
    const numeros = [...root.querySelectorAll('[part="page"]')].map((b) => Number(b.getAttribute('data-go')));
    expect(numeros).toEqual([1, 2, 3, 4, 5]);
    expect(root.querySelectorAll('[part="ellipsis"]')).toHaveLength(0);
    el.remove();
  });
});
