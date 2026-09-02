const DEFAULT_CONFIG = {
  position: "top"
};
class TooltipBehavior {
  constructor(element) {
    this.tooltipElement = null;
    this.showTimeout = null;
    this.hideTimeout = null;
    this.show = () => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      this.showTimeout = window.setTimeout(() => {
        if (this.tooltipElement) {
          this.tooltipElement.classList.add("fx-tooltip-visible");
        }
      }, 100);
    };
    this.hide = () => {
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = null;
      }
      this.hideTimeout = window.setTimeout(() => {
        if (this.tooltipElement) {
          this.tooltipElement.classList.remove("fx-tooltip-visible");
        }
      }, 50);
    };
    this.element = element;
    this.config = this.parseConfig();
    this.init();
  }
  parseConfig() {
    const position = this.element.getAttribute("fx-tooltip-position");
    return {
      position: position && ["top", "bottom", "left", "right"].includes(position) ? position : DEFAULT_CONFIG.position,
      html: this.element.hasAttribute("fx-tooltip-html")
    };
  }
  init() {
    const computedStyle = window.getComputedStyle(this.element);
    if (computedStyle.position === "static") {
      this.element.style.position = "relative";
    }
    this.createTooltipElement();
    this.element.addEventListener("mouseenter", this.show);
    this.element.addEventListener("mouseleave", this.hide);
    this.element.addEventListener("focus", this.show);
    this.element.addEventListener("blur", this.hide);
  }
  createTooltipElement() {
    const content = this.element.getAttribute("fx-tooltip");
    if (!content) return;
    this.tooltipElement = document.createElement("span");
    this.tooltipElement.setAttribute("role", "tooltip");
    this.tooltipElement.setAttribute("data-fx-tooltip", "");
    this.tooltipElement.className = `fx-tooltip-bubble fx-tooltip-${this.config.position}`;
    if (this.config.html) {
      this.tooltipElement.innerHTML = content;
    } else {
      this.tooltipElement.textContent = content;
    }
    this.element.appendChild(this.tooltipElement);
  }
  update() {
    this.config = this.parseConfig();
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
    this.createTooltipElement();
  }
  destroy() {
    this.element.removeEventListener("mouseenter", this.show);
    this.element.removeEventListener("mouseleave", this.hide);
    this.element.removeEventListener("focus", this.show);
    this.element.removeEventListener("blur", this.hide);
    if (this.showTimeout) clearTimeout(this.showTimeout);
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
  }
}
const _FxTooltipManager = class _FxTooltipManager {
  constructor() {
    this.observer = null;
    this.behaviors = /* @__PURE__ */ new Map();
    this.injectedStyles = null;
    this.injectStyles();
    this.observe();
    this.processExistingElements();
  }
  static getInstance() {
    if (!_FxTooltipManager.instance) {
      _FxTooltipManager.instance = new _FxTooltipManager();
    }
    return _FxTooltipManager.instance;
  }
  injectStyles() {
    if (document.getElementById("fx-tooltip-directive-styles")) return;
    this.injectedStyles = document.createElement("style");
    this.injectedStyles.id = "fx-tooltip-directive-styles";
    this.injectedStyles.textContent = getTooltipStyles();
    document.head.appendChild(this.injectedStyles);
  }
  observe() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              this.processElement(node);
              node.querySelectorAll("[fx-tooltip]").forEach((el) => this.processElement(el));
            }
          });
        }
        if (mutation.type === "attributes" && mutation.target instanceof HTMLElement) {
          const target = mutation.target;
          if (target.hasAttribute("fx-tooltip")) {
            this.processElement(target);
          } else if (this.behaviors.has(target)) {
            this.removeBehavior(target);
          }
        }
      }
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["fx-tooltip", "fx-tooltip-position", "fx-tooltip-html"]
    });
  }
  processExistingElements() {
    document.querySelectorAll("[fx-tooltip]").forEach((el) => this.processElement(el));
  }
  processElement(element) {
    if (!element.hasAttribute("fx-tooltip")) {
      this.removeBehavior(element);
      return;
    }
    if (this.behaviors.has(element)) {
      this.behaviors.get(element).update();
    } else {
      this.behaviors.set(element, new TooltipBehavior(element));
    }
  }
  removeBehavior(element) {
    const behavior = this.behaviors.get(element);
    if (behavior) {
      behavior.destroy();
      this.behaviors.delete(element);
    }
  }
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.behaviors.forEach((behavior) => behavior.destroy());
    this.behaviors.clear();
    if (this.injectedStyles) {
      this.injectedStyles.remove();
      this.injectedStyles = null;
    }
    _FxTooltipManager.instance = null;
  }
};
_FxTooltipManager.instance = null;
let FxTooltipManager = _FxTooltipManager;
function getTooltipStyles() {
  return (
    /* css */
    `
    [fx-tooltip] {
      position: relative;
    }

    .fx-tooltip-bubble {
      position: absolute;
      background: var(--fx-text-default, #1e293b);
      color: var(--fx-surface-background, #fff);
      font-family: var(--fx-font-family, system-ui, -apple-system, sans-serif);
      font-size: calc(var(--fx-font-size, 14px) - 2px);
      line-height: 1.45;
      padding: var(--fx-space-xs, 4px) var(--fx-space-md, 12px);
      border-radius: var(--fx-radius-sm, 4px);
      box-shadow: var(--fx-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
      width: max-content;
      min-width: 60px;
      max-width: var(--fx-tooltip-max-width, 320px);
      white-space: normal;
      text-align: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--fx-motion-duration-fast, 150ms) var(--fx-motion-easing, ease);
      z-index: var(--fx-z-tooltip, 1050);
      pointer-events: none;
    }

    .fx-tooltip-bubble.fx-tooltip-visible {
      opacity: 1;
      visibility: visible;
    }

    .fx-tooltip-top {
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
    }
    .fx-tooltip-top::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-top-color: var(--fx-text-default, #1e293b);
    }

    .fx-tooltip-bottom {
      top: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      bottom: auto;
    }
    .fx-tooltip-bottom::after {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-bottom-color: var(--fx-text-default, #1e293b);
    }

    .fx-tooltip-left {
      right: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
      left: auto;
      bottom: auto;
    }
    .fx-tooltip-left::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 100%;
      transform: translateY(-50%);
      border: 5px solid transparent;
      border-left-color: var(--fx-text-default, #1e293b);
    }

    .fx-tooltip-right {
      left: calc(100% + 6px);
      top: 50%;
      transform: translateY(-50%);
      right: auto;
      bottom: auto;
    }
    .fx-tooltip-right::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 100%;
      transform: translateY(-50%);
      border: 5px solid transparent;
      border-right-color: var(--fx-text-default, #1e293b);
    }
  `
  );
}
function defineFxTooltipDirective() {
  if (typeof window === "undefined") return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      FxTooltipManager.getInstance();
    });
  } else {
    FxTooltipManager.getInstance();
  }
}
function destroyFxTooltipDirective() {
  FxTooltipManager.getInstance().destroy();
}
export {
  defineFxTooltipDirective,
  destroyFxTooltipDirective
};
//# sourceMappingURL=directive.js.map
