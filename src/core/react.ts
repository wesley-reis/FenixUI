/**
 * Tipagens de componentes <fx-*> para React com o runtime JSX moderno
 * (`"jsx": "react-jsx"` no tsconfig), cujo namespace `React.JSX` NÃO herda
 * a augmentação global de `JSX` feita em `@wrrdev/fenix-ui/jsx`.
 *
 * Módulo OPT-IN: importe `@wrrdev/fenix-ui/react` uma única vez (ex.: no
 * `main.tsx`) para habilitar autocomplete + validação das tags fx-* em TSX.
 * Requer os tipos do React (`@types/react`) no projeto consumidor.
 */
import type { FxJsxIntrinsicElements } from './jsx';

export const FX_REACT_TYPES = true as const;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends FxJsxIntrinsicElements {}
  }
}

/** Reexporta os tipos nomeados de props para consumidores React. */
export type * from './jsx';
