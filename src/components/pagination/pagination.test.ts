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
});
