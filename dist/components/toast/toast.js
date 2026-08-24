var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _FxToast_instances, render_fn;
const KIND_COLOR = {
  success: "var(--fx-color-success, #10b981)",
  error: "var(--fx-color-danger, #f43f5e)",
  info: "var(--fx-color-info, #0ea5e9)",
  warning: "var(--fx-color-warning, #f59e0b)"
};
const KIND_ICON = {
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i"
};
const CARD_CSS = `
:host { display: contents; }
.card {
  display: flex; align-items: flex-start; gap: 10px;
  min-width: 260px; max-width: 360px;
  background: var(--fx-surface-background, #fff);
  color: var(--fx-text-default, #1e293b);
  border: 1px solid var(--fx-border-default, #e2e8f0);
  border-left: 4px solid var(--kind);
  border-radius: var(--fx-radius-md, 8px);
  box-shadow: var(--fx-shadow-lg, 0 10px 30px rgba(0,0,0,.14));
  padding: var(--fx-space-sm, 8px) var(--fx-space-md, 12px);
  font-family: inherit;
  animation: fx-toast-in .25s ease;
}
@keyframes fx-toast-in { from { opacity: 0; transform: translateY(-6px); } }
.card.leaving { opacity: 0; transition: opacity .2s ease; }
.icon {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--kind);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  flex: none; margin-top: 2px;
  user-select: none;
}
.body { flex: 1; min-width: 0; }
.title { font-weight: 600; font-size: 14px; }
.msg { font-size: calc(var(--fx-font-size, 14px) - 2px); color: var(--fx-text-muted, #64748b); margin-top: 2px; word-break: break-word; white-space: pre-line; }
.close {
  all: unset; cursor: pointer; flex: none; line-height: 1;
  color: var(--fx-text-muted, #64748b); font-size: 15px; padding: 2px 4px; border-radius: 4px;
}
.close:hover { color: var(--fx-color-danger, #f43f5e); background: var(--fx-surface-surface-hover, rgba(0,0,0,.05)); }
`;
class FxToast extends HTMLElement {
  constructor() {
    super();
    __privateAdd(this, _FxToast_instances);
    this.timer = null;
    this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return ["kind", "title", "message", "duration"];
  }
  connectedCallback() {
    if (!this.shadowRoot.firstChild) __privateMethod(this, _FxToast_instances, render_fn).call(this);
    const dur = Number(this.getAttribute("duration") ?? "4000");
    const safe = dur === 0 ? 0 : Math.max(Number.isNaN(dur) ? 4e3 : dur, 1e3);
    if (!Number.isNaN(safe) && safe > 0 && !this.timer) {
      this.timer = setTimeout(() => this.dismiss(), safe);
    }
  }
  disconnectedCallback() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
  dismiss() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    const card = this.shadowRoot.querySelector(".card");
    if (card) {
      card.classList.add("leaving");
      setTimeout(() => this.remove(), 200);
    } else {
      this.remove();
    }
  }
}
_FxToast_instances = new WeakSet();
render_fn = function() {
  const kind = this.getAttribute("kind") || "info";
  const title = this.getAttribute("title") ?? "";
  const msg = this.getAttribute("message") ?? "";
  const color = KIND_COLOR[kind] ?? KIND_COLOR.info;
  this.shadowRoot.innerHTML = `
      <style>${CARD_CSS}</style>
      <div class="card" style="--kind:${color}" role="status" part="card">
        <span class="icon">${KIND_ICON[kind] ?? KIND_ICON.info}</span>
        <div class="body">
          ${title ? '<div class="title"></div>' : ""}
          ${msg ? '<div class="msg"></div>' : ""}
        </div>
        <button class="close" aria-label="Fechar">✕</button>
      </div>`;
  const t = this.shadowRoot.querySelector(".title");
  const m = this.shadowRoot.querySelector(".msg");
  if (t) t.textContent = title;
  if (m) m.textContent = msg;
  this.shadowRoot.querySelector(".close").addEventListener("click", () => this.dismiss());
};
function regionFor(position) {
  let region = document.querySelector(`[data-fx-toast-region="${position}"]`);
  if (!region) {
    region = document.createElement("div");
    region.setAttribute("data-fx-toast-region", position);
    const [vertical, horizontal] = position.split("-");
    const style = region.style;
    style.position = "fixed";
    style[vertical] = "16px";
    if (horizontal === "center") {
      style.left = "50%";
      style.transform = "translateX(-50%)";
    } else {
      style[horizontal] = "16px";
    }
    style.display = "flex";
    style.flexDirection = "column";
    style.gap = "8px";
    style.zIndex = "1100";
    style.pointerEvents = "none";
    new MutationObserver(() => {
      region.querySelectorAll("*").forEach((c) => c.style.pointerEvents = "auto");
    }).observe(region, { childList: true });
    document.body.appendChild(region);
  }
  return region;
}
class ToastApi {
  constructor() {
    this.seq = 0;
    this.map = /* @__PURE__ */ new Map();
    this.success = (t, m, o) => this.push("success", t, m, o);
    this.error = (t, m, o) => this.push("error", t, m, o);
    this.info = (t, m, o) => this.push("info", t, m, o);
    this.warning = (t, m, o) => this.push("warning", t, m, o);
  }
  push(kind, title, messageOrOpts, opts) {
    const id = ++this.seq;
    const message = typeof messageOrOpts === "string" ? messageOrOpts : messageOrOpts?.message;
    const o = { ...typeof messageOrOpts === "object" && messageOrOpts ? messageOrOpts : void 0, ...opts };
    const el = document.createElement("fx-toast");
    el.setAttribute("kind", kind);
    el.setAttribute("title", title);
    if (message) el.setAttribute("message", message);
    el.setAttribute("position", o.position ?? "top-right");
    el.setAttribute("duration", String(o.duration ?? 4e3));
    regionFor(o.position ?? "top-right").appendChild(el);
    this.map.set(id, el);
    return id;
  }
  close(id) {
    this.map.get(id)?.dismiss();
    this.map.delete(id);
  }
}
const FenixToast = new ToastApi();
globalThis.FenixToast = FenixToast;
function defineFxToast() {
  if (!customElements.get("fx-toast")) customElements.define("fx-toast", FxToast);
}
export {
  FenixToast,
  FxToast,
  defineFxToast
};
//# sourceMappingURL=toast.js.map
