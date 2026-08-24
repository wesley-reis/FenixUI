/**
 * Registro de tags → subpaths para o auto-import.
 * Mantido em um módulo próprio (sem depender de DOM) para ser usado
 * também no build do cliente via plugin.
 */
export declare const fenixComponentMap: Record<string, string>;
export interface AutoImportOptions {
    /** Prefixo do pacote (padrão '@fenix-ui/fenix-ui'). */
    packageName?: string;
}
/**
 * Injeta `import '<subpath>'` para cada componente fx-* usado no código
 * que ainda não foi importado. Retorna o código transformado ou o original.
 */
export declare function transformSource(code: string, options?: AutoImportOptions): string;
/** Verifica se o arquivo deve ser transformado. */
export declare function shouldTransform(id: string): boolean;
//# sourceMappingURL=auto-import.d.ts.map