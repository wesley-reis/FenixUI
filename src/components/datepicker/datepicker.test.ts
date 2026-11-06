import { describe, it, expect, beforeEach } from 'vitest';
import './index';

function mount(html: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const el = wrapper.firstElementChild as HTMLElement;
  document.body.appendChild(wrapper);
  return el;
}

describe('fx-datepicker', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('é um Custom Element registrado', () => {
    expect(customElements.get('fx-datepicker')).toBeTruthy();
  });

  it('renderiza input com placeholder e ícone de calendário', () => {
    const el = mount('<fx-datepicker placeholder="Escolha a data"></fx-datepicker>');
    const input = el.shadowRoot!.querySelector<HTMLInputElement>('.display')!;
    expect(input.placeholder).toBe('Escolha a data');
    expect(el.shadowRoot!.querySelector('.cal-icon')).toBeTruthy();
  });

  it('abre o calendário ao clicar no campo e mostra fx-calendar dentro do popover', () => {
    const el = mount('<fx-datepicker></fx-datepicker>');
    el.shadowRoot!.querySelector('.field')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(el.hasAttribute('open')).toBe(true);
    const cal = el.shadowRoot!.querySelector('fx-calendar');
    expect(cal).toBeTruthy();
    expect(el.shadowRoot!.querySelector('.pop')).toBeTruthy();
  });

  it('exibe a data selecionada no input (modo single)', async () => {
    const el = mount('<fx-datepicker value="2030-06-15"></fx-datepicker>') as any;
    // deixa o fx-calendar interno registrar/upgradar
    await new Promise((r) => setTimeout(r, 0));
    expect((el.shadowRoot.querySelector('.display') as HTMLInputElement).value).toContain('2030');
  });

  it('limpa com o botão clear e emite change vazio', () => {
    const el = mount('<fx-datepicker clearable value="2030-06-15"></fx-datepicker>') as any;
    let detail: unknown = null;
    el.addEventListener('change', (e: Event) => { detail = (e as CustomEvent).detail; });
    const clear = el.shadowRoot.querySelector('.clear') as HTMLElement;
    expect(clear.hasAttribute('hidden')).toBe(false);
    clear.click();
    expect(el.value).toBe('');
    expect(detail).toEqual({});
  });

  it('range reflete start/end vindos do calendário', async () => {
    const el = mount('<fx-datepicker mode="range" clearable></fx-datepicker>') as any;
    await new Promise((r) => setTimeout(r, 0));
    const cal = el.shadowRoot.querySelector('fx-calendar') as any;
    cal.dispatchEvent(new CustomEvent('change', {
      bubbles: true, composed: true,
      detail: { value: '', start: '2030-01-10', end: '2030-01-20' },
    }));
    expect(el.getAttribute('start')).toBe('2030-01-10');
    expect(el.getAttribute('end')).toBe('2030-01-20');
    expect((el.shadowRoot.querySelector('.display') as HTMLInputElement).value).toContain('→');
  });

  it('formata a exibição com o atributo format', () => {
    const el = mount('<fx-datepicker value="2030-01-09" format="dd/mm/yyyy"></fx-datepicker>') as any;
    expect((el.shadowRoot.querySelector('.display') as HTMLInputElement).value).toBe('09/01/2030');
  });

  it('show-time anexa HH:mm:ss ao valor e exibe no input', async () => {
    const el = mount('<fx-datepicker show-time></fx-datepicker>') as any;
    await new Promise((r) => setTimeout(r, 0));
    const cal = el.shadowRoot.querySelector('fx-calendar') as any;
    cal.dispatchEvent(new CustomEvent('change', {
      bubbles: true, composed: true, detail: { value: '2030-06-15' },
    }));
    expect(el.value).toMatch(/^2030-06-15T\d{2}:\d{2}:\d{2}$/);
    const display = (el.shadowRoot.querySelector('.display') as HTMLInputElement).value;
    expect(display).toMatch(/2030-06-15 \d{2}:\d{2}:\d{2}/);
  });

  it('show-time com format usa tokens HH/MM/SS de hora/minuto/segundo', () => {
    const el = mount('<fx-datepicker show-time value="2030-06-15T14:35:22" format="dd/mm/yyyy HH:MM:SS"></fx-datepicker>') as any;
    expect((el.shadowRoot.querySelector('.display') as HTMLInputElement).value).toContain('14:35:22');
  });

  it('free-text: digita data válida e aplica no valor', () => {
    const el = mount('<fx-datepicker free-text></fx-datepicker>') as any;
    const input = el.shadowRoot.querySelector('.display') as HTMLInputElement;
    expect(input.hasAttribute('readonly')).toBe(false);
    input.value = '15/03/2026';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(el.value).toBe('2026-03-15');
    // texto reformatado no input
    expect(input.value).toBe('15/03/2026');
  });

  it('free-text: rejeita data fora de min/max e emite invalid', () => {
    let invalidDetail: unknown = null;
    const el = mount('<fx-datepicker free-text min="2026-05-01"></fx-datepicker>') as any;
    el.addEventListener('invalid', (e: Event) => { invalidDetail = (e as CustomEvent).detail; });
    const input = el.shadowRoot.querySelector('.display') as HTMLInputElement;
    input.value = '10/01/2026'; // antes do min
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(el.value).toBe('');
    expect(invalidDetail).toEqual({ text: '10/01/2026' });
  });

  it('free-text: rejeita data inexistente (31/02)', () => {
    const el = mount('<fx-datepicker free-text></fx-datepicker>') as any;
    const input = el.shadowRoot.querySelector('.display') as HTMLInputElement;
    input.value = '31/02/2026';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(el.value).toBe('');
  });

  it('multiple: repassa mode ao calendário e acumula datas', () => {
    const el = mount('<fx-datepicker mode="multiple"></fx-datepicker>') as any;
    const received: string[][] = [];
    el.addEventListener('change', (e: Event) => {
      received.push((e as CustomEvent).detail.values);
    });
    // abre o popover
    el.shadowRoot.querySelector('.field')!.dispatchEvent(new Event('click', { bubbles: true }));
    const cal = el.shadowRoot.querySelector('fx-calendar') as any;
    expect(cal.getAttribute('mode')).toBe('multiple'); // regressão: mode era omitido
    // dois cliques em dias diferentes
    const days = cal.shadowRoot.querySelectorAll('button.cell[data-day]:not([disabled])');
    days[2].click();
    // o calendário re-renderiza após cada seleção — reconsulta os nós
    (cal.shadowRoot.querySelectorAll('button.cell[data-day]:not([disabled])')[5] as HTMLElement).click();
    expect(el.values.length).toBe(2);
    expect(received.at(-1)!.length).toBe(2);
    // datas aparecem no campo
    const input = el.shadowRoot.querySelector('.display') as HTMLInputElement;
    expect(input.value).toContain(', ');
  });

  it('picker="date" (padrão) não mostra o bloco de hora', () => {
    const el = mount('<fx-datepicker></fx-datepicker>') as any;
    expect(el.picker).toBe('date');
    expect(el.shadowRoot.querySelector('.time-group')).toBeNull();
    expect(el.shadowRoot.querySelector('fx-calendar')).toBeTruthy();
  });

  it('picker="time" mostra só a hora, sem calendário, com valor HH:mm:ss', async () => {
    const el = mount('<fx-datepicker picker="time" value="14:35:22"></fx-datepicker>') as any;
    await new Promise((r) => setTimeout(r, 0));
    expect(el.shadowRoot.querySelector('fx-calendar')).toBeNull();
    expect(el.shadowRoot.querySelector('.time-group')).toBeTruthy();
    expect((el.shadowRoot.querySelector('.display') as HTMLInputElement).value).toBe('14:35:22');
  });

  it('picker="time": alterar a hora define o valor como HH:mm:ss', async () => {
    const el = mount('<fx-datepicker picker="time"></fx-datepicker>') as any;
    await new Promise((r) => setTimeout(r, 0));
    const h = el.shadowRoot.querySelector('.t-h') as HTMLInputElement;
    h.value = '9';
    h.dispatchEvent(new Event('input', { bubbles: true }));
    expect(el.value).toBe('09:00:00');
  });

  it('picker="datetime" mostra calendário + hora', async () => {
    const el = mount('<fx-datepicker picker="datetime"></fx-datepicker>') as any;
    await new Promise((r) => setTimeout(r, 0));
    expect(el.shadowRoot.querySelector('fx-calendar')).toBeTruthy();
    expect(el.shadowRoot.querySelector('.time-group')).toBeTruthy();
  });

  it('show-time segue como alias legado de picker="datetime"', () => {
    const el = mount('<fx-datepicker show-time></fx-datepicker>') as any;
    expect(el.picker).toBe('datetime');
    expect(el.shadowRoot.querySelector('fx-calendar')).toBeTruthy();
    expect(el.shadowRoot.querySelector('.time-group')).toBeTruthy();
  });

  it('botão "Agora" preenche a hora atual em picker="time"', async () => {
    const el = mount('<fx-datepicker picker="time"></fx-datepicker>') as any;
    await new Promise((r) => setTimeout(r, 0));
    const btn = el.shadowRoot.querySelector('.time-now') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    expect(el.value).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('placeholder acompanha o picker (data / hora / data+hora)', () => {
    const ph = (el: HTMLElement) => (el.shadowRoot!.querySelector('.display') as HTMLInputElement).placeholder;
    expect(ph(mount('<fx-datepicker></fx-datepicker>'))).toBe('dd/mm/aaaa');
    document.body.innerHTML = '';
    expect(ph(mount('<fx-datepicker picker="time"></fx-datepicker>'))).toBe('hh:mm:ss');
    document.body.innerHTML = '';
    expect(ph(mount('<fx-datepicker picker="datetime"></fx-datepicker>'))).toBe('dd/mm/aaaa hh:mm:ss');
  });

  it('placeholder explícito e format têm precedência sobre o padrão por picker', () => {
    const ph = (el: HTMLElement) => (el.shadowRoot!.querySelector('.display') as HTMLInputElement).placeholder;
    expect(ph(mount('<fx-datepicker picker="datetime" format="dd/mm/yyyy HH:MM:SS"></fx-datepicker>'))).toBe('dd/mm/yyyy HH:MM:SS');
    document.body.innerHTML = '';
    expect(ph(mount('<fx-datepicker picker="time" placeholder="Que horas?"></fx-datepicker>'))).toBe('Que horas?');
  });
});
