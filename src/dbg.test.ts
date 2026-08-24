import { describe, it, expect, beforeEach } from 'vitest';

document.body.innerHTML = `<select id="preset-select"></select><button id="mode-toggle"></button><aside id="sidebar"></aside><main id="main"></main>`;
await import('./docs/app');
const main = () => document.getElementById('main')!;
function navigate(route: string): void {
  location.hash = `#/${route}`;
  window.dispatchEvent(new Event('hashchange'));
}

describe('dbg3', () => {
  beforeEach(() => { navigate('introduction'); });
  it('drawer isolated with await', async () => {
    navigate('fx-drawer');
    await new Promise((r) => setTimeout(r, 0));
    console.log('MAIN HTML len:', main().innerHTML.length);
    console.log('has #drw-demo:', !!main().querySelector('#drw-demo'));
    console.log('has fx-button:', !!main().querySelector('fx-button'));
    const openBtn = [...main().querySelectorAll('fx-button')].find((b) =>
      (b.textContent || '').toUpperCase().includes('ABRIR DRAWER'),
    ) as HTMLElement;
    console.log('BTN found:', !!openBtn, openBtn?.getAttribute('data-fx-open'));
    openBtn.click();
    await new Promise((r) => setTimeout(r, 0));
    const drawer = main().querySelector('#drw-demo') as HTMLElement;
    console.log('OPEN:', drawer?.hasAttribute('open'));
    expect(drawer.hasAttribute('open')).toBe(true);
  });
});
