/**
 * <fx-toast> — notificações imperativas com posição e duração configuráveis.
 *
 * Atributos: kind (success|error|info|warning), title, message,
 * position (top-left|top-center|top-right|bottom-left|bottom-center|bottom-right),
 * duration (ms; 0 = fixo até fechar).
 */
declare const POSITIONS: readonly ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];
export type ToastPosition = (typeof POSITIONS)[number];
type ToastKind = 'success' | 'error' | 'info' | 'warning';
export declare class FxToast extends HTMLElement {
    #private;
    static get observedAttributes(): string[];
    private timer;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    dismiss(): void;
}
export interface ToastOptions {
    /** Texto secundário (também aceito como 2º argumento dos métodos). */
    message?: string;
    position?: ToastPosition;
    /** Tempo em ms até sumir. 0 = fixo até fechar. Padrão: 4000 */
    duration?: number;
}
declare class ToastApi {
    private seq;
    private map;
    push(kind: ToastKind, title: string, messageOrOpts?: string | ToastOptions, opts?: ToastOptions): number;
    close(id: number): void;
    success: (t: string, m?: string, o?: ToastOptions) => number;
    error: (t: string, m?: string, o?: ToastOptions) => number;
    info: (t: string, m?: string, o?: ToastOptions) => number;
    warning: (t: string, m?: string, o?: ToastOptions) => number;
}
export declare const FenixToast: ToastApi;
export declare function defineFxToast(): void;
export {};
//# sourceMappingURL=toast.d.ts.map