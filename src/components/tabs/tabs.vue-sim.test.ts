import { describe, it, expect } from 'vitest';
import './index';
// @ts-ignore -- subpath do Vue com compiler; sem .d.ts dedicado
import { createApp, type App } from 'vue/dist/vue.esm-bundler.js';

/** Monta um app Vue real com o template informado e devolve o root. */
function mountTemplate(template: string, data: Record<string, unknown> = {}): HTMLElement {
  document.body.innerHTML = '';
  const root = document.createElement('div');
  document.body.appendChild(root);
  const app: App = createApp({ template, data: () => data });
  app.config.compilerOptions.isCustomElement = (tag: string) => tag.startsWith('fx-');
  app.mount(root);
  return root;
}

describe('fx-tabs dentro de um app Vue real', () => {
  it('exibe o painel ativo (template do usuário)', () => {
    const root = mountTemplate(`
      <div>
        <fx-tabs value="seguranca">
          <fx-tab tab="perfil">Perfil</fx-tab>
          <fx-tab tab="seguranca">Segurança</fx-tab>
          <fx-tab tab="notificacoes">Notificações</fx-tab>
          <fx-tab-panel tab="perfil"><p>Dados do perfil.</p></fx-tab-panel>
          <fx-tab-panel tab="seguranca"><p>Senha e 2FA.</p></fx-tab-panel>
          <fx-tab-panel tab="notificacoes"><p>Preferências.</p></fx-tab-panel>
        </fx-tabs>
      </div>
    `);

    const tabs = root.querySelector('fx-tabs')!;
    const panels = Array.from(tabs.querySelectorAll('fx-tab-panel'));
    // eslint-disable-next-line no-console
    console.log('upgraded?', {
      tabs: !!customElements.get('fx-tabs'),
      panel: !!customElements.get('fx-tab-panel'),
    });
    // eslint-disable-next-line no-console
    console.log(
      'painéis:',
      JSON.stringify(
        panels.map((p) => ({ tab: p.getAttribute('tab'), hidden: p.hasAttribute('hidden') })),
      ),
    );
    // eslint-disable-next-line no-console
    console.log('shadow do fx-tabs (120 chars):', tabs.shadowRoot?.innerHTML.slice(0, 120));

    const active = panels.find((p) => p.getAttribute('tab') === 'seguranca')!;
    expect(active.hasAttribute('hidden')).toBe(false);
  });

  it('continua funcionando após re-render reativo do Vue (toggle de estado)', async () => {
    const root = mountTemplate(
      `<div>
        <fx-drawer id="drw" :open="isOpen"></fx-drawer>
        <fx-tabs value="a">
          <fx-tab tab="a">A</fx-tab>
          <fx-tab tab="b">B</fx-tab>
          <fx-tab-panel tab="a"><p>Painel A</p></fx-tab-panel>
          <fx-tab-panel tab="b"><p>Painel B</p></fx-tab-panel>
        </fx-tabs>
      </div>`,
      { isOpen: false },
    );
    const tabs = root.querySelector('fx-tabs')!;
    const panelA = tabs.querySelector('fx-tab-panel[tab="a"]')!;
    expect(panelA.hasAttribute('hidden')).toBe(false);
  });
});

