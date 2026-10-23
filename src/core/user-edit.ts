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
 * `el.value = x` + dispatch manual) é "valor externo" e segue a regra de
 * bloqueio:
 *
 *  - **bloqueado por padrão** — o componente DESFAZ o preenchimento (o
 *    controle interno volta ao valor do host) e nada é propagado: o campo não
 *    fica com credenciais salvas, `value`/`FormData` seguem como estavam e
 *    `input`/`valueChange`/`change` não saem. É o que impede a heurística
 *    "primeiro campo de texto = usuário" de contaminar busca, filtro e login;
 *  - **aceito quando o host declara intenção** — atributo `emit-autofill` ou
 *    token semântico de `autocomplete` (`username`, `current-password`,
 *    `email`, …; ver `isSemanticAutocompleteToken`). Aí o valor é adotado,
 *    sincroniza `value`/FormData, emite `autofill` e **também**
 *    `input`/`valueChange` — autofill declarado é valor de verdade e o
 *    `v-model` do Vue acompanha.
 *
 * O resultado não depende do que cada navegador faz no autofill — depende da
 * regra, aplicada no mesmo ponto (este módulo) por todos os componentes de
 * formulário. O `autocomplete="off"` no campo interno continua sendo a defesa
 * preventiva, mas o guard é a garantia: o Chrome ignora `off` em
 * `type="password"` e o gerenciador de senha preenche mesmo assim.
 *
 * Custo: um listener `beforeinput` por controle interno (O(1), sem
 * observers, timers ou hacks de CSS/animação) e nenhum re-render.
 *
 * Limitações conhecidas (documentadas no README):
 *  - o bloqueio é reativo: depende de o navegador disparar `input` ao
 *    preencher (Chrome/Edge/Firefox disparam; o evento nativo `autofill` ainda
 *    não é Baseline). Sem o evento, resta o `autocomplete` como defesa;
 *  - escolher uma credencial no dropdown do navegador/gerenciador de senha em
 *    um campo bloqueado não cola nada (esse fluxo não dispara `beforeinput`) —
 *    declare o token semântico nos campos onde o autofill é desejado;
 *  - simulação programática (`el.value = x; dispatchEvent(new Event('input'))`)
 *    também é valor externo e é desfeita — use `emit-autofill` quando precisar
 *    adotar o valor.
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

/**
 * Tokens de `autocomplete` que PEDEM autofill (dados do próprio usuário).
 *
 * Fonte: WHATWG HTML — "Autofill" (autofill field names). São os tokens
 * semânticos que os navegadores/gerenciadores de senha usam para classificar o
 * campo; qualquer outro valor (`on`, `off`, `nope`, token desconhecido) NÃO
 * declara intenção de autofill.
 */
const SEMANTIC_AUTOCOMPLETE_TOKENS = new Set([
  // credenciais
  'username', 'current-password', 'new-password', 'one-time-code',
  // contato
  'email', 'tel', 'tel-country-code', 'tel-national', 'tel-area-code',
  'tel-local', 'tel-local-prefix', 'tel-local-suffix', 'tel-extension',
  'impp', 'url',
  // identidade
  'name', 'honorific-prefix', 'given-name', 'additional-name', 'family-name',
  'honorific-suffix', 'nickname', 'organization', 'organization-title',
  'photo', 'sex', 'language', 'bday', 'bday-day', 'bday-month', 'bday-year',
  // endereço
  'street-address', 'address-line1', 'address-line2', 'address-line3',
  'address-level1', 'address-level2', 'address-level3', 'address-level4',
  'country', 'country-name', 'postal-code',
  // pagamento
  'cc-name', 'cc-given-name', 'cc-additional-name', 'cc-family-name',
  'cc-number', 'cc-exp', 'cc-exp-month', 'cc-exp-year', 'cc-csc', 'cc-type',
  'transaction-currency', 'transaction-amount',
]);

/** Modificadores de `autocomplete` que acompanham o token (não são o token). */
const AUTOCOMPLETE_MODIFIERS = new Set([
  'shipping', 'billing', 'home', 'work', 'mobile', 'fax', 'pager',
]);

/**
 * `true` quando o valor de `autocomplete` declara autofill de dados do usuário
 * — isto é, quando o campo quer receber o preenchimento do navegador.
 *
 * Aceita a sintaxe completa da spec (lista separada por espaços, com
 * modificadores): `"section-azul shipping street-address"` ⇒ `true`.
 * `on`/`off`, vazio e tokens desconhecidos ⇒ `false` (sem intenção declarada,
 * logo o valor externo é bloqueado/desfeito pelo componente).
 */
export function isSemanticAutocompleteToken(value: string): boolean {
  return (value || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .some(
      (token) =>
        Boolean(token) &&
        token !== 'on' &&
        token !== 'off' &&
        !token.startsWith('section-') &&
        !AUTOCOMPLETE_MODIFIERS.has(token) &&
        SEMANTIC_AUTOCOMPLETE_TOKENS.has(token),
    );
}
