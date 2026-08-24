/**
 * Presets de tema prontos para uso.
 *
 * Cada preset é um override parcial profundo sobre os tokens base.
 * Combina com o modo claro/escuro: `applyPreset('seiya', 'dark')`.
 */
import { type DeepPartial, type FenixTokens } from './tokens';
export interface FenixPreset {
    /** Identificador usado em `applyPreset(name)`. */
    name: string;
    /** Rótulo amigável para UIs (documentação/seletor). */
    label: string;
    /** Override parcial de tokens aplicado sobre o tema base. */
    tokens: DeepPartial<FenixTokens>;
}
export declare const themePresets: {
    readonly fenix: FenixPreset;
    readonly seiya: FenixPreset;
    readonly shiryu: FenixPreset;
    readonly hyoga: FenixPreset;
    readonly shun: FenixPreset;
    readonly ikki: FenixPreset;
    readonly aiolia: FenixPreset;
};
/** Lista todos os presets registrados (inclui os customizados). */
export declare function listPresets(): FenixPreset[];
/**
 * Registra um preset personalizado, tornando-o disponível em `applyPreset`.
 * Útil para o usuário criar seu próprio tema e reutilizá-lo na aplicação.
 */
export declare function defineCustomPreset(name: string, label: string, tokens: DeepPartial<FenixTokens>): FenixPreset;
/**
 * Aplica um preset + modo de cor em runtime.
 * @returns o estado ativo ({ theme }) repassado por `configure`.
 */
export declare function applyPreset(presetName: string, mode?: 'light' | 'dark'): {
    theme: 'light' | 'dark';
    preset: string;
};
//# sourceMappingURL=presets.d.ts.map