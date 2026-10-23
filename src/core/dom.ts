/**
 * Ambiente de DOM — checagens compartilhadas pelos componentes.
 *
 * Existe por causa de callbacks DIFERIDOS (`setTimeout`, `requestAnimationFrame`,
 * `MutationObserver`) que sobrevivem ao fim do ambiente onde foram agendados.
 * Dois cenários reais:
 *
 *  1. **SSR/Node**: o módulo é importado sem DOM nenhum;
 *  2. **Teardown dos testes**: o Vitest fecha a janela do jsdom e remove os
 *     globais (`document`, `HTMLElement`, `CustomEvent`, …). Um timer agendado
 *     antes disso continua na fila; ao disparar, encontra o global ausente e
 *     explode com `ReferenceError: HTMLElement is not defined`. O Vitest
 *     reporta isso como "Unhandled Errors" e a esteira falha — mesmo com todos
 *     os testes verdes.
 *
 * Use esta checagem no topo de todo callback diferido que toca o DOM ou
 * construtores do browser (`HTMLElement`, `CustomEvent`, `document`, …).
 */
export function isDomAvailable(): boolean {
  return (
    typeof document !== 'undefined' &&
    typeof HTMLElement !== 'undefined' &&
    typeof CustomEvent !== 'undefined'
  );
}
