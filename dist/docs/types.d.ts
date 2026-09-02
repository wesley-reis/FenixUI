/** Metadados de API exibidos nas tabelas da documentação. */
export interface ApiRow {
    name: string;
    type?: string;
    default?: string;
    desc: string;
}
/** Controle do playground ao vivo. */
export interface DemoControl {
    kind: 'select' | 'toggle' | 'text';
    attr: string;
    label: string;
    options?: string[];
    value?: string | boolean;
    /** Para toggles: começa ligado. */
    on?: boolean;
    /** Para text: dica exibida no placeholder. */
    hint?: string;
}
/** Metadados de uma página de componente da documentação. */
export interface ComponentDoc {
    tag: string;
    title: string;
    group: string;
    lead: string;
    imports: string[];
    demoHtml: (attrs: string) => string;
    variantsHtml?: () => string;
    controls: DemoControl[];
    attributes: ApiRow[];
    events?: ApiRow[];
    slots?: ApiRow[];
    cssVars?: ApiRow[];
    directiveInfo?: {
        name: string;
        description: string;
        attributes: {
            name: string;
            type: string;
            required?: boolean;
            default?: string;
            description: string;
        }[];
        examples: string[];
    };
}
//# sourceMappingURL=types.d.ts.map