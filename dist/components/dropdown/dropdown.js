import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
const _FxDropdown = class _FxDropdown extends FxElement {
  static get observedAttributes() {
    return ["label", "position", "open"];
  }
  get open() {
    return this.hasAttr("open");
  }
  set open(value) {
    this.toggleAttr("open", value);
  }
  render() {
    const label = this.getAttr("label", "Ações");
    const items = Array.from(this.querySelectorAll("fx-dropdown-item"));
    this.setTemplate(`
      <span class="trigger" role="button" tabindex="0" part="trigger"
        aria-haspopup="menu" aria-expanded="${this.open}">
        ${label} ▾
      </span>
      <div class="panel" role="menu" part="panel">
        ${items.length ? items.map((i) => `<div class="item-slot"><slot name="_${i.getAttribute("value") ?? ""}"></slot></div>`) : '<div class="empty">Nenhuma ação</div>'}
        <slot></slot>
      </div>
    `);
    const trigger = this.root.querySelector(".trigger");
    trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll("fx-dropdown[open]").forEach((d) => {
        if (d !== this) d.open = false;
      });
      this.open = !this.open;
    });
    trigger?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.open = !this.open;
      }
    });
    items.forEach((item) => {
      item.addEventListener("click", () => {
        this.open = false;
        this.dispatchEvent(new CustomEvent("select", {
          bubbles: true,
          composed: true,
          detail: { value: item.getAttribute("value") ?? "" }
        }));
      });
    });
  }
};
_FxDropdown.styles = css`
    :host {
      position: relative;
      display: inline-block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .trigger { min-height: var(--fx-size-md); }
    .panel {
      position: absolute;
      top: calc(100% + 4px);
      min-width: 180px;
      background: var(--fx-surface-background);
      border: 1px solid var(--fx-border-default);
      border-radius: var(--fx-radius-md);
      box-shadow: var(--fx-shadow-lg);
      padding: var(--fx-space-xs);
      z-index: var(--fx-z-dropdown, 1000);
      display: none;
    }
    :host([open]) .panel { display: block; }
    /* left = alinhado à esquerda do trigger; right = à direita; center = centrado */
    :host([position='left']) .panel,
    :host([position='bottom-left']) .panel { left: 0; right: auto; }
    :host([position='center']) .panel {
      left: 50%;
      transform: translateX(-50%);
    }
    :host([position='right']) .panel,
    :host([position='bottom-right']) .panel { right: 0; left: auto; }
    :host(:not([position])) .panel { left: 0; right: auto; }
    ::slotted(fx-dropdown-item) { display: block; }
    .empty { color: var(--fx-text-muted); font-size: calc(var(--fx-font-size) - 2px); padding: var(--fx-space-sm); }
  `;
let FxDropdown = _FxDropdown;
const _FxDropdownItem = class _FxDropdownItem extends FxElement {
  static get observedAttributes() {
    return ["value"];
  }
  get value() {
    return this.getAttr("value");
  }
  set value(v) {
    this.setAttribute("value", v);
  }
  render() {
    this.setTemplate('<button type="button" class="item" part="item" role="menuitem"><slot></slot></button>');
  }
};
_FxDropdownItem.styles = css`
    :host {
      display: block;
      font-family: var(--fx-font-family);
      font-size: var(--fx-font-size);
    }
    .item {
      display: block;
      width: 100%;
      text-align: left;
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: inherit;
      color: var(--fx-text-default);
      padding: var(--fx-space-sm) var(--fx-space-md);
      cursor: pointer;
      border-radius: var(--fx-radius-sm);
      transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
    }
    .item:hover { background: color-mix(in srgb, var(--fx-color-primary) 12%, var(--fx-surface-background)); color: var(--fx-color-primary); }
  `;
let FxDropdownItem = _FxDropdownItem;
function defineFxDropdown() {
  return defineElement("fx-dropdown", FxDropdown);
}
function defineFxDropdownItem() {
  return defineElement("fx-dropdown-item", FxDropdownItem);
}
export {
  FxDropdown,
  FxDropdownItem,
  defineFxDropdown,
  defineFxDropdownItem
};
//# sourceMappingURL=dropdown.js.map
