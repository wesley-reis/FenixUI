/**
 * Base dos componentes de formulário — Form-Associated Custom Element.
 *
 * Por que ela existe: um `<input>` interno do Shadow DOM **não se associa** ao
 * `<form>` do light DOM (a associação por árvore não cruza a fronteira do
 * shadow). Sem `formAssociated: true` + `ElementInternals`, o componente fica
 * invisível para o form: `new FormData(form)` não o inclui, Enter não submete,
 * `form.elements`/validação/`reset` não o enxergam e `<label for>` não o foca.
 *
 * O que esta base entrega:
 *  - `static formAssociated = true` → o HOST vira campo do form (entra em
 *    `form.elements`, `FormData`, `checkValidity`, `reset`, e é labelable);
 *  - `delegatesFocus: true` → `focus()`, `autofocus` e clique em
 *    `<label for="idDoHost">` focam o controle interno;
 *  - `updateFormValue()` → publica `name`/`value` no form via `internals`;
 *  - `formDisabledCallback` → `<fieldset disabled>` desabilita o controle;
 *  - `formResetCallback` → `form.reset()` restaura o valor inicial;
 *  - getters nativos: `name`, `form`, `type`, `validity`, `labels`,
 *    `checkValidity()`, `reportValidity()`.
 */

import { FxElement } from './base';
import { isSemanticAutocompleteToken } from './user-edit';
import type { UserEditGuard } from './user-edit';

export abstract class FxFormElement extends FxElement {
  /** Participa de <form> como campo nativo (FormData, reset, validação, label). */
  static formAssociated = true;
  /** focus()/autofocus/<label for> atingem o controle interno do Shadow DOM. */
  static override shadowOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: true,
  };

  protected readonly internals: ElementInternals | null;
  /** Valor do atributo `value` quando o componente entrou no form (reset). */
  protected _initialValue = '';
  private _initialCaptured = false;
  private _autofocused = false;

  constructor() {
    super();
    // Ambientes sem ElementInternals (ex.: jsdom nos testes) funcionam sem a
    // integração nativa de form — tudo aqui é defensivo.
    this.internals =
      typeof this.attachInternals === 'function' ? this.attachInternals() : null;
  }

  /** Nome do campo no FormData (atributo `name`, como no nativo). */
  get name(): string {
    return this.getAttribute('name') ?? '';
  }

  /** Form ao qual o componente está associado (null se fora de um form). */
  get form(): HTMLFormElement | null {
    return (
      this.internals?.form ?? (this.closest('form') as HTMLFormElement | null)
    );
  }

  get type(): string {
    return this.localName;
  }

  get willValidate(): boolean {
    return this.internals?.willValidate ?? false;
  }

  get validity(): ValidityState | null {
    return this.internals?.validity ?? null;
  }

  get validationMessage(): string {
    return this.internals?.validationMessage ?? '';
  }

  get labels(): NodeList {
    return this.internals?.labels ?? this.childNodes;
  }

  checkValidity(): boolean {
    return this.internals?.checkValidity?.() ?? true;
  }

  reportValidity(): boolean {
    return this.internals?.reportValidity?.() ?? true;
  }

  protected override connectedCallback(): void {
    super.connectedCallback(); // render inicial
    if (!this._initialCaptured) {
      this._initialCaptured = true;
      this._initialValue = this.getAttr('value');
    }
    this.updateFormValue();
    // autofocus: nem todo browser foca form-associated custom elements (em
    // especial dentro de shadow DOM do app consumidor) — garante aqui. O
    // delegatesFocus leva o foco ao controle interno.
    if (!this._autofocused && this.hasAttr('autofocus')) {
      this._autofocused = true;
      queueMicrotask(() => {
        if (this.isConnected && this.hasAttr('autofocus')) this.focusInnerControl();
      });
    }
  }

  /**
   * Foca o controle interno: primeiro o HOST (com `delegatesFocus` o browser
   * repassa ao controle interno) e, se nada for focado (ex.: ambientes sem
   * delegatesFocus, como jsdom nos testes), o primeiro focável do shadow.
   */
  private focusInnerControl(): void {
    this.focus();
    if (!this.root.activeElement) {
      const first = this.root.querySelector<HTMLElement>(
        'input, textarea, button, select, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    }
  }

  /**
   * Valor publicado no FormData. Sobrescreva quando o valor NÃO é o atributo
   * `value` (checkbox/switch enviariam `value || 'on'` quando marcados,
   * seleção múltipla enviaria várias entradas, fileupload enviaria arquivos).
   */
  protected getFormValue(): string | FormData | null {
    return this.getAttr('value') || null;
  }

  /**
   * Sincroniza o campo interno, publica name/value no form (ElementInternals)
   * e emite `input` (o que o `v-model` do Vue usa) + `valueChange` (o par do
   * two-way binding do Angular, que precisa ler `$event.detail.value`).
   *
   * Chame quando o valor mudar — junto do evento semântico (`change`,
   * `select`, ...) que o componente já dispara. `detail` opcional complementa
   * o payload (ex.: { start, end } do fx-datepicker).
   *
   * Componentes com controle nativo interno (`fx-input`, `fx-textarea`,
   * `fx-autocomplete`) só chamam este método em **edição do usuário** ou no
   * autofill DECLARADO (token semântico de `autocomplete` ou `emit-autofill`).
   * Valor externo sem intenção declarada é bloqueado/desfeito por
   * `acceptExternalValue()` (ver `core/user-edit.ts`).
   */
  protected emitValueEvents(detail?: Record<string, unknown>): void {
    const value = this.getAttr('value');

    // Empurra o valor para o controle interno SEM re-renderizar (hook —
    // componentes com máscara/campo customizado sobrescrevem).
    this.syncInternalControl();
    this.updateFormValue();

    const payload = { value, ...detail };
    for (const type of ['input', 'valueChange'] as const) {
      this.dispatchEvent(
        new CustomEvent(type, { bubbles: true, composed: true, detail: payload }),
      );
    }
  }

  /**
   * `true` quando o evento vindo do controle interno deve virar evento de
   * valor (`input`/`change`/`valueChange`) — isto é, quando veio de edição do
   * usuário. O atributo `emit-autofill` também entra por aqui: com ele o valor
   * externo é aceito e propagado como edição (útil em testes/automação e para
   * quem depende do v-model atualizado pelo navegador).
   */
  protected isUserValueEvent(event: Event, guard: UserEditGuard): boolean {
    return this.hasAttr('emit-autofill') || guard.isUserEdit(event);
  }

  /**
   * `true` quando o host DECLARA que quer autofill: atributo `emit-autofill`
   * ou token semântico de `autocomplete` (`username`, `current-password`,
   * `email`, …). Sem isso, valor colocado no controle interno por autofill do
   * navegador/gerenciador de senha/script é bloqueado (ver
   * `acceptExternalValue` e `core/user-edit.ts`).
   */
  protected wantsAutofill(): boolean {
    return (
      this.hasAttr('emit-autofill') ||
      isSemanticAutocompleteToken(this.getAttr('autocomplete', 'off'))
    );
  }

  /**
   * Trata valor colocado no controle interno SEM edição do usuário (autofill
   * do navegador, gerenciador de senha, script) e devolve `true` quando ele
   * deve ser ACEITO.
   *
   * Aceito (`wantsAutofill()`): o chamador adota o valor, sincroniza
   * `value`/FormData, emite `autofill` e também os eventos de valor.
   *
   * Bloqueado (default): o preenchimento é **desfeito** — o controle interno
   * volta ao valor do host e nada é propagado, então o campo nunca aparece
   * preenchido com credenciais salvas (nem `value`/`FormData` mudam). É a
   * garantia que não depende do `autocomplete="off"`, que o Chrome ignora em
   * `type="password"`.
   */
  protected acceptExternalValue(
    field: HTMLInputElement | HTMLTextAreaElement,
  ): boolean {
    if (this.wantsAutofill()) return true;
    const own = this.getAttr('value');
    if (field.value !== own) field.value = own;
    return false;
  }

  /**
   * Notifica valor colocado no controle interno SEM edição do usuário
   * (autofill do navegador, gerenciador de senha, script) — **apenas** no
   * caminho aceito (token semântico de `autocomplete` ou `emit-autofill`).
   *
   * `input`/`valueChange`/`change` ficam reservados à interação real: quem
   * quiser reagir ao autofill escuta `autofill` (composed, `detail: { value }`).
   * O valor já foi sincronizado em `value` (atributo + FormData) por quem
   * chama — inclusive o `valueChange` do atributo alimenta o `fx-floatlabel`.
   */
  protected dispatchAutofill(value: string): void {
    this.dispatchEvent(
      new CustomEvent('autofill', {
        bubbles: true,
        composed: true,
        detail: { value },
      }),
    );
  }

  /** Sincroniza name/value com o form (ElementInternals). */
  protected updateFormValue(): void {
    if (!this.internals || typeof this.internals.setFormValue !== 'function') return;
    this.internals.setFormValue(this.getFormValue());
  }

  /**
   * <form disabled>/<fieldset disabled>: espelha no atributo `disabled`
   * observado — o re-render desabilita o controle interno.
   */
  formDisabledCallback(disabled: boolean): void {
    if (disabled) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  /** form.reset(): restaura o valor inicial e sincroniza o campo interno. */
  formResetCallback(): void {
    this.setAttribute('value', this._initialValue);
    this.syncInternalControl();
    this.updateFormValue();
  }

  /**
   * Hook: empurra o valor atual do atributo `value` para o controle interno
   * SEM re-renderizar (componentes com campo nativo interno sobrescrevem).
   */
  protected syncInternalControl(): void {
    /* opcional */
  }
}
