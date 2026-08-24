/**
 * Motor de Tema e API global do FenixUI.
 *
 * Aplica os Design Tokens como CSS Custom Properties (`--fx-*`) no elemento
 * raiz. Como custom properties atravessam o Shadow DOM, TODOS os componentes
 * passam a reagir ao novo tema em runtime, sem recompilar.
 */
import { type FenixTokens, type DeepPartial } from './tokens';
export declare const VERSION = "0.1.0";
export type ThemeName = 'light' | 'dark';
/** Mescla tokens por grupo, permitindo override parcial (ex.: só `color.primary`). */
export declare function deepMerge<T>(base: T, override: DeepPartial<T> | null): T;
/** Achatamento de tokens em pares `--fx-{grupo}-{chave}` -> valor. */
export declare function tokenCssVars(tokens: FenixTokens): Record<string, string>;
/** Aplica tokens no DOM (padrão: `:root`). Emite evento para notificar a aplicação. */
export declare function applyTokens(themeName: ThemeName, overrides: DeepPartial<FenixTokens> | null, target?: HTMLElement): void;
export interface ConfigureOptions {
    theme?: ThemeName;
    tokens?: DeepPartial<FenixTokens>;
}
/** Configura a biblioteca: tema e/ou tokens. Retorna o estado ativo. */
export declare function configure(options?: ConfigureOptions, target?: HTMLElement): {
    theme: ThemeName;
};
/** Troca o tema para claro/escuro em runtime. */
export declare function theme(name: ThemeName): {
    theme: ThemeName;
};
/** Define tokens customizados (override parcial profundo). */
export declare function setTokens(tokens: DeepPartial<FenixTokens>): {
    theme: ThemeName;
};
/** Volta ao tema claro padrão sem overrides. */
export declare function resetTheme(): {
    theme: ThemeName;
};
/** Namespace público (uso via ESM ou via global `FenixUI` no bundle CDN). */
export declare const FenixUI: {
    version: string;
    configure: typeof configure;
    theme: typeof theme;
    setTokens: typeof setTokens;
    resetTheme: typeof resetTheme;
    tokenCssVars: typeof tokenCssVars;
    deepMerge: typeof deepMerge;
};
//# sourceMappingURL=theme.d.ts.map