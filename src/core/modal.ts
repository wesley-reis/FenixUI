/**
 * Utilitários compartilhados por <fx-dialog> e <fx-drawer>.
 *
 * Reúnem três necessidades que os dois componentes têm em comum:
 *  - lista de elementos focáveis incluindo o conteúdo slotted do consumidor
 *    (o light DOM não é alcançado por `shadowRoot.querySelectorAll`);
 *  - detecção do modal do topo (Escape fecha apenas um por vez);
 *  - bloqueio do scroll do <body> com contador (dois modais abertos não
 *    liberam o scroll quando apenas um fecha).
 */

/** Seletor de elementos focáveis via teclado. */
export const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/** Remove nós desabilitados/ocultos de uma lista de focáveis. */
function usable(nodes: Iterable<HTMLElement>): HTMLElement[] {
  return [...nodes].filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      el.getAttribute('tabindex') !== '-1',
  );
}

/**
 * Focáveis do modal = estrutura do Shadow DOM + conteúdo slotted (light DOM).
 * A ordem mantém primeiro os controles internos (ex.: botão fechar) e depois
 * os campos/botões do consumidor.
 */
export function modalFocusables(panel: ParentNode, host: ParentNode): HTMLElement[] {
  const shadow = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  const light = host.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return usable([...shadow, ...light]);
}

/** Primeiro focável pertencente ao conteúdo slotted (light DOM). */
export function firstLightFocusable(host: ParentNode): HTMLElement | null {
  return usable(host.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))[0] ?? null;
}

/**
 * Pilha de modais abertos, na ordem de abertura.
 *
 * A ordem do DOM não serve: dois dialogs irmãos podem ser abertos em ordem
 * inversa. A pilha garante que o Escape feche apenas o modal do topo.
 */
const modalStack: HTMLElement[] = [];

/** Registra a abertura do modal (idempotente). */
export function registerModalOpen(host: HTMLElement): void {
  if (!modalStack.includes(host)) modalStack.push(host);
}

/** Remove o modal da pilha ao fechar/desconectar. */
export function registerModalClose(host: HTMLElement): void {
  const index = modalStack.indexOf(host);
  if (index !== -1) modalStack.splice(index, 1);
}

/** O host é o modal mais recentemente aberto (o do topo)? */
export function isTopmostModal(host: HTMLElement): boolean {
  if (modalStack.length === 0) return true;
  return modalStack[modalStack.length - 1] === host;
}

let scrollLocks = 0;
let previousOverflow = '';
let previousPaddingRight = '';

/** Bloqueia o scroll do body (idempotente por modal que chamar lock). */
export function lockBodyScroll(): void {
  if (typeof document === 'undefined' || !document.body) return;
  if (scrollLocks === 0) {
    const body = document.body;
    previousOverflow = body.style.overflow;
    previousPaddingRight = body.style.paddingRight;
    // Compensa a barra de rolagem para o layout não "pular" ao travar.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  }
  scrollLocks += 1;
}

/** Libera o scroll do body quando o último modal aberto fecha. */
export function unlockBodyScroll(): void {
  if (typeof document === 'undefined' || !document.body) return;
  if (scrollLocks === 0) return;
  scrollLocks -= 1;
  if (scrollLocks === 0) {
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPaddingRight;
  }
}
