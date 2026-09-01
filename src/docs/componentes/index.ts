/**
 * Registro lazy dos componentes da documentação.
 *
 * Os metadados (sidebar) carregam no boot; o componente web em si só é
 * importado quando a rota é acessada (`componentLoaders[tag]()`).
 */
import type { ComponentDoc } from '../types';

import { buttonDoc } from './button.doc';
import { badgeDoc } from './badge.doc';
import { selectDoc } from './select.doc';
import { inputDoc } from './input.doc';
import { multiselectDoc } from './multiselect.doc';
import { switchDoc } from './switch.doc';
import { calendarDoc } from './calendar.doc';
import { datepickerDoc } from './datepicker.doc';
import { checkboxDoc } from './checkbox.doc';
import { spinnerDoc } from './spinner.doc';
import { radioDoc } from './radio.doc';
import { tableDoc } from './table.doc';
import { floatlabelDoc } from './floatlabel.doc';
import { textareaDoc } from './textarea.doc';
import { dialogDoc } from './dialog.doc';
import { toastDoc } from './toast.doc';
import { tooltipDoc } from './tooltip.doc';
import { tabsDoc } from './tabs.doc';
import { progressDoc } from './progress.doc';
import { skeletonDoc } from './skeleton.doc';
import { alertDoc } from './alert.doc';
import { drawerDoc } from './drawer.doc';
import { dropdownDoc } from './dropdown.doc';
import { paginationDoc } from './pagination.doc';
import { autocompleteDoc } from './autocomplete.doc';
import { knobDoc } from './knob.doc';
import { accordionDoc } from './accordion.doc';
import { orderlistDoc } from './orderlist.doc';
import { picklistDoc } from './picklist.doc';

export const componentDocs: ComponentDoc[] = [
	buttonDoc,
	badgeDoc,
	selectDoc,
	inputDoc,
	multiselectDoc,
	switchDoc,
	calendarDoc,
	datepickerDoc,
	checkboxDoc,
	spinnerDoc,
	radioDoc,
	tableDoc,
	floatlabelDoc,
	textareaDoc,
	dialogDoc,
	toastDoc,
	tooltipDoc,
	tabsDoc,
	progressDoc,
	skeletonDoc,
	alertDoc,
	drawerDoc,
	dropdownDoc,
	paginationDoc,
	autocompleteDoc,
	knobDoc,
	accordionDoc,
	orderlistDoc,
	picklistDoc,
];

export const componentLoaders: Record<string, () => Promise<unknown>> = {
	'fx-button': () => import('../../components/button'),
	'fx-badge': () => import('../../components/badge'),
	'fx-select': () => import('../../components/select'),
	'fx-input': () => import('../../components/input'),
	'fx-multiselect': () => import('../../components/multiselect'),
	'fx-switch': () => import('../../components/switch'),
	'fx-calendar': () => import('../../components/calendar'),
	'fx-datepicker': () => import('../../components/datepicker'),
	'fx-checkbox': () => import('../../components/checkbox'),
	'fx-spinner': () => import('../../components/spinner'),
	'fx-radio': () => import('../../components/radio'),
	'fx-table': () => import('../../components/table'),
	'fx-floatlabel': () => import('../../components/floatlabel'),
	'fx-textarea': () => import('../../components/textarea'),
	'fx-dialog': () => import('../../components/dialog'),
	'fx-toast': () => import('../../components/toast'),
	'fx-tooltip': () => import('../../components/tooltip'),
	'fx-tabs': () => import('../../components/tabs'),
	'fx-progress': () => import('../../components/progress'),
	'fx-skeleton': () => import('../../components/skeleton'),
	'fx-alert': () => import('../../components/alert'),
	'fx-drawer': () => import('../../components/drawer'),
	'fx-dropdown': () => import('../../components/dropdown'),
	'fx-pagination': () => import('../../components/pagination'),
	'fx-autocomplete': () => import('../../components/autocomplete'),
	'fx-knob': () => import('../../components/knob'),
	'fx-accordion': () => import('../../components/accordion'),
	'fx-orderlist': () => import('../../components/orderlist'),
	'fx-picklist': () => import('../../components/picklist'),
};
