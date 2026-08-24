import { describe, it, expect } from 'vitest';
import './index';
import { FenixToast } from './toast';

describe('fx-toast / FenixToast', () => {
  it('API imperativa cria toasts na tela', async () => {
    FenixToast.success('Salvo!');
    await Promise.resolve();
    const hosts = document.querySelectorAll('fx-toast');
    expect(hosts.length).toBeGreaterThan(0);
    hosts.forEach((h) => h.remove());
  });
});

