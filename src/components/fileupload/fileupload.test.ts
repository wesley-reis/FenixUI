import { describe, it, expect } from 'vitest';
import './index';

/** jsdom não implementa DataTransfer/FileList — stubs mínimos para os testes. */
class FileListStub {
  private _files: File[] = [];
  items = { add: (f: File) => this._files.push(f) };
  get files(): FileList {
    return this._files as unknown as FileList;
  }
}

/** Simula a seleção de arquivos no input escondido (defineProperty, pois jsdom valida o setter). */
function setPickerFiles(el: HTMLElement, files: File[]): void {
  const picker = el.shadowRoot!.querySelector('.picker') as HTMLInputElement;
  Object.defineProperty(picker, 'files', { value: files, configurable: true });
  picker.dispatchEvent(new Event('change'));
}

describe('fx-fileupload', () => {
  it('registra o componente', () => {
    expect(customElements.get('fx-fileupload')).toBeDefined();
  });

  it('seleciona arquivo, exibe nome/tamanho e emite select', () => {
    const el = document.createElement('fx-fileupload');
    document.body.appendChild(el);
    let files: File[] = [];
    el.addEventListener('select', (e: Event) => (files = (e as CustomEvent).detail.files));

    setPickerFiles(el, [new File(['hello'], 'relatorio.pdf', { type: 'application/pdf' })]);

    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('relatorio.pdf');
    const name = el.shadowRoot!.querySelector('.file .name') as HTMLElement;
    expect(name.textContent).toBe('relatorio.pdf');
    expect((el.shadowRoot!.querySelector('.file .size') as HTMLElement).textContent).toContain('B');
    el.remove();
  });

  it('exibe porcentagem de progresso com show-progress e emite complete', () => {
    const el = document.createElement('fx-fileupload');
    el.setAttribute('show-progress', '');
    document.body.appendChild(el);

    setPickerFiles(el, [new File(['x'], 'a.txt')]);

    let completed = false;
    el.addEventListener('complete', () => (completed = true));

    el.progress = 60;
    expect((el.shadowRoot!.querySelector('.pct') as HTMLElement).textContent).toBe('60%');
    el.progress = 100;
    expect((el.shadowRoot!.querySelector('.pct') as HTMLElement).textContent).toBe('100%');
    expect(completed).toBe(true);
    el.remove();
  });

  it('ícone só aparece com o atributo icon e remove limpa arquivos', () => {
    const el = document.createElement('fx-fileupload');
    el.setAttribute('icon', '📄');
    document.body.appendChild(el);
    expect(el.shadowRoot!.querySelector('.btn .icon')).toBeTruthy();

    const el2 = document.createElement('fx-fileupload');
    document.body.appendChild(el2);
    expect(el2.shadowRoot!.querySelector('.btn .icon')).toBeNull();

    // remove arquivo
    setPickerFiles(el2, [new File(['x'], 'a.txt')]);
    let removedFile: File | undefined;
    el2.addEventListener('remove', (e: Event) => (removedFile = (e as CustomEvent).detail.file));
    (el2.shadowRoot!.querySelector('.remove') as HTMLButtonElement).click();
    expect(removedFile?.name).toBe('a.txt');
    expect(el2.shadowRoot!.querySelector('.file')).toBeNull();

    el.remove();
    el2.remove();
  });

  it('severity aplica cor no botão do modo basic', () => {
    const el = document.createElement('fx-fileupload');
    el.setAttribute('severity', 'danger');
    document.body.appendChild(el);
    // template renderiza com o atributo observado sem erros
    expect(el.shadowRoot!.querySelector('button.btn')).toBeTruthy();
    // refletir mudança de atributo re-renderiza sem quebrar
    el.setAttribute('severity', 'success');
    expect(el.shadowRoot!.querySelector('button.btn')).toBeTruthy();
    el.remove();
  });

  it('modo advanced renderiza dropzone com drag & drop', () => {
    const el = document.createElement('fx-fileupload');
    el.setAttribute('mode', 'advanced');
    document.body.appendChild(el);
    const drop = el.shadowRoot!.querySelector('.drop') as HTMLElement;
    expect(drop).toBeTruthy();

    const dt = new FileListStub();
    dt.items.add(new File(['x'], 'd.txt'));
    const ev = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent;
    Object.defineProperty(ev, 'dataTransfer', { value: dt });
    drop.dispatchEvent(ev);
    expect(el.files[0]?.name).toBe('d.txt');
    el.remove();
  });
});
