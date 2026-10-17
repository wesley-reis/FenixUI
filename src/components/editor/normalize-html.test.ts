import { describe, expect, it } from 'vitest';
import { normalizeHtml, normalizeForStorage } from './normalize-html';

describe('normalize-html', () => {
  it('converte tags legadas e embrulha inline em parágrafo', () => {
    const out = normalizeHtml('<div>Oi <b>mundo</b> <i>!</i></div>');
    expect(out).toBe('<p>Oi <strong>mundo</strong> <em>!</em></p>');
  });

  it('não deixa texto solto no nível raiz', () => {
    const out = normalizeHtml('texto solto<strong>negrito</strong>');
    expect(out).toBe('<p>texto solto<strong>negrito</strong></p>');
  });

  it('embrulha imagem órfã em figure.fx-image', () => {
    const out = normalizeHtml('<p>Antes</p><img src="https://a.com/x.png" alt="X">');
    expect(out).toContain('<figure class="fx-image"');
    expect(out).toContain('data-align="center"');
    expect(out).toContain('<img');
  });

  it('embrulha tabela de conteúdo em figure.fx-table e cria tbody/colgroup', () => {
    const out = normalizeHtml('<table><tr><td>A</td><td>B</td></tr></table>');
    expect(out).toContain('<figure class="fx-table"');
    expect(out).toContain('<tbody>');
    expect(out).toContain('<colgroup>');
    expect(out).toContain('<p>A</p>');
  });

  it('mantém grid como layout table com role=presentation e data-cols', () => {
    const out = normalizeHtml(
      '<table class="fx-grid"><tr><td>A</td><td>B</td></tr></table>',
    );
    expect(out).toContain('role="presentation"');
    expect(out).toContain('data-cols="2"');
    expect(out).not.toContain('fx-table');
  });

  it('remove spans e parágrafos vazios', () => {
    const out = normalizeHtml('<p><span></span></p><p>ok</p>');
    expect(out).toBe('<p>ok</p>');
  });

  it('produz placeholder no modo editor', () => {
    expect(normalizeHtml('', { forEditor: true })).toBe('<p><br></p>');
  });

  it('preserva figure.fx-table existente', () => {
    const out = normalizeHtml(
      '<figure class="fx-table"><table><tr><td>A</td></tr></table></figure>',
    );
    expect(out).toContain('<figure class="fx-table"');
    expect(out).toContain('<table>');
  });

  it('remove contenteditable no modo storage', () => {
    const out = normalizeForStorage('<figure class="fx-image" contenteditable="false"><img src="https://a.com/x.png"></figure>');
    expect(out).not.toContain('contenteditable');
  });

  it('não perde mídia ao normalizar', () => {
    const out = normalizeHtml(
      '<figure class="fx-video"><video controls src="https://a.com/v.mp4"></video></figure>',
    );
    expect(out).toContain('<video');
    expect(out).toContain('fx-video');
  });
});
