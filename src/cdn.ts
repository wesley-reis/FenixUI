/**
 * Entrada para o bundle CDN/UMD (`fenix-ui.umd.min.js`).
 * Importa e registra todos os componentes (incl. a biblioteca de ícones) de uma vez.
 *
 * Os `export *` abaixo existem para que o Rollup gere o GLOBAL `FenixUI` no UMD:
 * sem nenhum export o wrapper não atribui global nenhum, e os snippets da doc
 * (`FenixUI.theme('dark')`, `FenixUI.setTokens({…})`) falhariam com
 * `ReferenceError: FenixUI is not defined`. É o mesmo motivo pelo qual
 * `FenixToast` é atribuído explicitamente em ./components/toast/toast.ts.
 *
 * Assim, em HTML puro / JSP / .NET / Thymeleaf ficam disponíveis:
 *   FenixUI.theme / setTokens / configure / resetTheme
 *   FenixUI.applyPreset / defineCustomPreset / listPresets
 *   FenixUI.setFenixIconsFontUrl (subset de ícones) / loadFenixIcons / …
 *
 * NÃO afeta o build ESM: `src/cdn.ts` não é entrada de `vite.config.ts`, então
 * quem instala via bundler (Vue/React) continua com o mesmo dist.
 */
import './index';
import './icons';

export * from './core/theme';
export * from './core/presets';
export * from './icons';