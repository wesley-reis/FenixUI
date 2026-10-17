import { describe, expect, it } from 'vitest';
import { sanitizeHtml, sanitizeEmbedUrl, sanitizeLinkUrl } from './sanitize-html';

describe('sanitize-html', () => {
  it('remove script, style e handlers inline', () => {
    const out = sanitizeHtml(
      '<p onclick="alert(1)">Oi<script>alert(1)</script><style>body{display:none}</style></p>',
    );
    expect(out).toContain('Oi');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('<style');
    expect(out).not.toContain('onclick');
  });

  it('bloqueia javascript: em links e força rel no target=_blank', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a><a href="https://a.com" target="_blank">y</a>');
    expect(out).not.toContain('javascript:');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it('remove src perigoso de imagem e mantém imagem https', () => {
    const out = sanitizeHtml('<img src="javascript:alert(1)"><img src="https://a.com/x.png" alt="A">');
    expect(out).not.toContain('javascript:');
    expect(out).toContain('https://a.com/x.png');
    expect(out).toContain('loading="lazy"');
  });

  it('bloqueia iframe fora da allowlist e aceita YouTube embed', () => {
    const evil = sanitizeHtml('<iframe src="https://evil.com/embed/x"></iframe>');
    expect(evil).not.toContain('<iframe');

    const ok = sanitizeHtml('<iframe src="https://www.youtube.com/embed/abc123"></iframe>');
    expect(ok).toContain('<iframe');
    expect(ok).toContain('sandbox=');
    expect(ok).toContain('allowfullscreen');
  });

  it('filtra style por allowlist e remove url()', () => {
    const out = sanitizeHtml(
      '<p style="text-align:center;position:fixed;background:url(javascript:alert(1))">x</p>',
    );
    expect(out).toContain('text-align: center');
    expect(out).not.toContain('position');
    expect(out).not.toContain('url(');
  });

  it('remove contenteditable e classes desconhecidas do HTML salvo', () => {
    const out = sanitizeHtml('<p contenteditable="false" class="foo fx-grid">x</p>');
    expect(out).not.toContain('contenteditable');
    expect(out).toContain('fx-grid');
    expect(out).not.toContain('foo');
  });

  it('rejeita data:image/svg+xml', () => {
    const out = sanitizeHtml('<img src="data:image/svg+xml;base64,PHN2Zz48c2NyaXB0Pjwvc2NyaXB0Pjwvc3ZnPg==">');
    expect(out).not.toContain('<img');
  });

  it('helpers de URL', () => {
    expect(sanitizeLinkUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeLinkUrl('/pagina')).toBe('/pagina');
    expect(sanitizeLinkUrl('https://a.com')).toBe('https://a.com');
    expect(sanitizeEmbedUrl('https://www.youtube.com/embed/x')).toContain('youtube.com/embed/x');
    expect(sanitizeEmbedUrl('https://evil.com/embed/x')).toBe('');
  });
});
