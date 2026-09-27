/**
 * Roteador por hash da documentação (SPA sem framework).
 *
 * Contrato: `#/rota` é exclusivo da navegação de páginas; âncoras internas
 * (ex.: TOC) usam `preventDefault` e nunca escrevem no hash.
 */
export const DEFAULT_ROUTE = 'home';

/** Extrai a rota do hash (`#/fx-button` → `fx-button`; vazio → `home`). */
export const routeFromHash = (hash: string = location.hash): string =>
	hash.replace(/^#\//, '') || DEFAULT_ROUTE;

/** Href canônico de uma rota (`fx-button` → `#/fx-button`). */
export const hrefFor = (route: string): string => `#/${route}`;

/**
 * Inicia o roteador: registra o listener de `hashchange` e despacha a rota
 * atual uma vez (carga inicial). Retorna a função de teardown.
 */
export function startRouter(onChange: (route: string) => void): () => void {
	const handler = (): void => onChange(routeFromHash());
	window.addEventListener('hashchange', handler);
	onChange(routeFromHash());
	return () => window.removeEventListener('hashchange', handler);
}
