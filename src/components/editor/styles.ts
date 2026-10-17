/**
 * Estilos do <fx-editor>.
 *
 * Tudo isolado no Shadow DOM. A parte de conteúdo também é exportada em
 * `FX_EDITOR_CONTENT_CSS` para quem salva o HTML e precisa renderizá-lo fora
 * do componente.
 */

export const FX_EDITOR_CONTENT_CSS = `
.content { line-height: 1.55; color: var(--fx-text-default); }
.content p { margin: 0 0 0.65em; }
.content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
  margin: 0.8em 0 0.4em; line-height: 1.25; font-weight: 600; color: var(--fx-text-default);
}
.content h1 { font-size: 1.8em; }
.content h2 { font-size: 1.5em; }
.content h3 { font-size: 1.25em; }
.content h4 { font-size: 1.1em; }
.content h5, .content h6 { font-size: 1em; }
.content ul, .content ol { margin: 0 0 0.65em; padding-left: 1.6em; }
.content li { margin: 0.15em 0; }
.content blockquote {
  margin: 0.5em 0; padding: 0.25em 0 0.25em 1em;
  border-left: 3px solid var(--fx-color-primary); color: var(--fx-text-muted);
}
.content pre {
  margin: 0.6em 0; padding: var(--fx-space-md); overflow: auto;
  background: var(--fx-surface-surface); border-radius: var(--fx-radius-sm);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.9em;
}
.content code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.92em; background: var(--fx-surface-surface);
  padding: 0.1em 0.3em; border-radius: 3px;
}
.content pre code { background: none; padding: 0; }
.content hr { border: none; border-top: 1px solid var(--fx-border-default); margin: 1em 0; }
.content a { color: var(--fx-color-primary); text-decoration: underline; cursor: pointer; }
.content img { max-width: 100%; height: auto; display: block; }
.content figure { margin: 1em 0; }
.content figure.fx-image img { margin: 0 auto; }
.content figure.fx-image[data-align="left"] { float: left; max-width: 50%; margin: 0 1em 0.5em 0; }
.content figure.fx-image[data-align="right"] { float: right; max-width: 50%; margin: 0 0 0.5em 1em; }
.content figure.fx-image[data-align="center"] { margin-left: auto; margin-right: auto; }
.content figure.fx-video[data-align="left"],
.content figure.fx-embed[data-align="left"] { float: left; max-width: 50%; margin: 0 1em 0.5em 0; }
.content figure.fx-video[data-align="right"],
.content figure.fx-embed[data-align="right"] { float: right; max-width: 50%; margin: 0 0 0.5em 1em; }
.content figure.fx-video[data-align="center"],
.content figure.fx-embed[data-align="center"] { margin-left: auto; margin-right: auto; }
.content figcaption {
  margin-top: 0.4em; color: var(--fx-text-muted);
  font-size: 0.85em; text-align: center;
}
.content video { display: block; width: 100%; background: #000; border-radius: var(--fx-radius-sm); }
.content iframe { display: block; width: 100%; aspect-ratio: 16 / 9; border: 0; }
.content table { width: 100%; border-collapse: collapse; margin: 1em 0; }
.content th, .content td { border: 1px solid var(--fx-border-default); padding: var(--fx-space-xs) var(--fx-space-sm); vertical-align: top; }
.content th { background: var(--fx-surface-surface); text-align: left; font-weight: 600; }
.content table.fx-grid { border: none; margin: 0.6em 0; }
.content table.fx-grid > tbody > tr > td {
  border: 1px dashed var(--fx-border-default); padding: var(--fx-space-sm);
  vertical-align: top;
}
@media (max-width: 640px) {
  .content table.fx-grid[data-stack] > tbody > tr > td {
    display: block; width: 100% !important; border: none; padding: var(--fx-space-xs) 0;
  }
}
`;

export const EDITOR_STYLES = `
:host {
  display: block;
  width: 100%;
  font-family: var(--fx-font-family);
  font-size: var(--fx-font-size);
  color: var(--fx-text-default);
  --fx-editor-min-height: 240px;
  --fx-editor-max-height: none;
  --fx-editor-radius: var(--fx-radius-md);
  --fx-editor-toolbar-bg: var(--fx-surface-surface);
  --fx-editor-content-padding: var(--fx-space-md) var(--fx-space-lg);
}
:host([full]) { width: 100%; }
.editor {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--fx-surface-background);
  border: 1px solid var(--fx-border-default);
  border-radius: var(--fx-editor-radius);
  transition: border-color var(--fx-motion-duration-normal) var(--fx-motion-easing),
    box-shadow var(--fx-motion-duration-normal) var(--fx-motion-easing);
}
.editor:focus-within {
  border-color: var(--fx-color-primary);
  box-shadow: var(--fx-effect-focus-ring, none);
}
:host([error]) .editor, :host([invalid]) .editor {
  border-color: var(--fx-color-danger, #dc2626);
  box-shadow: var(--fx-effect-error-ring, 0 0 0 3px color-mix(in srgb, var(--fx-color-danger, #dc2626) 18%, transparent));
}
:host([success]) .editor, :host([valid]) .editor {
  border-color: var(--fx-color-success, #16a34a);
  box-shadow: var(--fx-effect-success-ring, 0 0 0 3px color-mix(in srgb, var(--fx-color-success, #16a34a) 18%, transparent));
}
:host([disabled]) { opacity: 0.55; pointer-events: none; }
:host([readonly]) .toolbar { display: none; }

.toolbar {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1px;
  padding: var(--fx-space-xs);
  background: var(--fx-editor-toolbar-bg);
  border-bottom: 1px solid var(--fx-border-default);
  user-select: none;
}
.toolbar[hidden] { display: none; }
.tb-group {
  display: flex;
  align-items: center;
  gap: 1px;
  padding: 0 var(--fx-space-xs);
  border-right: 1px solid var(--fx-border-default);
}
.tb-group:last-child { border-right: none; }
.tb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: var(--fx-radius-sm);
  background: transparent;
  color: var(--fx-text-default);
  font-size: 19px;
  cursor: pointer;
  transition: background var(--fx-motion-duration-fast) var(--fx-motion-easing);
}
.tb-btn:hover { background: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.06)); }
.tb-btn:focus-visible { outline: 2px solid var(--fx-color-primary); outline-offset: -2px; }
.tb-btn.active {
  background: color-mix(in srgb, var(--fx-color-primary) 14%, transparent);
  color: var(--fx-color-primary);
}
.tb-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.tb-select {
  height: 30px;
  padding: 0 var(--fx-space-xs);
  border: 1px solid var(--fx-border-default);
  border-radius: var(--fx-radius-sm);
  background: var(--fx-surface-background);
  color: var(--fx-text-default);
  font-family: inherit;
  font-size: calc(var(--fx-font-size) - 2px);
  cursor: pointer;
}
.tb-color {
  width: 30px;
  height: 30px;
  padding: 2px;
  border: none;
  background: transparent;
  cursor: pointer;
}
.tb-color input { width: 26px; height: 26px; padding: 0; border: none; background: none; cursor: pointer; }
.body { position: relative; display: flex; flex-direction: column; flex: 1 1 auto; }
.content {
  position: relative;
  min-height: var(--fx-editor-min-height);
  max-height: var(--fx-editor-max-height);
  overflow: auto;
  padding: var(--fx-editor-content-padding);
  outline: none;
  box-sizing: border-box;
}
.content[hidden] { display: none; }
.content.is-empty::before {
  content: attr(data-placeholder);
  color: var(--fx-text-muted);
  pointer-events: none;
  position: absolute;
}
.content[contenteditable="false"] { background: var(--fx-surface-surface-hover, rgba(0,0,0,.02)); }
.content figure.fx-image { touch-action: none; }

.media-overlay {
  position: absolute;
  z-index: 5;
  pointer-events: none;
  border: 1px solid var(--fx-color-primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--fx-color-primary) 30%, transparent);
}
.media-overlay[hidden] { display: none; }
.media-handle {
  position: absolute;
  width: 11px;
  height: 11px;
  border: 1px solid #fff;
  border-radius: 50%;
  background: var(--fx-color-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  pointer-events: auto;
  touch-action: none;
}
.media-handle.nw { left: -6px; top: -6px; cursor: nwse-resize; }
.media-handle.ne { right: -6px; top: -6px; cursor: nesw-resize; }
.media-handle.sw { left: -6px; bottom: -6px; cursor: nesw-resize; }
.media-handle.se { right: -6px; bottom: -6px; cursor: nwse-resize; }
.media-size {
  position: absolute;
  top: -24px;
  left: 0;
  padding: 2px 6px;
  border-radius: var(--fx-radius-sm);
  background: var(--fx-color-primary);
  color: #fff;
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
}
.media-delete {
  position: absolute;
  top: -32px;
  right: -1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--fx-color-danger, #dc2626);
  color: #fff;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}
.media-delete:hover { filter: brightness(0.92); }
.media-delete:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }

.content figure.fx-image,
.content figure.fx-video,
.content figure.fx-embed { position: relative; }
.fx-media-quick {
  position: absolute;
  top: 6px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid color-mix(in srgb, var(--fx-color-primary) 35%, transparent);
  border-radius: var(--fx-radius-sm);
  background: var(--fx-surface-background);
  color: var(--fx-text-default);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--fx-motion-duration-fast) var(--fx-motion-easing), background var(--fx-motion-duration-fast) var(--fx-motion-easing);
}
.content figure:hover > .fx-media-quick,
.content figure:focus-within > .fx-media-quick { opacity: 1; }
.content figure.fx-video > .fx-media-quick,
.content figure.fx-embed > .fx-media-quick { opacity: 0.92; }
.fx-media-quick:hover { background: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.06)); }
.fx-media-quick.active { background: var(--fx-color-primary); color: #fff; }
.fx-media-quick.quick-left { right: 82px; }
.fx-media-quick.quick-center { right: 56px; }
.fx-media-quick.quick-right { right: 30px; }
.fx-media-quick.quick-delete { right: 4px; background: var(--fx-color-danger, #dc2626); color: #fff; border-color: transparent; }
.fx-media-quick:focus-visible { outline: 2px solid var(--fx-color-primary); outline-offset: 1px; }

.link-overlay {
  position: absolute;
  z-index: 6;
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--fx-surface-background);
  border: 1px solid var(--fx-border-default);
  border-radius: var(--fx-radius-sm);
  box-shadow: var(--fx-shadow-md, 0 4px 12px rgba(0, 0, 0, 0.16));
}
.link-overlay[hidden] { display: none; }
.link-overlay button {
  border: none;
  background: none;
  color: var(--fx-text-default);
  font: inherit;
  font-size: 12px;
  line-height: 1.4;
  padding: 4px 8px;
  border-radius: var(--fx-radius-sm);
  cursor: pointer;
}
.link-overlay button:hover { background: var(--fx-surface-surface-hover, rgba(0, 0, 0, 0.06)); }
.link-overlay button[data-link-action="remove"] { color: var(--fx-color-danger, #dc2626); }
.link-overlay button:focus-visible { outline: 2px solid var(--fx-color-primary); outline-offset: 1px; }

.source {
  display: block;
  width: 100%;
  min-height: var(--fx-editor-min-height);
  max-height: var(--fx-editor-max-height);
  padding: var(--fx-editor-content-padding);
  border: none;
  outline: none;
  resize: vertical;
  background: var(--fx-surface-background);
  color: var(--fx-text-default);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 1.55;
  box-sizing: border-box;
}
.source[hidden] { display: none; }

.statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fx-space-sm);
  min-height: 28px;
  padding: 2px var(--fx-space-md);
  border-top: 1px solid var(--fx-border-default);
  color: var(--fx-text-muted);
  font-size: calc(var(--fx-font-size) - 3px);
}
.statusbar:empty { display: none; }
.statusbar[hidden] { display: none; }
.source-actions { display: inline-flex; gap: var(--fx-space-xs); }
.source-actions[hidden] { display: none; }

.backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--fx-z-modal, 1100);
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--fx-text-default, #000) 45%, transparent);
}
.backdrop[hidden] { display: none; }
.dialog {
  width: min(460px, calc(100vw - 32px));
  max-height: calc(100vh - 48px);
  overflow: auto;
  background: var(--fx-surface-background);
  border: 1px solid var(--fx-border-default);
  border-radius: var(--fx-radius-lg);
  box-shadow: var(--fx-shadow-xl);
  font-family: var(--fx-font-family);
  font-size: var(--fx-font-size);
}
.dialog header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--fx-space-md) var(--fx-space-lg);
  border-bottom: 1px solid var(--fx-border-default);
}
.dialog h3 { margin: 0; font-size: 1rem; font-weight: 600; }
.dialog-close {
  border: none; background: transparent; color: var(--fx-text-muted);
  font-size: 1.4rem; line-height: 1; cursor: pointer;
}
.dialog-body { display: flex; flex-direction: column; gap: var(--fx-space-sm); padding: var(--fx-space-lg); }
.field { display: flex; flex-direction: column; gap: 3px; font-size: calc(var(--fx-font-size) - 2px); color: var(--fx-text-muted); }
.field input, .field select {
  height: var(--fx-size-md);
  padding: 0 var(--fx-space-sm);
  border: 1px solid var(--fx-border-default);
  border-radius: var(--fx-radius-sm);
  background: var(--fx-surface-background);
  color: var(--fx-text-default);
  font: inherit;
  font-size: var(--fx-font-size);
}
.field input:focus, .field select:focus { outline: none; border-color: var(--fx-color-primary); box-shadow: var(--fx-effect-focus-ring, none); }
.dialog footer {
  display: flex; justify-content: flex-end; gap: var(--fx-space-sm);
  padding: var(--fx-space-md) var(--fx-space-lg);
  border-top: 1px solid var(--fx-border-default);
}
.btn {
  min-height: var(--fx-size-sm);
  padding: 0 var(--fx-space-md);
  border: 1px solid var(--fx-border-default);
  border-radius: var(--fx-radius-sm);
  background: var(--fx-surface-background);
  color: var(--fx-text-default);
  font: inherit; font-size: calc(var(--fx-font-size) - 2px);
  cursor: pointer;
}
.btn:hover { background: var(--fx-surface-surface-hover, rgba(0,0,0,.05)); }
.btn.primary { background: var(--fx-color-primary); border-color: transparent; color: #fff; }
.btn.primary:hover { filter: brightness(0.92); }

.panel {
  position: absolute;
  top: calc(100% + 4px);
  left: var(--fx-space-md);
  z-index: 6;
  padding: var(--fx-space-sm);
  background: var(--fx-surface-background);
  border: 1px solid var(--fx-border-default);
  border-radius: var(--fx-radius-md);
  box-shadow: var(--fx-shadow-lg);
}
.panel[hidden] { display: none; }
.grid-picker { display: grid; grid-template-columns: repeat(8, 18px); gap: 3px; }
.grid-picker button {
  width: 18px; height: 18px; padding: 0;
  border: 1px solid var(--fx-border-default);
  border-radius: 2px; background: var(--fx-surface-background); cursor: pointer;
}
.grid-picker button.on { background: var(--fx-color-primary); border-color: var(--fx-color-primary); }
.panel-title { margin: 0 0 6px; font-size: 11px; color: var(--fx-text-muted); }
.panel-actions { display: flex; flex-wrap: wrap; gap: 4px; max-width: 210px; }
.panel-actions .btn { min-height: 26px; padding: 0 6px; font-size: 11px; }

:host([fullscreen]) {
  position: fixed;
  inset: 0;
  z-index: var(--fx-z-modal, 1100);
  background: var(--fx-surface-background);
}
:host([fullscreen]) .editor { height: 100%; border: none; border-radius: 0; }
:host([fullscreen]) .content, :host([fullscreen]) .source { flex: 1 1 auto; max-height: none; }

@media (max-width: 640px) {
  .toolbar { gap: 0; }
  .tb-group { padding: 0 1px; }
  .tb-btn { width: 28px; height: 28px; }
}
${FX_EDITOR_CONTENT_CSS}


`;
