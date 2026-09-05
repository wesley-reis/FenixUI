/**
 * Avaliador de expressões **seguro** (sem `eval`/`Function`) usado pelos
 * templates de célula do `<fx-table>`.
 *
 * Permite personalizar o conteúdo de uma coluna:
 *
 * ```html
 * <fx-column field="preco" header="Preço">
 *   <template>R$ {{ value | currency }}</template>
 * </fx-column>
 *
 * <fx-column field="status" header="Situação">
 *   <template>
 *     <i class="pi pi-{{ row.status === 'ativo' ? 'check' : 'times' }}"></i>
 *   </template>
 * </fx-column>
 * ```
 *
 * Contexto de variáveis dentro de `{{ }}`:
 * - `value` — valor do campo da coluna (row[field])
 * - `row`   — objeto completo da linha
 * - `row.campo` — acesso a qualquer campo da linha
 *
 * Pipes: `value | currency`, `value | date`, `value | date: 'short'`,
 * `value | dateTime`, `value | number`, `value | number: 2`
 */

type Row = Record<string, unknown>;
export type EvalCtx = { value: unknown; row: Row };

import { esc } from '../../core/sanitize';

/* ------------------------------------------------------------------ *
 *  Pipes built-in
 * ------------------------------------------------------------------ */
const LOCALE = 'pt-BR';

export const PIPES: Record<string, (v: unknown, arg?: string) => string> = {
  /** Formata como moeda brasileira (R$). */
  currency: (v) => {
    if (v == null || v === '') return '';
    try {
      return new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency: 'BRL',
      }).format(Number(v));
    } catch {
      return String(v);
    }
  },

  /** Formata como data. Estilos: short | medium | long | full (default medium). */
  date: (v, arg) => {
    const d = toDate(v);
    if (!d) return String(v ?? '');
    const styles: Record<string, Intl.DateTimeFormatOptions> = {
      short: { dateStyle: 'short' },
      medium: { dateStyle: 'medium' },
      long: { dateStyle: 'long' },
      full: { dateStyle: 'full' },
    };
    const opts = arg && styles[arg] ? styles[arg] : styles.medium;
    try {
      return new Intl.DateTimeFormat(LOCALE, opts).format(d);
    } catch {
      return d.toLocaleDateString(LOCALE);
    }
  },

  /** Formata como data + hora (medium/short). */
  dateTime: (v) => {
    const d = toDate(v);
    if (!d) return String(v ?? '');
    try {
      return new Intl.DateTimeFormat(LOCALE, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return d.toLocaleString(LOCALE);
    }
  },

  /** Formata como número (pt-BR). Opcional: `number: 2` (casas decimais). */
  number: (v, arg) => {
    if (v == null || v === '') return '';
    try {
      const opt: Intl.NumberFormatOptions = {};
      if (arg !== undefined) {
        const dec = Number(arg);
        opt.minimumFractionDigits = dec;
        opt.maximumFractionDigits = dec;
      }
      return new Intl.NumberFormat(LOCALE, opt).format(Number(v));
    } catch {
      return String(v);
    }
  },
};

function toDate(v: unknown): Date | null {
  if (v == null || v === '') return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === 'number') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === 'string') {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 *  Tokenizer
 * ------------------------------------------------------------------ */
type TType =
  | 'str'       // 'texto' ou "texto"
  | 'num'       // 42, 3.14
  | 'id'        // value, row, nome, status
  | 'kw'        // true, false, null
  | 'op'        // + - * /
  | 'cmp'       // == != > < >= <=
  | 'pipe'      // |
  | 'qm'        // ?
  | 'colon'     // :
  | 'lparen'    // (
  | 'rparen'    // )
  | 'dot';      // .

interface Token {
  type: TType;
  value: string;
}

const IDENT_START = (ch: string) => /[a-z_$]/i.test(ch);
const IDENT_PART = (ch: string) => /[a-z0-9_$]/i.test(ch);

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    // Whitespace
    if (/\s/.test(ch)) { i++; continue; }

    // String literals: '...' ou "..."
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let str = '';
      i++;
      while (i < expr.length && expr[i] !== quote) {
        if (expr[i] === '\\' && i + 1 < expr.length) {
          str += expr[i + 1];
          i += 2;
        } else {
          str += expr[i];
          i++;
        }
      }
      i++; // skip closing quote
      tokens.push({ type: 'str', value: str });
      continue;
    }

    // Numbers (apenas se começar com dígito — evita ambiguidade com .)
    if (ch >= '0' && ch <= '9') {
      let numStr = '';
      while (i < expr.length && (expr[i] >= '0' && expr[i] <= '9' || expr[i] === '.')) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: 'num', value: numStr });
      continue;
    }

    // Identifiers / keywords
    if (IDENT_START(ch)) {
      let ident = '';
      while (i < expr.length && IDENT_PART(expr[i])) {
        ident += expr[i];
        i++;
      }
      if (ident === 'true' || ident === 'false' || ident === 'null') {
        tokens.push({ type: 'kw', value: ident });
      } else {
        tokens.push({ type: 'id', value: ident });
      }
      continue;
    }

    // Two-char comparison operators
    const two = expr.slice(i, i + 2);
    if (two === '==' || two === '!=' || two === '>=' || two === '<=') {
      tokens.push({ type: 'cmp', value: two });
      i += 2;
      continue;
    }

    // Single-char arithmetic / comparison
    if (ch === '+') { tokens.push({ type: 'op', value: '+' }); i++; continue; }
    if (ch === '-') { tokens.push({ type: 'op', value: '-' }); i++; continue; }
    if (ch === '*') { tokens.push({ type: 'op', value: '*' }); i++; continue; }
    if (ch === '/') { tokens.push({ type: 'op', value: '/' }); i++; continue; }
    if (ch === '>') { tokens.push({ type: 'cmp', value: '>' }); i++; continue; }
    if (ch === '<') { tokens.push({ type: 'cmp', value: '<' }); i++; continue; }
    if (ch === '!') { tokens.push({ type: 'op', value: '!' }); i++; continue; }
    if (ch === '?') { tokens.push({ type: 'qm', value: '?' }); i++; continue; }
    if (ch === ':') { tokens.push({ type: 'colon', value: ':' }); i++; continue; }
    if (ch === '|') { tokens.push({ type: 'pipe', value: '|' }); i++; continue; }
    if (ch === '(') { tokens.push({ type: 'lparen', value: '(' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'rparen', value: ')' }); i++; continue; }
    if (ch === '.') { tokens.push({ type: 'dot', value: '.' }); i++; continue; }

    // Unknown — skip silently
    i++;
  }

  return tokens;
}

/* ------------------------------------------------------------------ *
  *  Parser — recursive descent, avalia durante o parsing
 * ------------------------------------------------------------------ */

class Parser {
  private pos = 0;

  constructor(
    private tokens: Token[],
    private ctx: EvalCtx,
  ) {}

  private peek(): Token | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }

  private next(): Token | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos++] : null;
  }

  private matchType(type: TType): Token | null {
    if (this.peek()?.type === type) return this.next();
    return null;
  }

  parse(): unknown {
    return this.parsePipe();
  }

  /* pipeExpr := ternary ('|' IDENT (':' pipeArg)? )* */
  private parsePipe(): unknown {
    let val = this.parseTernary();

    while (this.peek()?.type === 'pipe') {
      this.next(); // consume |
      const nameTok = this.matchType('id');
      if (!nameTok) break;

      let arg: string | undefined;
      if (this.peek()?.type === 'colon') {
        this.next(); // consume :
        const argTok = this.peek();
        if (argTok && (argTok.type === 'str' || argTok.type === 'num' || argTok.type === 'id')) {
          arg = argTok.type === 'str' ? argTok.value : String(argTok.value);
          this.next();
        }
      }

      val = this.applyPipe(nameTok.value, arg, val);
    }
    return val;
  }

  /* ternary := comparison ('?' pipeExpr ':' pipeExpr)? */
  private parseTernary(): unknown {
    const cond = this.parseComparison();
    if (this.peek()?.type === 'qm') {
      this.next(); // consume ?
      const trueVal = this.parsePipe();
      if (this.peek()?.type === 'colon') {
        this.next(); // consume :
        const falseVal = this.parsePipe();
        return cond ? trueVal : falseVal;
      }
      return trueVal;
    }
    return cond;
  }

  /* comparison := additive (COMP_OP additive)? */
  private parseComparison(): unknown {
    const left = this.parseAdditive();
    const tok = this.peek();
    if (tok?.type === 'cmp') {
      this.next();
      const right = this.parseAdditive();
      return this.compare(left, tok.value, right);
    }
    return left;
  }

  private compare(left: unknown, op: string, right: unknown): boolean {
    const l = toComparable(left);
    const r = toComparable(right);
    switch (op) {
      case '==': return l == r;
      case '!=': return l != r;
      case '>':  return l > r;
      case '<':  return l < r;
      case '>=': return l >= r;
      case '<=': return l <= r;
    }
        return false;
  }

  /* additive := multiplicative (('+' | '-') multiplicative)* */
  private parseAdditive(): unknown {
    let left = this.parseMultiplicative();
    for (;;) {
      const tok = this.peek();
      if (tok?.type === 'op' && (tok.value === '+' || tok.value === '-')) {
        this.next();
        const right = this.parseMultiplicative();
        left = tok.value === '+' ? this.add(left, right) : this.subtract(left, right);
      } else break;
    }
    return left;
  }

  private add(l: unknown, r: unknown): unknown {
    if (typeof l === 'string' || typeof r === 'string') {
      return String(l ?? '') + String(r ?? '');
    }
    return Number(l) + Number(r);
  }

  private subtract(l: unknown, r: unknown): unknown {
    return Number(l) - Number(r);
  }

  /* multiplicative := unary (('*' | '/') unary)* */
  private parseMultiplicative(): unknown {
    let left = this.parseUnary();
    for (;;) {
      const tok = this.peek();
      if (tok?.type === 'op' && (tok.value === '*' || tok.value === '/')) {
        this.next();
        const right = this.parseUnary();
        left = tok.value === '*' ? Number(left) * Number(right) : Number(left) / Number(right);
      } else break;
    }
    return left;
  }

  /* unary := ('+' | '-' | '!') unary | primary */
  private parseUnary(): unknown {
    const tok = this.peek();
    if (tok?.type === 'op' && (tok.value === '+' || tok.value === '-')) {
      this.next();
      const val = Number(this.parseUnary());
      return tok.value === '-' ? -val : val;
    }
    if (tok?.type === 'op' && tok.value === '!') {
      this.next();
      return !this.parseUnary();
    }
    return this.parsePrimary();
  }

  /* primary := STRING | NUMBER | kw | id ( '.' id )* | '(' pipeExpr ')' */
  private parsePrimary(): unknown {
    const tok = this.peek();
    if (!tok) return undefined;

    if (tok.type === 'lparen') {
      this.next();
      const val = this.parsePipe();
      this.matchType('rparen');
      return val;
    }

    if (tok.type === 'str') { this.next(); return tok.value; }
    if (tok.type === 'num') { this.next(); return Number(tok.value); }

    if (tok.type === 'kw') {
      this.next();
      return tok.value === 'true' ? true
        : tok.value === 'false' ? false
        : null;
    }

    if (tok.type === 'id') {
      this.next();
      let result: unknown = this.resolveId(tok.value);

      while (this.peek()?.type === 'dot') {
        this.next(); // consume .
        const propTok = this.peek();
        if (propTok?.type === 'id') {
          this.next();
          result = result == null
            ? undefined
            : (result as Record<string, unknown>)[propTok.value];
        } else break;
      }
      return result;
    }

    this.next(); // skip token inesperado
    return undefined;
  }

  private resolveId(name: string): unknown {
    switch (name) {
      case 'value': return this.ctx.value;
      case 'row':   return this.ctx.row;
      case 'true':  return true;
      case 'false': return false;
      case 'null':  return null;
      default:      return this.ctx.row[name];
    }
  }

  private applyPipe(name: string, arg: string | undefined, input: unknown): string {
    const pipe = PIPES[name];
    if (!pipe) return formatDefault(input);
    try {
            return pipe(input, arg);
    } catch {
      return formatDefault(input);
    }
  }
}

function toComparable(v: unknown): number | string {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  return String(v ?? '');
}

function formatDefault(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object') return '[object Object]';
  return String(v);
}

/* ------------------------------------------------------------------ *
 *  API pública
 * ------------------------------------------------------------------ */

/** Avalia uma única expressão `{{ }}` retornando uma string. */
export function evaluate(expr: string, ctx: EvalCtx): string {
  try {
    const tokens = tokenize(expr);
    const parser = new Parser(tokens, ctx);
    const result = parser.parse();
    return formatDefault(result);
  } catch {
    return '';
  }
}

/** Processa um template HTML substituindo todas as ocorrências `{{ expr }}`. */
export function renderCell(template: string, row: Row, field: string): string {
  const ctx: EvalCtx = { value: row[field], row };
  return template.replace(/\{\{([^}]+)\}\}/g, (_, expr: string) =>
    esc(evaluate(decodeEntities(expr.trim()), ctx)));
}

/** Decodifica entidades HTML que o serializador do innerHTML pode inserir (ex: &gt; &lt; &amp;). */
function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
