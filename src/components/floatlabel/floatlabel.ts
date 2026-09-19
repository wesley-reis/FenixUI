import { FxElement } from "../../core/base";
import { css } from "../../core/css";
import { defineElement } from "../../core/define";

/**
 * Rótulo flutuante .
 *
 * Envolve um campo de formulário (fx-input, fx-select, fx-multiselect,
 * fx-datepicker, ...) + um <label>. A label se comporta como placeholder
 * quando o campo está vazio e "sobe" quando o campo é focado, contém valor
 * ou abre dropdown.
 *
 *  - variant="on"   (padrão): label sobre a borda superior
 *  - variant="in"   : label como placeholder interno, sobe ao focar/valor
 *  - variant="over" : label estática acima do campo
 *
 *  - error / invalid: label + borda em vermelho, mensagem menor abaixo.
 *  - success / valid: label + borda em verde.
 *
 * A label do light DOM é MOVIDA para dentro do Shadow DOM (como `.flabel`),
 * usando classes de shadow (não `::slotted`), o que é confiável mesmo com
 * componentes aninhados que possuem shadow root próprio.
 */
export class FxFloatlabel extends FxElement {
	static override get observedAttributes(): string[] {
		return ["variant", "error", "invalid", "success", "valid", "full", "icon", "icon-pos"];
	}
	// 'active' NÃO entra em observedAttributes: togglá-lo apenas atualiza CSS
	// via :host([active]), sem re-render destrutivo (mantém o foco do campo).

	static override styles = css`
		:host {
			display: inline-block;
			position: relative;
			font-family: var(--fx-font-family);
			font-size: var(--fx-font-size);
			vertical-align: middle;
		}
		/* Full width: o host estica até o pai; o controle interno com
		   atributo full (ou largura herdada) acompanha. */
		:host([full]) {
			display: block;
			width: 100%;
		}
		.wrapper {
			position: relative;
			display: inline-block;
			width: 100%;
		}
		/* Caixa do campo: referência de posicionamento da label flutuante
       (isolada da mensagem de erro, que cresce o wrapper). */
		.field-box {
			position: relative;
			display: inline-block;
			width: 100%;
		}
		:host([variant="in"]) .field-box {
			padding-top: var(--fx-space-xs, 6px);
		}

		/* ---- label base (variant="on", padrão): sobre a borda superior ---- */
		.flabel {
			position: absolute;
			left: var(--fx-space-md, 12px);
			top: 0;
			transform: translateY(-50%);
			font-size: calc(var(--fx-font-size, 14px) - 3px);
			font-weight: 600;
			color: var(--fx-text-muted, #94a3b8);
			background-color: var(--fx-surface-background, #fff);
			padding: 0 4px;
			line-height: 1;
			border-radius: 2px;
			pointer-events: none;
			z-index: 2;
			white-space: nowrap;
			transition:
				top var(--fx-motion-duration-normal, 180ms)
					var(--fx-motion-easing, ease-in-out),
				transform var(--fx-motion-duration-normal, 180ms)
					var(--fx-motion-easing, ease-in-out),
				font-size var(--fx-motion-duration-normal, 180ms)
					var(--fx-motion-easing, ease-in-out),
				color var(--fx-motion-duration-normal, 180ms)
					var(--fx-motion-easing, ease-in-out);
		}
		:host([active]) .flabel {
			color: var(--fx-color-primary, #4f46e5);
		}

		/* ---- variant="in": label como placeholder dentro, sobe ao focar/valor ---- */
		:host([variant="in"]) .flabel {
			top: 50%;
			transform: translateY(-50%);
			font-size: var(--fx-font-size, 14px);
			font-weight: var(--fx-font-weight, 400);
			background: transparent;
			padding: 0;
		}
		:host([variant="in"][active]) .flabel {
			top: 0;
			transform: translateY(-50%);
			font-size: calc(var(--fx-font-size, 14px) - 3px);
			font-weight: 600;
			background-color: var(--fx-surface-background, #fff);
			padding: 0 5px;
			color: var(--fx-color-primary, #4f46e5);
		}

		/* ---- variant="in" com ícone dentro do campo (fx-input icon):
		   enquanto a label funciona como placeholder (sem foco/valor), ela
		   começa DEPOIS do glifo (mesma métrica de padding do fx-input).
		   Ao subir (active), volta ao offset padrão da borda. ---- */
		:host([variant="in"]) .flabel.icon-indent {
			left: calc(
				var(--fx-space-md, 12px) +
				var(--fx-input-icon-size, calc(var(--fx-font-size, 14px) + 6px)) +
				var(--fx-space-sm, 8px)
			);
		}
		:host([variant="in"][active]) .flabel.icon-indent {
			left: var(--fx-space-md, 12px);
		}

		/* ---- variant="over": label estática ACIMA do campo (fora, em fluxo) ---- */
		:host([variant="over"]) {
			display: block;
		}
		:host([variant="over"]) .flabel {
			position: static;
			display: block;
			margin-bottom: var(--fx-space-xs, 4px);
			background: transparent;
			padding: 0;
			font-size: calc(var(--fx-font-size, 14px) - 3px);
			font-weight: 600;
			white-space: normal;
		}

		/* ---- estados de erro / sucesso ---- */
		:host([error]) .flabel,
		:host([invalid]) .flabel {
			color: var(--fx-color-danger, #dc2626);
		}
		:host([success]) .flabel,
		:host([valid]) .flabel {
			color: var(--fx-color-success, #10b981);
		}

		/* ---- mensagem de erro sob o campo (fonte menor) ---- */
		.error-message {
			display: none;
			margin-top: var(--fx-space-xs, 4px);
			margin-left: var(--fx-space-md, 12px);
			font-size: calc(var(--fx-font-size, 14px) - 3px);
			font-weight: 500;
			color: var(--fx-color-danger, #dc2626);
			line-height: 1.2;
		}
		:host([error]) .error-message,
		:host([invalid]) .error-message {
			display: block;
		}
	`;
	private targetControl: HTMLElement | null = null;
	private observer: MutationObserver | null = null;
	private listenersReady = false;

	protected render(): void {
		const control = this.findControl();
		const label = this.findLabel();
		const originalLabel = label as HTMLElement | null;
		const labelText = originalLabel
			? originalLabel.textContent?.replace(/\s+/g, " ").trim()
			: "";
		const labelFor = originalLabel
			? originalLabel.getAttribute("for") || ""
			: "";
		const isOver = this.getAttribute("variant") === "over";

		this.setTemplate(`
      <div class="wrapper" part="wrapper">
        ${isOver ? `<label class="flabel" part="label" for="${labelFor}">${labelText}</label>` : ""}
        <div class="field-box" part="field">
          <slot></slot>
          ${isOver ? "" : `<label class="flabel" part="label" for="${labelFor}">${labelText}</label>`}
        </div>
        <div class="error-message" part="error"></div>
      </div>
    `);

		// Esconde a label original do light DOM (a renderizada no shadow assume o papel).
		if (originalLabel) originalLabel.setAttribute("hidden", "");

		this.attachEvents();
		this.syncControlReference(control);
		this.syncState();
		this.applyError();
		this.applyFull();
		this.applyIcon();
		this.syncIconIndent();
	}

	protected override disconnectedCallback(): void {
		super.disconnectedCallback();
		this.observer?.disconnect();
	}

	/** Campo de controle = qualquer filho direto que não seja label. */
	private findControl(): HTMLElement | null {
		return (
			(Array.from(this.children).find(
				(n) => n.tagName.toLowerCase() !== "label",
			) as HTMLElement) ?? null
		);
	}

	/** Label = filho direto <label>. */
	private findLabel(): HTMLElement | null {
		return (
			(Array.from(this.children).find(
				(n) => n.tagName.toLowerCase() === "label",
			) as HTMLElement) ?? null
		);
	}

	private attachEvents(): void {
		const slot = this.root.querySelector("slot");
		if (slot) {
			slot.addEventListener("slotchange", () => {
				// Se o usuário trocar o controle/label em tempo de execução, re-sincroniza.
				const control = this.findControl();
				this.syncControlReference(control);
				this.syncState();
				this.applyError();
				this.applyFull();
			});
		}

		if (this.listenersReady) return;
		this.listenersReady = true;

		this.addEventListener("focusin", () => this.syncState());
		this.addEventListener("focusout", () =>
			setTimeout(() => this.syncState(), 60),
		);
		this.addEventListener("input", () => this.syncState());
		this.addEventListener("change", () => this.syncState());
	}

	/** Observa mudanças de atributos do controle (value, open, values...). */
	private syncControlReference(
		control: HTMLElement | null = this.targetControl,
	): void {
		if (control !== this.targetControl) {
			this.observer?.disconnect();
			this.observer = null;
			this.targetControl = control;
			if (control) {
				this.observer = new MutationObserver(() => {
					this.syncState();
					this.syncIconIndent();
				});
				this.observer.observe(control, {
					attributes: true,
					attributeFilter: ["value", "values", "start", "end", "open", "icon", "icon-pos"],
				});
			}
		}
	}

	private syncState(): void {
		if (this.targetControl && !this.targetControl.isConnected) {
			this.targetControl = null;
			this.observer?.disconnect();
			this.observer = null;
		}

		if (!this.targetControl) {
			this.removeAttribute("active");
			this.removeAttribute("focus");
			return;
		}

		const c = this.targetControl as any;
		const attrValue = c.getAttribute
			? (c.getAttribute("value") ?? "").trim()
			: "";
		const attrValues = c.getAttribute
			? (c.getAttribute("values") ?? "").trim()
			: "";
		const hasValue = Boolean(
			(typeof c.value === "string" && c.value.trim() !== "") ||
			(Array.isArray(c.values) && c.values.length > 0) ||
			attrValue !== "" ||
			attrValues !== "" ||
			(c.hasAttribute &&
				(c.hasAttribute("open") || c.hasAttribute("start"))),
		);

		const focused = this.isFocusedInside();
		if (hasValue || focused) {
			this.setAttribute("active", "");
			if (focused) this.setAttribute("focus", "");
			else this.removeAttribute("focus");
		} else {
			this.removeAttribute("active");
			this.removeAttribute("focus");
		}
	}

	/**
	 * variant="in" + ícone à esquerda dentro do campo (fx-input icon):
	 * enquanto a label é placeholder ela precisa começar depois do glifo.
	 * Detecta via atributos icon/icon-pos (ou slot icon) do controle.
	 */
	private syncIconIndent(): void {
		const label = this.root.querySelector(".flabel");
		if (!label) return;
		const c = this.targetControl;
		const hasLeftIcon = Boolean(
			c &&
			(c.hasAttribute("icon") || c.querySelector(':scope > [slot="icon"]')) &&
			c.getAttribute("icon-pos") !== "right",
		);
		label.classList.toggle("icon-indent", hasLeftIcon);
	}

	private applyFull(): void {
		// Espelha o full no controle interno: o CSS :host([full]) do floatlabel
		// estica apenas o HOST — sem isso o campo interno (ex.: fx-input com
		// width 260px fixa) não acompanharia o container.
		if (
			this.targetControl &&
			typeof this.targetControl.setAttribute === "function"
		) {
			if (this.hasAttr("full")) {
				this.targetControl.setAttribute("full", "");
			} else {
				this.targetControl.removeAttribute("full");
			}
			}
	}

	private applyIcon(): void {
		if (
			this.targetControl &&
			typeof this.targetControl.setAttribute === "function"
		) {
			// Só propaga icon/icon-pos se o FLOATLABEL possuir o atributo.
			// Se o ícone foi pondo diretamente no controle (ex.: <fx-input icon="lock">),
			// não remove — deixa o controle manter o seu próprio ícone.
			if (this.hasAttr("icon")) {
				const icon = this.getAttr("icon");
				const iconPos = this.getAttr("icon-pos");
				if (icon !== "") this.targetControl.setAttribute("icon", icon);
				else this.targetControl.setAttribute("icon", "");
				if (iconPos && iconPos !== "left") this.targetControl.setAttribute("icon-pos", iconPos);
				else this.targetControl.removeAttribute("icon-pos");
			}
		}
	}

	private applyError(): void {
		const hasError = this.hasAttr("error") || this.hasAttr("invalid");
		const errMsg = this.root.querySelector(
			".error-message",
		) as HTMLElement | null;
		if (errMsg) {
			errMsg.textContent = hasError
				? this.getAttribute("error-text")?.trim() || "Valor inválido"
				: "";
		}

		// Espelha o estado no controle interno para que a borda também fique vermelha/verde.
		if (
			this.targetControl &&
			typeof this.targetControl.setAttribute === "function"
		) {
			const t = this.targetControl;
			if (hasError) {
				t.setAttribute("error", "");
				t.removeAttribute("success");
			} else if (this.hasAttr("success") || this.hasAttr("valid")) {
				t.setAttribute("success", "");
				t.removeAttribute("error");
			} else {
				t.removeAttribute("error");
				t.removeAttribute("success");
			}
		}
	}

	private isWithin(activeEl: Element): boolean {
		let current: Element | null = activeEl;
		while (current && current !== this) {
			current = current.parentElement;
		}
		return current === this;
	}

	private isFocusedInside(): boolean {
		const activeEl = (document as Document).activeElement;
		return Boolean(activeEl && this.isWithin(activeEl));
	}
}

export function defineFxFloatlabel(): typeof FxFloatlabel {
	return defineElement("fx-floatlabel", FxFloatlabel);
}
