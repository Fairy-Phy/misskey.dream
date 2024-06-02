import { reactive } from 'vue';
import { i18n } from '@/i18n.js';

export const timelineBarItemDef = reactive({
	pinned: {
		key: 'list',
		title: i18n.ts.pinnedList,
		icon: 'ti ti-star',
		iconOnly: true,
	},
	home: {
		key: 'home',
		title: i18n.ts._timelines.home,
		icon: 'ti ti-home',
		iconOnly: true,
	},
	local: {
		key: 'local',
		title: i18n.ts._timelines.local,
		icon: 'ti ti-planet',
		iconOnly: true,
	},
	social: {
		key: 'social',
		title: i18n.ts._timelines.social,
		icon: 'ti ti-universe',
		iconOnly: true,
	},
	global: {
		key: 'global',
		title: i18n.ts._timelines.global,
		icon: 'ti ti-whirl',
		iconOnly: true,
	},
	list: {
		icon: 'ti ti-list',
		title: i18n.ts.lists,
		iconOnly: true,
	},
	antenna: {
		icon: 'ti ti-antenna',
		title: i18n.ts.antennas,
		iconOnly: true,
	},
	channel: {
		icon: 'ti ti-device-tv',
		title: i18n.ts.channel,
		iconOnly: true,
	}
});
