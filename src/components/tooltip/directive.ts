/**
 * Diretiva fx-tooltip — Aplica tooltip em qualquer elemento HTML.
 *
 * Uso:
 *   <div fx-tooltip="Texto simples">Div com tooltip</div>
 *   <button fx-tooltip="Clique" fx-tooltip-position="bottom">Botão</button>
 *   <span fx-tooltip="<strong>HTML</strong>" fx-tooltip-html>Texto</span>
 *
 * Atributos:
 *   fx-tooltip           — Conteúdo do tooltip (texto ou HTML)
 *   fx-tooltip-position  — Posição: top | bottom | left | right (padrão: top)
 *   fx-tooltip-html      — Se presente, trata o conteúdo como HTML
 */

export interface FxTooltipConfig {
  position: 'top' | 'bottom' | 'left' | 'right';
  html: boolean;
}

const DEFAULT_CONFIG: FxTooltipConfig = {
  position: 'top',
  html: false,
};

/**
 * Classe que gerencia o comportamento de tooltip em um elemento.
 */
class TooltipBehavior {
  private element: HTMLElement;
  private tooltipElement: HTMLSpanElement | null = null;
  private config: FxTooltipConfig;
  private showTimeout: number | null = null;
  private hideTimeout: number | null = null;

  constructor(element: HTMLElement) {
    this.element = element;
    this.config = this.parseConfig();
    this.init();
  }

  private parseConfig(): FxTooltipConfig {
    const position = this.element.getAttribute('fx-tooltip-position') as FxTooltipConfig['position'];
    return {
      position: position && ['top', 'bottom', 'left', 'right'].includes(position) ? position : DEFAULT_CONFIG.position,
      html: this.element.hasAttribute('fx-tooltip-html'),
    };
  }

  private init(): void {
    const computedStyle = window.getComputedStyle(this.element);
    if (computedStyle.position === 'static') {
      this.element.style.position = 'relative';
    }
    this.createTooltipElement();
    this.element.addEventListener('mouseenter', this.show);
    this.element.addEventListener('mouseleave', this.hide);
    this.element.addEventListener('focus', this.show);
    this.element.addEventListener('blur', this.hide);
  }

  private createTooltipElement(): void {
    const content = this.element.getAttribute('fx-tooltip');
    if (!content) return;
    this.tooltipElement = document.createElement('span');
    this.tooltipElement.setAttribute('role', 'tooltip');
    this.tooltipElement.setAttribute('data-fx-tooltip', '');
    this.tooltipElement.className = `fx-tooltip-bubble fx-tooltip-${this.config.position}`;
    if (this.config.html) {
      this.tooltipElement.innerHTML = content;
    } else {
      this.tooltipElement.textContent = content;
    }
    this.element.appendChild(this.tooltipElement);
  }

  private show = (): void => {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.showTimeout = window.setTimeout(() => {
      if (this.tooltipElement) {
        this.tooltipElement.classList.add('fx-tooltip-visible');
      }
    }, 100);
  };

  private hide = (): void => {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    this.hideTimeout = window.setTimeout(() => {
      if (this.tooltipElement) {
        this.tooltipElement.classList.remove('fx-tooltip-visible');
      }
    }, 50);
  };

  public update(): void {
    this.config = this.parseConfig();
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
    this.createTooltipElement();
  }

  public destroy(): void {
    this.element.removeEventListener('mouseenter', this.show);
    this.element.removeEventListener('mouseleave', this.hide);
    this.element.removeEventListener('focus', this.show);
    this.element.removeEventListener('blur', this.hide);
    if (this.showTimeout) clearTimeout(this.showTimeout);
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
  }
}

/**
 * Gerencia todas as instâncias de tooltip no documento.
 */
class FxTooltipManager {
  private static instance: FxTooltipManager | null = null;
  private observer: MutationObserver | null = null;
  private behaviors: Map<HTMLElement, TooltipBehavior> = new Map();
  private injectedStyles: HTMLStyleElement | null = null;

  private constructor() {
    this.injectStyles();
    this.observe();
    this.processExistingElements();
  }

  public static getInstance(): FxTooltipManager {
    if (!FxTooltipManager.instance) {
      FxTooltipManager.instance = new FxTooltipManager();
    }
    return FxTooltipManager.instance;
  }

  private injectStyles(): void {
    if (document.getElementById('fx-tooltip-directive-styles')) return;
    this.injectedStyles = document.createElement('style');
    this.injectedStyles.id = 'fx-tooltip-directive-styles';
    this.injectedStyles.textContent = getTooltipStyles();
    document.head.appendChild(this.injectedStyles);
  }

  private observe(): void {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              this.processElement(node);
              node.querySelectorAll<HTMLElement>('[fx-tooltip]').forEach((el) => this.processElement(el));
            }
          });
        }
        if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
          const target = mutation.target;
          if (target.hasAttribute('fx-tooltip')) {
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
      attributeFilter: ['fx-tooltip', 'fx-tooltip-position', 'fx-tooltip-html'],
    });
  }

  private processExistingElements(): void {
    document.querySelectorAll<HTMLElement>('[fx-tooltip]').forEach((el) => this.processElement(el));
  }

  private processElement(element: HTMLElement): void {
    if (!element.hasAttribute('fx-tooltip')) {
      this.removeBehavior(element);
      return;
    }
    if (this.behaviors.has(element)) {
      this.behaviors.get(element)!.update();
    } else {
      this.behaviors.set(element, new TooltipBehavior(element));
    }
  }

  private removeBehavior(element: HTMLElement): void {
    const behavior = this.behaviors.get(element);
    if (behavior) {
      behavior.destroy();
      this.behaviors.delete(element);
    }
  }

  public destroy(): void {
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
    FxTooltipManager.instance = null;
  }
}

/**
 * Retorna os estilos CSS para os tooltips.
 */
function getTooltipStyles(): string {
  return /* css */ `
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
  `;
}

/**
 * Inicializa a diretiva fx-tooltip.
 * Deve ser chamado uma vez na aplicação.
 *
 * @example
 * import { defineFxTooltipDirective } from '@wrrdev/fenix-ui/tooltip';
 * defineFxTooltipDirective();
 */
export function defineFxTooltipDirective(): void {
  if (typeof window === 'undefined') return;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      FxTooltipManager.getInstance();
    });
  } else {
    FxTooltipManager.getInstance();
  }
}

/**
 * Destrói a diretiva fx-tooltip e limpa todos os recursos.
 */
export function destroyFxTooltipDirective(): void {
  FxTooltipManager.getInstance().destroy();
}

