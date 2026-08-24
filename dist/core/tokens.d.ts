/**
 * Design Tokens — camada de personalização do FenixUI.
 *
 * Os componentes consomem apenas `var(--fx-*)`, nunca valores fixos.
 * Isso atravessa o Shadow DOM via CSS Custom Properties e permite
 * trocar o tema em runtime sem recompilar a biblioteca.
 */
export interface FenixTokens {
    /** Cores semânticas */ color: Record<'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info', string>;
    /** Superfícies */ surface: Record<'background' | 'surface' | 'surface-hover', string>;
    /** Texto */ text: Record<'default' | 'muted' | 'disabled', string>;
    /** Bordas */ border: Record<'default' | 'hover', string>;
    /** Tipografia */ font: Record<'family' | 'size' | 'weight' | 'line-height', string>;
    /** Espaçamento */ space: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string>;
    /** Radius */ radius: Record<'none' | 'sm' | 'md' | 'lg' | 'full', string>;
    /** Altura dos controles (button, input, select, switch…). Personalizável por preset. */
    size: Record<'sm' | 'md' | 'lg', string>;
    /** Sombras */ shadow: Record<'sm' | 'md' | 'lg', string>;
    /** Motion */ motion: Record<'duration-fast' | 'duration-normal' | 'easing', string>;
    /** Efeitos visuais configuráveis (ripple, anel de foco dos campos). */
    effect: {
        ripple: string;
        'focus-ring': string;
    };
    /** Z-index */ z: Record<'base' | 'dropdown' | 'modal' | 'toast', string>;
}
/** Tema claro (padrão). */
export declare const lightTokens: FenixTokens;
/** Tema escuro — os componentes reagem automaticamente às variáveis CSS. */
export declare const darkTokens: FenixTokens;
export declare const defaultTokens: FenixTokens;
/** Override parcial e profundo — permite customizar apenas alguns tokens por vez. */
export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
//# sourceMappingURL=tokens.d.ts.map