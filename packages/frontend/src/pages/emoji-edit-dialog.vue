<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkWindow
	ref="windowEl"
	:initialWidth="400"
	:initialHeight="500"
	:canResize="false"
	@close="windowEl.close()"
	@closed="$emit('closed')"
>
	<template v-if="emoji" #header>
		<div :class="$style.header">
			<span>:{{ emoji.name.length > 30 ? emoji.name.slice(0, 27) + "..." : emoji.name }}:</span>
			<XTabs data-window-header-clickable :class="$style.tabs" :rootEl="dialog" :tab="tab" :tabs="headerTabs" @update:tab="key => tab = key"/>
		</div>
	</template>
	<template v-else #header>New emoji</template>

	<div v-if="tab === 'overview'" style="display: flex; flex-direction: column; min-height: 100%;">
		<MkSpacer :marginMin="20" :marginMax="28" style="flex-grow: 1;">
			<div class="_gaps_m">
				<div v-if="imgUrl != null" :class="$style.imgs">
					<div style="background: #000;" :class="$style.imgContainer">
						<img :src="imgUrl" :class="$style.img"/>
					</div>
					<div style="background: #222;" :class="$style.imgContainer">
						<img :src="imgUrl" :class="$style.img"/>
					</div>
					<div style="background: #ddd;" :class="$style.imgContainer">
						<img :src="imgUrl" :class="$style.img"/>
					</div>
					<div style="background: #fff;" :class="$style.imgContainer">
						<img :src="imgUrl" :class="$style.img"/>
					</div>
				</div>
				<MkButton rounded style="margin: 0 auto;" @click="changeImage">{{ i18n.ts.selectFile }}</MkButton>
				<MkInput v-model="name" pattern="[a-z0-9_]" autocapitalize="off">
					<template #label>{{ i18n.ts.name }}</template>
				</MkInput>
				<MkInput v-model="category" :datalist="customEmojiCategories">
					<template #label>{{ i18n.ts.category }}</template>
				</MkInput>
				<MkFolder>
					<template #icon><i class="ti ti-list"></i></template>
					<template #label>{{ i18n.ts.tags }}<DreamFeatureBadge/></template>

					<div :class="$style.metadataRoot">
						<div :class="$style.metadataMargin">
							<MkButton :disabled="aliases.length >= 16" inline style="margin-right: 8px;" @click="addAliase"><i class="ti ti-plus"></i> {{ i18n.ts.add }}</MkButton>
							<MkButton v-if="!aliaseEditMode" :disabled="aliases.length <= 1" inline danger style="margin-right: 8px;" @click="aliaseEditMode = !aliaseEditMode"><i class="ti ti-trash"></i> {{ i18n.ts.delete }}</MkButton>
							<MkButton v-else inline style="margin-right: 8px;" @click="aliaseEditMode = !aliaseEditMode"><i class="ti ti-arrows-sort"></i> {{ i18n.ts.rearrange }}</MkButton>
						</div>

						<Sortable
							v-model="aliases"
							class="_gaps_s"
							itemKey="id"
							:animation="150"
							:handle="'.' + $style.dragItemHandle"
							@start="e => e.item.classList.add('active')"
							@end="e => e.item.classList.remove('active')"
						>
							<template #item="{element, index}">
								<div :class="$style.aliaseDragItem">
									<button v-if="!aliaseEditMode" class="_button" :class="$style.dragItemHandle" tabindex="-1"><i class="ti ti-menu"></i></button>
									<button v-if="aliaseEditMode" :disabled="aliases.length <= 1" class="_button" :class="$style.dragItemRemove" @click="deleteAliase(index)"><i class="ti ti-x"></i></button>
									<div :class="$style.dragItemForm">
										<FormSplit :minWidth="200">
											<MkInput v-model="element.value" small></MkInput>
										</FormSplit>
									</div>
								</div>
							</template>
						</Sortable>
					</div>
				</MkFolder>
				<MkInput v-model="aliasesText" autocapitalize="off">
					<template #label>{{ i18n.ts.tags }}(Legacy)</template>
					<template #caption>
						{{ i18n.ts.theKeywordWhenSearchingForCustomEmoji }}<br/>
						{{ i18n.ts.setMultipleBySeparatingWithSpace }}
					</template>
				</MkInput>
				<MkSwitch v-model="isSelfMadeResource">{{ i18n.ts.selfMadeResource }}</MkSwitch>
				<MkInput v-model.trim="license" :mfmAutocomplete="true">
					<template v-if="isSelfMadeResource" #label>{{ i18n.ts.license }}</template>
					<template v-else #label>{{ i18n.ts.nonSelfResourceLicense }}</template>
				</MkInput>
				<MkFolder>
					<template #label>{{ i18n.ts.rolesThatCanBeUsedThisEmojiAsReaction }}</template>
					<template #suffix>{{ rolesThatCanBeUsedThisEmojiAsReaction.length === 0 ? i18n.ts.all : rolesThatCanBeUsedThisEmojiAsReaction.length }}</template>

					<div class="_gaps">
						<MkButton rounded @click="addRole"><i class="ti ti-plus"></i> {{ i18n.ts.add }}</MkButton>

						<div v-for="role in rolesThatCanBeUsedThisEmojiAsReaction" :key="role.id" :class="$style.roleItem">
							<MkRolePreview :class="$style.role" :role="role" :forModeration="true" :detailed="false" style="pointer-events: none;"/>
							<button v-if="role.target === 'manual'" class="_button" :class="$style.roleUnassign" @click="removeRole(role, $event)"><i class="ti ti-x"></i></button>
							<button v-else class="_button" :class="$style.roleUnassign" disabled><i class="ti ti-ban"></i></button>
						</div>

						<MkInfo>{{ i18n.ts.rolesThatCanBeUsedThisEmojiAsReactionEmptyDescription }}</MkInfo>
						<MkInfo warn>{{ i18n.ts.rolesThatCanBeUsedThisEmojiAsReactionPublicRoleWarn }}</MkInfo>
					</div>
				</MkFolder>
				<MkSwitch v-model="isSensitive">{{ i18n.ts.markAsSensitive }}</MkSwitch>
				<MkSwitch v-model="localOnly">{{ i18n.ts.localOnly }}</MkSwitch>
				<MkInput v-if="emoji" v-model="userId">
					<template #label>userId</template>
				</MkInput>
				<MkButton v-if="emoji" danger @click="del()"><i class="ti ti-trash"></i> {{ i18n.ts.delete }}</MkButton>
			</div>
		</MkSpacer>
		<div :class="$style.footer">
			<MkButton primary rounded style="margin: 0 auto;" @click="done"><i class="ti ti-check"></i> {{ props.emoji ? i18n.ts.update : i18n.ts.create }}</MkButton>
		</div>
	</div>

	<div v-else-if="tab === 'log'">
		<MkSpacer :marginMin="20" :marginMax="28">
			<div class="_gaps_m">
				<MkPagination :pagination="pagination">
					<template #default="{ items }">
						<div class="_gaps_s">
							<MkEmojiLog v-for="item in items" :key="item.id" :emojiLog="item" />
						</div>
					</template>
				</MkPagination>
			</div>
		</MkSpacer>
	</div>
</MkWindow>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, watch, ref } from 'vue';
import * as Misskey from 'misskey-js';
import MkWindow from '@/components/MkWindow.vue';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkFolder from '@/components/MkFolder.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { i18n } from '@/i18n.js';
import { customEmojiCategories } from '@/custom-emojis.js';
import MkSwitch from '@/components/MkSwitch.vue';
import { selectFile } from '@/scripts/select-file.js';
import MkRolePreview from '@/components/MkRolePreview.vue';
import XTabs from '@/components/global/MkPageHeader.tabs.vue';
import MkPagination, { Paging } from '@/components/MkPagination.vue';
import MkEmojiLog from '@/components/MkEmojiLog.vue';
import { $i } from '@/account';
import DreamFeatureBadge from '@/components/DreamFeatureBadge.vue';

const Sortable = defineAsyncComponent(() => import('vuedraggable').then(x => x.default));

const props = defineProps<{
	emoji?: any,
}>();

const windowEl = ref<InstanceType<typeof MkWindow> | null>(null);
const name = ref<string>(props.emoji ? props.emoji.name : '');
const category = ref<string>(props.emoji ? props.emoji.category : '');
const aliases = ref<{ id: string, value: string }[]>(props.emoji ? props.emoji.aliases.map(x => ({
	id: Math.random().toString(),
	value: x,
})) : []);
const aliasesText = computed({
	get: () => aliases.value.map(v => v.value).join(' '),
	set: (v: string) => {
		const vs = v.split(' ');
		if (vs.length === aliases.value.length) {
			let edited = false;
			for (let i = 0; i < vs.length; i++) {
				if (aliases.value[i].value !== vs[i]) {
					edited = true;
					break;
				}
			}
			if (!edited) return;
		}
		aliases.value = vs.map(x => ({
			id: Math.random().toString(),
			value: x,
		}));
	}
});
const isSelfMadeResource = ref(props.emoji ? props.emoji.isSelfMadeResource : false);
const license = ref<string>(props.emoji ? (props.emoji.license ?? '') : '');
const isSensitive = ref(props.emoji ? props.emoji.isSensitive : false);
const localOnly = ref(props.emoji ? props.emoji.localOnly : false);
const roleIdsThatCanBeUsedThisEmojiAsReaction = ref(props.emoji ? props.emoji.roleIdsThatCanBeUsedThisEmojiAsReaction : []);
const rolesThatCanBeUsedThisEmojiAsReaction = ref<Misskey.entities.Role[]>([]);
const file = ref<Misskey.entities.DriveFile>();

const userId: string = ref(props.emoji && props.emoji.userId ? props.emoji.userId : '');

const pagination: Paging = {
	endpoint: 'admin/emoji/get-emoji-log' as const,
	limit: 10,
	params: computed(() => ({
		id: props.emoji.id
	})),
	offsetMode: true,
	noPaging: true,
};

const tab = ref('overview');
const headerTabs = computed(() => [{
	key: 'overview',
	title: i18n.ts.overview,
}, {
	key: 'log',
	title: i18n.ts.logs,
}]);

const aliaseEditMode = ref(false);

function addAliase() {
	aliases.value.push({
		id: Math.random().toString(),
		value: '',
	});
}

function deleteAliase(index: number) {
	aliases.value.splice(index, 1);
}

watch(roleIdsThatCanBeUsedThisEmojiAsReaction, async () => {
	rolesThatCanBeUsedThisEmojiAsReaction.value = (await Promise.all(roleIdsThatCanBeUsedThisEmojiAsReaction.value.map((id) => misskeyApi('admin/roles/show', { roleId: id }).catch(() => null)))).filter(x => x != null);
}, { immediate: true });

const imgUrl = computed(() => file.value ? file.value.url : props.emoji ? `/emoji/${props.emoji.name}.webp` : null);

const emit = defineEmits<{
	(ev: 'done', v: { deleted?: boolean; updated?: any; created?: any }): void,
	(ev: 'closed'): void
}>();

async function changeImage(ev) {
	file.value = await selectFile(ev.currentTarget ?? ev.target, null);
	const candidate = file.value.name.replace(/\.(.+)$/, '');
	if (candidate.match(/^[a-z0-9_]+$/)) {
		name.value = candidate;
	}
}

async function addRole() {
	const roles = await misskeyApi('admin/roles/list');
	const currentRoleIds = rolesThatCanBeUsedThisEmojiAsReaction.value.map(x => x.id);

	const { canceled, result: role } = await os.select({
		items: roles.filter(r => r.isPublic).filter(r => !currentRoleIds.includes(r.id)).map(r => ({ text: r.name, value: r })),
	});
	if (canceled || role == null) return;

	rolesThatCanBeUsedThisEmojiAsReaction.value.push(role);
}

async function removeRole(role, ev) {
	rolesThatCanBeUsedThisEmojiAsReaction.value = rolesThatCanBeUsedThisEmojiAsReaction.value.filter(x => x.id !== role.id);
}

async function licenseCheckWithCanceled(): Promise<boolean> {
	if (isSelfMadeResource.value) {
		if (license.value === '') {
			const { canceled } = await os.confirm({
				type: 'warning',
				text: i18n.ts.noneLicense,
				okText: i18n.ts.yes,
				cancelText: i18n.ts.no,
			});
			if (canceled) {
				await os.alert({
					type: 'error',
					title: i18n.ts.error,
					text: i18n.ts.noneLicenseNo,
				});
				return true;
			}
		}
		return false;
	}

	if (license.value === '') {
		await os.alert({
			type: 'error',
			title: i18n.ts.error,
			text: i18n.ts.pleaseEnterTheLicenseNonSelf,
		});
		return true;
	}
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.tsx.checkLicenseNonSelf({
			license: license.value,
		}),
		okText: i18n.ts.yes,
		cancelText: i18n.ts.no,
	});
	if (canceled) {
		await os.alert({
			type: 'error',
			title: i18n.ts.error,
			text: i18n.ts.nonLicenseCannotAddNonSelf,
		});
		return true;
	}
	return false;
}

async function done() {
	if (await licenseCheckWithCanceled()) {
		return;
	}

	if (!props.emoji && $i.emojiCount < 10) {
		const { canceled } = await os.confirm({
			type: 'warning',
			text: i18n.ts.confirmAddEmoji,
			okText: i18n.ts.yes,
			cancelText: i18n.ts.no,
		});
		if (canceled) return;
	}

	const params = {
		name: name.value,
		category: category.value === '' ? null : category.value,
		aliases: aliases.value.map(v => v.value),
		isSelfMadeResource: isSelfMadeResource.value,
		license: license.value === '' ? null : license.value,
		isSensitive: isSensitive.value,
		localOnly: localOnly.value,
		roleIdsThatCanBeUsedThisEmojiAsReaction: rolesThatCanBeUsedThisEmojiAsReaction.value.map(x => x.id),
		...((props.emoji && props.emoji.userId ? props.emoji.userId : '') !== userId.value ? { userId: userId.value } : {}),
	};

	if (file.value) {
		params.fileId = file.value.id;
	}

	if (props.emoji) {
		await os.apiWithDialog('admin/emoji/update', {
			id: props.emoji.id,
			...params,
		});

		emit('done', {
			updated: {
				id: props.emoji.id,
				...params,
			},
		});

		windowEl.value.close();
	} else {
		const created = await os.apiWithDialog('admin/emoji/add', params);

		emit('done', {
			created: created,
		});

		windowEl.value.close();
	}
}

async function del() {
	const { canceled } = await os.confirm({
		type: 'warning',
		text: i18n.tsx.removeAreYouSure({ x: name.value }),
	});
	if (canceled) return;

	misskeyApi('admin/emoji/delete', {
		id: props.emoji.id,
	}).then(() => {
		emit('done', {
			deleted: true,
		});
		windowEl.value.close();
	});
}
</script>

<style lang="scss" module>

.header {
	display: flex;
	gap: 10px;
}

.imgs {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	justify-content: center;
}

.imgContainer {
	padding: 8px;
	border-radius: 6px;
}

.img {
	display: block;
	height: 64px;
	width: 64px;
	object-fit: contain;
}

.roleItem {
	display: flex;
}

.role {
	flex: 1;
}

.roleUnassign {
	width: 32px;
	height: 32px;
	margin-left: 8px;
	align-self: center;
}

.footer {
	position: sticky;
	z-index: 10000;
	bottom: 0;
	left: 0;
	padding: 12px;
	border-top: solid 0.5px var(--divider);
	background: var(--acrylicBg);
	-webkit-backdrop-filter: var(--blur, blur(15px));
	backdrop-filter: var(--blur, blur(15px));
}

// profile.vueからの流用
.metadataRoot {
	container-type: inline-size;
}

.metadataMargin {
	margin-bottom: 1.5em;
}

.aliaseDragItem {
	display: flex;
	padding-bottom: .75em;
	align-items: flex-end;
	border-bottom: solid 0.5px var(--divider);

	&:last-child {
		border-bottom: 0;
	}

	/* (drag button) 32px + (drag button margin) 8px + (input width) 200px * 2 + (input gap) 12px = 452px */
	@container (max-width: 452px) {
		align-items: center;
	}
}

.dragItemHandle {
	cursor: grab;
	width: 32px;
	height: 32px;
	margin: 0 8px 0 0;
	opacity: 0.5;
	flex-shrink: 0;

	&:active {
		cursor: grabbing;
	}
}

.dragItemRemove {
	@extend .dragItemHandle;

	color: #ff2a2a;
	opacity: 1;
	cursor: pointer;

	&:hover, &:focus {
		opacity: .7;
	}
	&:active {
		cursor: pointer;
	}
}

.dragItemForm {
	flex-grow: 1;
}

.tabs:first-child {
	margin-left: auto;
	padding: 0 12px;
}
.tabs {
	pointer-events: auto;
	margin-right: auto;
}
</style>
