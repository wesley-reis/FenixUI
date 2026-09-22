import { describe, it, expect, beforeEach } from 'vitest';
import './index';
import { FxButton } from './button';

function mount(attrs = ''): HTMLElement {
  const el = document.createElement('fx-button');
  if (attrs) {
    for (const attr of attrs.split(' ')) {
      const [name, value] = attr.includes('=') ? attr.split('=') : [attr, undefined];
      el.setAttribute(name, value ?? '');
    }
  }
  el.innerHTML = 'Salvar';
  document.body.appendChild(el);
  return el;
}

const bodies = () => document.body.querySelectorAll('fx-button');

describe('fx-button', () => {
  beforeEach(() => {
    bodies().forEach((el) => el.remove());
  });

  it('é um Custom Element registrado', () => {
    expect(customElements.get('fx-button')).toBeTruthy();
  });

  it('renderiza um <button> interno com slot default para o rótulo', () => {
    const el = mount();
    const btn = el.shadowRoot!.querySelector('button')!;
    // jsdom não projeta light DOM em <slot>; validamos slot + light DOM separadamente.
    expect(btn.querySelector('.btn__label > slot')).toBeTruthy();
    expect(el.textContent).toContain('Salvar');
  });

  it('aplica variantes via atributo', () => {
    const el = mount('variant=danger');
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(el.getAttribute('variant')).toBe('danger');
    expect(btn.className).toContain('btn');
  });

  it('propriedade disabled reflete para o botão interno', () => {
    const el = mount('');
    expect((el as any).disabled).toBe(false);
    (el as any).disabled = true;
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.shadowRoot!.querySelector('button')!.hasAttribute('disabled')).toBe(true);
  });

  it('loading renderiza spinner e desabilita o botão', () => {
    const el = mount('loading');
    expect(el.shadowRoot!.querySelector('.btn__spinner')).toBeTruthy();
    expect(el.shadowRoot!.querySelector('button')!.hasAttribute('aria-busy')).toBe(true);
    expect(el.shadowRoot!.querySelector('button')!.hasAttribute('disabled')).toBe(true);
  });

  it('esconde o container do ícone quando o slot icon está vazio (centralização)', () => {
    const el = mount();
    const iconWrap = el.shadowRoot!.querySelector('.btn__icon')!;
    expect(iconWrap.hasAttribute('hidden')).toBe(true);
  });

  it('attr icon renderiza glifo via ligadura e mostra o container', () => {
    const el = mount('icon=save');
    const iconWrap = el.shadowRoot!.querySelector('.btn__icon')!;
    expect(iconWrap.hasAttribute('hidden')).toBe(false);
    const glyph = iconWrap.querySelector('.fx-icon');
    expect(glyph?.textContent).toBe('save');
  });

  it('slot icon vence o attr icon', () => {
    const el = document.createElement('fx-button');
    el.setAttribute('icon', 'save');
    el.innerHTML = '<i slot="icon" class="custom">x</i>Salvar';
    document.body.appendChild(el);
    const iconWrap = el.shadowRoot!.querySelector('.btn__icon')!;
    expect(iconWrap.querySelector('slot[name="icon"]')).toBeTruthy();
    expect(iconWrap.querySelector('.fx-icon')).toBeFalsy();
  });

  it('icon-pos=right coloca o ícone depois do rótulo', () => {
    const el = mount('icon=save icon-pos=right');
    const btn = el.shadowRoot!.querySelector('button')!;
    const children = [...btn.children].map((n) => n.className);
    expect(children.indexOf('btn__label')).toBeLessThan(children.indexOf('btn__icon'));
  });

  it('escapa HTML no attr icon (sem XSS)', () => {
    const el = mount();
    el.setAttribute('icon', '<img src=x onerror=alert(1)>');
    const iconWrap = el.shadowRoot!.querySelector('.btn__icon')!;
    expect(iconWrap.innerHTML).not.toContain('<img');
    expect(iconWrap.textContent).toContain('<img');
  });

  it('full publica o CSS de largura total no shadow', () => {
    const el = mount('full');
    const styles = (el.constructor as any).styles as string;
    expect(styles).toContain(':host([full])');
    expect(styles).toContain('width: 100%');
  });

  it('icon-only (sem rótulo) recebe classe de botão quadrado centralizado', () => {
    const el = document.createElement('fx-button');
    el.setAttribute('icon', 'save');
    el.setAttribute('aria-label', 'Buscar');
    document.body.appendChild(el);
    const btn = el.shadowRoot!.querySelector('button')!;
    expect(btn.classList.contains('btn--icon-only')).toBe(true);
  });

  it('com rótulo não recebe a classe icon-only', () => {
    const el = mount('icon=save');
    expect(el.shadowRoot!.querySelector('button')!.classList.contains('btn--icon-only')).toBe(false);
  });

  it('dispara evento de clique no host (composed)', () => {
    const el = mount();
    let clicked = 0;
    el.addEventListener('click', () => clicked++);
    el.shadowRoot!.querySelector('button')!.click();
    expect(clicked).toBe(1);
  });

  it('foco respeita o token effect.focus-ring (sem outline fixo)', () => {
    const styles = (FxButton as unknown as { styles: string }).styles;
    expect(styles).not.toContain('outline: 2px solid');
    expect(styles).toContain('box-shadow: var(--fx-effect-focus-ring, none)');
  });
});