/**
 * Entrada principal do FenixUI.
 *
 * Ao importar este agregador, todos os componentes são registrados (bundle
 * "tudo-em-um"). Para consumo com TREE-SHAKING, prefira importar apenas o
 * subpath que deseja, ex.: `@fenix-ui/fenix-ui/button`.
 */

// core
export * from './core/tokens';
export * from './core/theme';
export * from './core/presets';
export * from './core/css';
export * from './core/base';
export * from './core/define';

// componentes
export * from './components/button';
export * from './components/badge';
export * from './components/spinner';
export * from './components/select';
export * from './components/input';
export * from './components/switch';
export * from './components/multiselect';
export * from './components/calendar';
export * from './components/datepicker';
export * from './components/checkbox';
export * from './components/radio';
export * from './components/table';
export * from './components/floatlabel';