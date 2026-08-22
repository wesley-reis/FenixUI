/**
 * Registro de tags → subpaths para o auto-import.
 * Mantido em um módulo próprio (sem depender de DOM) para ser usado
 * também no build do cliente via plugin.
 */
export const fenixComponentMap: Record<string, string> = {
  'fx-button': '@fenix-ui/fenix-ui/button',
  'fx-badge': '@fenix-ui/fenix-ui/badge',
  'fx-spinner': '@fenix-ui/fenix-ui/spinner',
  'fx-select': '@fenix-ui/fenix-ui/select',
  'fx-multiselect': '@fenix-ui/fenix-ui/multiselect',
  'fx-input': '@fenix-ui/fenix-ui/input',
  'fx-switch': '@fenix-ui/fenix-ui/switch',
  'fx-calendar': '@fenix-ui/fenix-ui/calendar',
  'fx-datepicker': '@fenix-ui/fenix-ui/datepicker',
  'fx-checkbox': '@fenix-ui/fenix-ui/checkbox',
  'fx-radio': '@fenix-ui/fenix-ui/radio',
  'fx-table': '@fenix-ui/fenix-ui/table',
  'fx-floatlabel': '@fenix-ui/fenix-ui/floatlabel',
};

const TAG_RE = /<(fx-[a-z][a-z-]*)(?=[\s/>])/g;

export interface AutoImportOptions {
  /** Prefixo do pacote (padrão '@fenix-ui/fenix-ui'). */
  packageName?: string;
}

/**
 * Injeta `import '<subpath>'` para cada componente fx-* usado no código
 * que ainda não foi importado. Retorna o código transformado ou o original.
 */
export function transformSource(code: string, options: AutoImportOptions = {}): string {
  const pkg = options.packageName ?? '@fenix-ui/fenix-ui';
  // Subpaths do mapa são reescritos quando um pacote custom é informado.
  const resolve = (sub: string): string =>
    pkg === '@fenix-ui/fenix-ui' ? sub : sub.replace('@fenix-ui/fenix-ui', pkg);

  // Componentes usados e ainda não importados explicitamente.
  const needed = new Set<string>();
  for (const m of code.matchAll(TAG_RE)) {
    const sub = fenixComponentMap[m[1]];
    if (sub) {
      const target = resolve(sub);
      if (!code.includes(`'${target}'`) && !code.includes(`"${target}"`)) {
        needed.add(target);
      }
    }
  }
  if (!needed.size) return code;

  const lines = [...needed].map((s) => `import '${s}';`);

  // Arquivo único (.vue): injeta logo após a abertura do <script>.
  const vueScript = /(<script[^>]*>)\n/.exec(code);
  if (vueScript) {
    return code.replace(vueScript[0], `${vueScript[1]}\n${lines.join('\n')}\n`);
  }

  // TS/JS: injeta após o último import existente (ou no topo).
  let lastEnd = -1;
  for (const m of code.matchAll(/^[ \t]*import\b[^;]*?['"][^'"]+['"];?[^\S\n]*$/gm)) {
    lastEnd = Math.max(lastEnd, m.index + m[0].length);
  }
  if (lastEnd === -1) return `${lines.join('\n')}\n${code}`;
  return `${code.slice(0, lastEnd)}\n${lines.join('\n')}${code.slice(lastEnd)}`;
}

/** Verifica se o arquivo deve ser transformado. */
export function shouldTransform(id: string): boolean {
  return (
    !id.includes('node_modules') &&
    !id.endsWith('.d.ts') &&
    !id.endsWith('.css') &&
    /\.(ts|js|tsx|jsx|vue|html|svelte)$/.test(id)
  );
}
