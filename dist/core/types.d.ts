/**
 * Tipos e unions compartilhados do FenixUI.
 *
 * Estes tipos existem apenas em tempo de compilação — não geram código
 * em runtime. São reexportados pelo índice principal
 * (`import type { FxSize } from '@wrrdev/fenix-ui'`).
 */
/** Tema de cor suportado. */
export type FxTheme = 'light' | 'dark';
/** Tamanhos de controle suportados pela maioria dos componentes. */
export type FxSize = 'sm' | 'md' | 'lg';
/**
 * Base de atributos comuns a praticamente todos os componentes FenixUI
 * expostos via JSX/HTML.
 *
 * Possui uma assinatura de índice (`[key: string]: unknown`) para que
 * atributos e eventos arbitrários — `className`, `onClick`, `style`, … —
 * sejam aceitos sem erro em frameworks JSX (React/Preact/Vue), sem acoplar
 * a biblioteca a nenhum deles. As propriedades explícitas abaixo são as que
 * recebem autocomplete e validação.
 */
export interface FxElementProps {
    /** Estado desativado (equivalente ao atributo `disabled`). */
    disabled?: boolean;
    /** Estado de carregamento (spinner) — onde aplicável. */
    loading?: boolean;
    /** Largura total (equivalente ao atributo `full`, onde aplicável). */
    full?: boolean;
    /** Texto/label do controle. */
    label?: string;
    /** Texto de apoio/placeholder. */
    placeholder?: string;
    /** Valor do controle (string ou número). */
    value?: string | number;
    /** Conteúdo do slot (equivalente a `children` em React). */
    children?: unknown;
    /** Classes CSS externas (React) — via índice também aceita `class`. */
    className?: string;
    /** Estilos inline. */
    style?: string | Record<string, unknown>;
    /** Atributos/eventos arbitrários são aceitos via índice. */
    [key: string]: unknown;
}
//# sourceMappingURL=types.d.ts.map