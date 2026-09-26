/**
 * Tipos da biblioteca de ícones (separados do runtime e da lista gerada).
 *
 * `FenixIconName` aceita TODOS os nomes da fonte (a união literal gerada em
 * ./name-union.ts) e, ao mesmo tempo, continua aceitando qualquer string —
 * é a escotilha `(string & {})`, que faz o editor sugerir os ~4.200 nomes
 * conhecidos sem quebrar código que monta o nome dinamicamente.
 */

import type { FenixIconKnownName } from './name-union';

/** Nome de glifo da Fenix Icons (autocomplete com os nomes conhecidos). */
export type FenixIconName = FenixIconKnownName | (string & {});

/** Exporta a união gerada (útil para asserts de tipo e para a doc). */
export type { FenixIconKnownName };