/**
 * Guard de edição do usuário — separa DIGITAÇÃO REAL de valor injetado.
 *
 * Por que existe: autofill do navegador, gerenciador de senha e scripts
 * colocam valor no controle interno (`<input>`/`<textarea>` do Shadow DOM) e
 * disparam `input`/`change` **composed**, que atravessam a fronteira do
 * shadow e chegam ao host do componente. Sem filtro, o `input` emitido pelo
 * componente mente para o consumidor ("o usuário digitou isto") e o v-model
 * do Vue recebe valores que o usuário não digitou (ex.: o username do login
 * salvo no navegador).
 *
 * A plataforma NÃO oferece um sinal confiável e interoperável de autofill:
 *
 *  - whatwg/html#3016 (aberta, rotulada "implementations are not
 *    interoperable"): a spec só diz que o autofill age *"as if the user had
 *    modified the control's data"* — cada UA sintetiza os eventos que quiser
 *    (Chrome: focus/input/change sem mover o foco real; Firefox:
 *    input/change);
 *  - Chrome/Edge e Safari **não** disparam `beforeinput` no autofill de
 *    gerenciador de senha (WebKit 217692 / Chromium 40673974; o W3C
 *    registrou como bug de implementação em w3c/input-events#171);
 *  - Firefox **dispara** `beforeinput`, mas marca o autofill com
 *    `inputType: 'insertReplacementText'` **não cancelável** (hack
 *    documentado em D93206). O autocomplete do usuário e a correção
 *    ortográfica são canceláveis;
 *  - extensões só passaram a atravessar o shadow root recentemente
 *    (Bitwarden, `composed: true`, 2026);
 *  - o evento nativo `autofill` (Chrome 147, origin trial) ainda não é
 *    Baseline — não dá para depender dele.
 *
 * Estratégia: uma única regra, igual em todos os navegadores. Só é edição do
 * usuário quando houver **prova positiva** — um `beforeinput` de edição
 * imediatamente antes do `input` (teclado, IME, colar, recortar, arrastar,
 * undo/redo). Todo o resto (autofill nativo, gerenciador de senha, script,
 * `el.value = x` + dispatch manual) cai no caminho de "valor externo" do
 * componente: sincroniza `value`/FormData e emite `autofill`, sem poluir
 * `input`/`valueChange`/`change`. O resultado não depende do que cada
 * navegador faz no autofill — depende da regra, aplicada no mesmo ponto
 * (este módulo) por todos os componentes de formulário.
 *
 * Custo: um listener `beforeinput` por controle interno (O(1), sem
 * observers, timers ou hacks de CSS/animação) e nenhum re-render.
 *
 * Limitações conhecidas (documentadas no README):
 *  - seleção no dropdown de valores salvos do Chrome também é classificada
 *    como autofill (o Chrome não dispara `beforeinput` nesse fluxo);
 *  - simulação programática (`el.value = x; dispatchEvent(new Event('input'))`)
 *    deixa de emitir `input` — use o atributo `emit-autofill` quando precisar
 *    do comportamento antigo.
 */

/** `inputType` com que o Firefox marca preenchimento automático. */
const REPLACEMENT_TEXT = 'insertReplacementText';

export interface UserEditGuard {
  /**
   * `true` quando o `input` observado no controle interno veio de edição real
   * do usuário. Consome a prova pendente: cada `beforeinput` vale por **um**
   * `input` (o primeiro `change` seguinte, no blur, não é edição nova).
   */
  isUserEdit(inputEvent: Event): boolean;
  /** Descarta a prova pendente (blur/re-render/disconnect). */
  reset(): void;
}

/**
 * Liga o guard a um controle interno. Chame a cada `render()` — o controle
 * interno é recriado e os listeners (inclusive os do guard) vão com ele.
 */
export function createUserEditGuard(field: HTMLElement): UserEditGuard {
  // Fallback para ambientes sem `beforeinput` (browsers antigos): não há como
  // provar a edição, então a decisão usa o `inputType` do próprio `input`.
  const hasBeforeInput = 'onbeforeinput' in field;
  let pending: InputEvent | null = null;

  const onBeforeInput = (event: Event): void => {
    const input = event as InputEvent;
    // Autofill do Firefox: replacement NÃO cancelável não é edição do
    // usuário. Replacement cancelável (autocomplete do usuário, correção
    // ortográfica) segue contando como edição.
    pending =
      input.inputType === REPLACEMENT_TEXT && !input.cancelable ? null : input;
  };
  // Blur descarta prova pendente: sem isso, um `beforeinput` cujo `input` não
  // chegou (edição cancelada/maxlength) contaminaria um autofill posterior.
  const onBlur = (): void => {
    pending = null;
  };

  field.addEventListener('beforeinput', onBeforeInput);
  field.addEventListener('blur', onBlur);

  return {
    isUserEdit(inputEvent: Event): boolean {
      if (!hasBeforeInput) {
        // Sem `beforeinput` no ambiente: `input` sem `inputType` (Event
        // genérico — autofill do Chrome/Safari e gerenciadores de senha) ou
        // `insertReplacementText` (autofill do Firefox) ⇒ valor externo.
        const inputType = (inputEvent as InputEvent).inputType;
        return Boolean(inputType) && inputType !== REPLACEMENT_TEXT;
      }
      const before = pending;
      pending = null;
      return before !== null;
    },
    reset(): void {
      pending = null;
    },
  };
}
