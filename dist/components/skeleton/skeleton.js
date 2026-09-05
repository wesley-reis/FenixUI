import { FxElement } from "../../core/base.js";
import { css } from "../../core/css.js";
import { defineElement } from "../../core/define.js";
const _FxSkeleton = class _FxSkeleton extends FxElement {
  static get observedAttributes() {
    return ["variant", "width", "height", "lines"];
  }
  /** Valida um valor de dimensão CSS, retornando-o seguro ou vazio. */
  safeSize(value) {
    const v = value.trim();
    return /^-?\d*\.?\d+(px|em|rem|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/.test(v) ? v : "";
  }
  render() {
    const variant = this.getAttr("variant", "text");
    const width = this.safeSize(this.getAttr("width"));
    const height = this.safeSize(this.getAttr("height"));
    const style = `${width ? `width:${width};` : ""}${height ? `height:${height};` : ""}`;
    if (variant === "circle") {
      const size = height || width || "40px";
      const diameter = !style.includes("height") ? `width:${size};height:${size};` : style;
      this.setTemplate(`<div class="bone circle" part="bone" style="${diameter}"></div>`);
      return;
    }
    if (variant === "rect") {
      const s = style || "width:100%;height:80px;";
      this.setTemplate(`<div class="bone" part="bone" style="${s}"></div>`);
      return;
    }
    const lines = Number(this.getAttr("lines", "3")) || 3;
    this.setTemplate(`
      ${Array.from({ length: lines }, () => '<div class="bone text"></div>').join("")}
    `);
  }
};
_FxSkeleton.styles = css`
    :host { display: block; width: 100%; min-width: 80px; font-family: var(--fx-font-family); }
    .bone {
      background: linear-gradient(
        90deg,
        var(--fx-surface-surface-hover) 25%,
        color-mix(in srgb, var(--fx-surface-surface-hover) 55%, var(--fx-surface-background)) 50%,
        var(--fx-surface-surface-hover) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.4s ease-in-out infinite;
      border-radius: var(--fx-radius-sm);
    }
    @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
    .bone[hidden] { display: none; }
    .text { height: 12px; width: 100%; margin-bottom: var(--fx-space-sm); }
    .text:last-of-type { width: 60%; margin-bottom: 0; }
    .circle { border-radius: var(--fx-radius-full); }
  `;
let FxSkeleton = _FxSkeleton;
function defineFxSkeleton() {
  return defineElement("fx-skeleton", FxSkeleton);
}
export {
  FxSkeleton,
  defineFxSkeleton
};
//# sourceMappingURL=skeleton.js.map
