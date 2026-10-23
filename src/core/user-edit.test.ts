import { describe, it, expect, beforeEach } from 'vitest';
import { createUserEditGuard } from './user-edit';

/**
 * Matriz de casos do guard: cada cenário reproduz o que um navegador/
 * gerenciador de senha faz (ver referências no topo de `user-edit.ts`).
 */
describe('core/user-edit', () => {
  let field: HTMLInputElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    field = document.createElement('input');
    document.body.appendChild(field);
  });

  /** Digitação/colagem do usuário: `beforeinput` + `input`. */
  function userEdit(inputType = 'insertText', cancelable = true): void {
    field.dispatchEvent(new InputEvent('beforeinput', { inputType, cancelable }));
    field.value += 'a';
    field.dispatchEvent(new InputEvent('input', { inputType }));
  }

  it('edição do usuário (beforeinput + input) é reconhecida', () => {
    const guard = createUserEditGuard(field);
    userEdit();
    expect(guard.isUserEdit(new InputEvent('input', { inputType: 'insertText' }))).toBe(true);
  });

  it('paste/IME/recorte (beforeinput com inputType) também contam como edição', () => {
    const guard = createUserEditGuard(field);
    for (const inputType of ['insertFromPaste', 'insertCompositionText', 'deleteContentBackward', 'historyUndo']) {
      userEdit(inputType);
      expect(guard.isUserEdit(new InputEvent('input', { inputType })), inputType).toBe(true);
    }
  });

  it('autofill do Chrome/Safari/gerenciador (input SEM beforeinput) NÃO é edição', () => {
    const guard = createUserEditGuard(field);
    field.value = 'usuario.salvo';
    field.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
    expect(guard.isUserEdit(new InputEvent('input', { inputType: 'insertText' }))).toBe(false);
  });

  it('autofill sem inputType (Event genérico, extensões) NÃO é edição', () => {
    const guard = createUserEditGuard(field);
    field.value = 'usuario.salvo';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    expect(guard.isUserEdit(new Event('input'))).toBe(false);
  });

  it('autofill do Firefox (insertReplacementText NÃO cancelável) NÃO é edição', () => {
    const guard = createUserEditGuard(field);
    userEdit('insertReplacementText', false);
    expect(guard.isUserEdit(new InputEvent('input', { inputType: 'insertReplacementText' }))).toBe(false);
  });

  it('replacement CANCELÁVEL (correção ortográfica/autocomplete do usuário) é edição', () => {
    const guard = createUserEditGuard(field);
    userEdit('insertReplacementText', true);
    expect(guard.isUserEdit(new InputEvent('input', { inputType: 'insertReplacementText' }))).toBe(true);
  });

  it('cada beforeinput vale por UM input (o change seguinte não é edição nova)', () => {
    const guard = createUserEditGuard(field);
    userEdit();
    expect(guard.isUserEdit(new InputEvent('input'))).toBe(true);
    expect(guard.isUserEdit(new Event('change'))).toBe(false);
  });

  it('blur descarta a prova pendente (beforeinput cujo input não chegou)', () => {
    const guard = createUserEditGuard(field);
    field.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', cancelable: true }));
    field.dispatchEvent(new Event('blur'));
    expect(guard.isUserEdit(new InputEvent('input', { inputType: 'insertText' }))).toBe(false);
  });

  it('reset() descarta a prova pendente', () => {
    const guard = createUserEditGuard(field);
    userEdit();
    guard.reset();
    expect(guard.isUserEdit(new InputEvent('input'))).toBe(false);
  });

  describe('fallback sem beforeinput no ambiente', () => {
    /** `EventTarget` puro: não tem `onbeforeinput` (browser antigo/jsdom). */
    function legacyField(): HTMLElement {
      return new EventTarget() as unknown as HTMLElement;
    }

    it('usa o inputType do próprio input', () => {
      const guard = createUserEditGuard(legacyField());
      expect(guard.isUserEdit(new InputEvent('input', { inputType: 'insertText' }))).toBe(true);
      expect(guard.isUserEdit(new InputEvent('input', { inputType: 'insertFromPaste' }))).toBe(true);
    });

    it('inputType de autofill ou ausente NÃO é edição', () => {
      const guard = createUserEditGuard(legacyField());
      expect(guard.isUserEdit(new InputEvent('input', { inputType: 'insertReplacementText' }))).toBe(false);
      expect(guard.isUserEdit(new Event('input'))).toBe(false);
    });
  });
});
