import { esc } from "../../core/sanitize.js";
const LOCALE = "pt-BR";
const PIPES = {
  /** Formata como moeda brasileira (R$). */
  currency: (v) => {
    if (v == null || v === "") return "";
    try {
      return new Intl.NumberFormat(LOCALE, {
        style: "currency",
        currency: "BRL"
      }).format(Number(v));
    } catch {
      return String(v);
    }
  },
  /** Formata como data. Estilos: short | medium | long | full (default medium). */
  date: (v, arg) => {
    const d = toDate(v);
    if (!d) return String(v ?? "");
    const styles = {
      short: { dateStyle: "short" },
      medium: { dateStyle: "medium" },
      long: { dateStyle: "long" },
      full: { dateStyle: "full" }
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
    if (!d) return String(v ?? "");
    try {
      return new Intl.DateTimeFormat(LOCALE, {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(d);
    } catch {
      return d.toLocaleString(LOCALE);
    }
  },
  /** Formata como número (pt-BR). Opcional: `number: 2` (casas decimais). */
  number: (v, arg) => {
    if (v == null || v === "") return "";
    try {
      const opt = {};
      if (arg !== void 0) {
        const dec = Number(arg);
        opt.minimumFractionDigits = dec;
        opt.maximumFractionDigits = dec;
      }
      return new Intl.NumberFormat(LOCALE, opt).format(Number(v));
    } catch {
      return String(v);
    }
  }
};
function toDate(v) {
  if (v == null || v === "") return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === "number") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
const IDENT_START = (ch) => /[a-z_$]/i.test(ch);
const IDENT_PART = (ch) => /[a-z0-9_$]/i.test(ch);
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      let str = "";
      i++;
      while (i < expr.length && expr[i] !== quote) {
        if (expr[i] === "\\" && i + 1 < expr.length) {
          str += expr[i + 1];
          i += 2;
        } else {
          str += expr[i];
          i++;
        }
      }
      i++;
      tokens.push({ type: "str", value: str });
      continue;
    }
    if (ch >= "0" && ch <= "9") {
      let numStr = "";
      while (i < expr.length && (expr[i] >= "0" && expr[i] <= "9" || expr[i] === ".")) {
        numStr += expr[i];
        i++;
      }
      tokens.push({ type: "num", value: numStr });
      continue;
    }
    if (IDENT_START(ch)) {
      let ident = "";
      while (i < expr.length && IDENT_PART(expr[i])) {
        ident += expr[i];
        i++;
      }
      if (ident === "true" || ident === "false" || ident === "null") {
        tokens.push({ type: "kw", value: ident });
      } else {
        tokens.push({ type: "id", value: ident });
      }
      continue;
    }
    const two = expr.slice(i, i + 2);
    if (two === "==" || two === "!=" || two === ">=" || two === "<=") {
      tokens.push({ type: "cmp", value: two });
      i += 2;
      continue;
    }
    if (ch === "+") {
      tokens.push({ type: "op", value: "+" });
      i++;
      continue;
    }
    if (ch === "-") {
      tokens.push({ type: "op", value: "-" });
      i++;
      continue;
    }
    if (ch === "*") {
      tokens.push({ type: "op", value: "*" });
      i++;
      continue;
    }
    if (ch === "/") {
      tokens.push({ type: "op", value: "/" });
      i++;
      continue;
    }
    if (ch === ">") {
      tokens.push({ type: "cmp", value: ">" });
      i++;
      continue;
    }
    if (ch === "<") {
      tokens.push({ type: "cmp", value: "<" });
      i++;
      continue;
    }
    if (ch === "!") {
      tokens.push({ type: "op", value: "!" });
      i++;
      continue;
    }
    if (ch === "?") {
      tokens.push({ type: "qm", value: "?" });
      i++;
      continue;
    }
    if (ch === ":") {
      tokens.push({ type: "colon", value: ":" });
      i++;
      continue;
    }
    if (ch === "|") {
      tokens.push({ type: "pipe", value: "|" });
      i++;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen", value: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen", value: ")" });
      i++;
      continue;
    }
    if (ch === ".") {
      tokens.push({ type: "dot", value: "." });
      i++;
      continue;
    }
    i++;
  }
  return tokens;
}
class Parser {
  constructor(tokens, ctx) {
    this.tokens = tokens;
    this.ctx = ctx;
    this.pos = 0;
  }
  peek() {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }
  next() {
    return this.pos < this.tokens.length ? this.tokens[this.pos++] : null;
  }
  matchType(type) {
    if (this.peek()?.type === type) return this.next();
    return null;
  }
  parse() {
    return this.parsePipe();
  }
  /* pipeExpr := ternary ('|' IDENT (':' pipeArg)? )* */
  parsePipe() {
    let val = this.parseTernary();
    while (this.peek()?.type === "pipe") {
      this.next();
      const nameTok = this.matchType("id");
      if (!nameTok) break;
      let arg;
      if (this.peek()?.type === "colon") {
        this.next();
        const argTok = this.peek();
        if (argTok && (argTok.type === "str" || argTok.type === "num" || argTok.type === "id")) {
          arg = argTok.type === "str" ? argTok.value : String(argTok.value);
          this.next();
        }
      }
      val = this.applyPipe(nameTok.value, arg, val);
    }
    return val;
  }
  /* ternary := comparison ('?' pipeExpr ':' pipeExpr)? */
  parseTernary() {
    const cond = this.parseComparison();
    if (this.peek()?.type === "qm") {
      this.next();
      const trueVal = this.parsePipe();
      if (this.peek()?.type === "colon") {
        this.next();
        const falseVal = this.parsePipe();
        return cond ? trueVal : falseVal;
      }
      return trueVal;
    }
    return cond;
  }
  /* comparison := additive (COMP_OP additive)? */
  parseComparison() {
    const left = this.parseAdditive();
    const tok = this.peek();
    if (tok?.type === "cmp") {
      this.next();
      const right = this.parseAdditive();
      return this.compare(left, tok.value, right);
    }
    return left;
  }
  compare(left, op, right) {
    const l = toComparable(left);
    const r = toComparable(right);
    switch (op) {
      case "==":
        return l == r;
      case "!=":
        return l != r;
      case ">":
        return l > r;
      case "<":
        return l < r;
      case ">=":
        return l >= r;
      case "<=":
        return l <= r;
    }
    return false;
  }
  /* additive := multiplicative (('+' | '-') multiplicative)* */
  parseAdditive() {
    let left = this.parseMultiplicative();
    for (; ; ) {
      const tok = this.peek();
      if (tok?.type === "op" && (tok.value === "+" || tok.value === "-")) {
        this.next();
        const right = this.parseMultiplicative();
        left = tok.value === "+" ? this.add(left, right) : this.subtract(left, right);
      } else break;
    }
    return left;
  }
  add(l, r) {
    if (typeof l === "string" || typeof r === "string") {
      return String(l ?? "") + String(r ?? "");
    }
    return Number(l) + Number(r);
  }
  subtract(l, r) {
    return Number(l) - Number(r);
  }
  /* multiplicative := unary (('*' | '/') unary)* */
  parseMultiplicative() {
    let left = this.parseUnary();
    for (; ; ) {
      const tok = this.peek();
      if (tok?.type === "op" && (tok.value === "*" || tok.value === "/")) {
        this.next();
        const right = this.parseUnary();
        left = tok.value === "*" ? Number(left) * Number(right) : Number(left) / Number(right);
      } else break;
    }
    return left;
  }
  /* unary := ('+' | '-' | '!') unary | primary */
  parseUnary() {
    const tok = this.peek();
    if (tok?.type === "op" && (tok.value === "+" || tok.value === "-")) {
      this.next();
      const val = Number(this.parseUnary());
      return tok.value === "-" ? -val : val;
    }
    if (tok?.type === "op" && tok.value === "!") {
      this.next();
      return !this.parseUnary();
    }
    return this.parsePrimary();
  }
  /* primary := STRING | NUMBER | kw | id ( '.' id )* | '(' pipeExpr ')' */
  parsePrimary() {
    const tok = this.peek();
    if (!tok) return void 0;
    if (tok.type === "lparen") {
      this.next();
      const val = this.parsePipe();
      this.matchType("rparen");
      return val;
    }
    if (tok.type === "str") {
      this.next();
      return tok.value;
    }
    if (tok.type === "num") {
      this.next();
      return Number(tok.value);
    }
    if (tok.type === "kw") {
      this.next();
      return tok.value === "true" ? true : tok.value === "false" ? false : null;
    }
    if (tok.type === "id") {
      this.next();
      let result = this.resolveId(tok.value);
      while (this.peek()?.type === "dot") {
        this.next();
        const propTok = this.peek();
        if (propTok?.type === "id") {
          this.next();
          result = result == null ? void 0 : result[propTok.value];
        } else break;
      }
      return result;
    }
    this.next();
    return void 0;
  }
  resolveId(name) {
    switch (name) {
      case "value":
        return this.ctx.value;
      case "row":
        return this.ctx.row;
      case "true":
        return true;
      case "false":
        return false;
      case "null":
        return null;
      default:
        return this.ctx.row[name];
    }
  }
  applyPipe(name, arg, input) {
    const pipe = PIPES[name];
    if (!pipe) return formatDefault(input);
    try {
      return pipe(input, arg);
    } catch {
      return formatDefault(input);
    }
  }
}
function toComparable(v) {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  return String(v ?? "");
}
function formatDefault(v) {
  if (v == null) return "";
  if (typeof v === "object") return "[object Object]";
  return String(v);
}
function evaluate(expr, ctx) {
  try {
    const tokens = tokenize(expr);
    const parser = new Parser(tokens, ctx);
    const result = parser.parse();
    return formatDefault(result);
  } catch {
    return "";
  }
}
function renderCell(template, row, field) {
  const ctx = { value: row[field], row };
  return template.replace(/\{\{([^}]+)\}\}/g, (_, expr) => esc(evaluate(decodeEntities(expr.trim()), ctx)));
}
function decodeEntities(str) {
  return str.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
export {
  PIPES,
  evaluate,
  renderCell
};
//# sourceMappingURL=expr.js.map
