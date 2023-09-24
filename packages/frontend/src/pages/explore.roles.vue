<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkSpacer>
	<MkFoldableSection>
		<template #header>{{ i18n.ts._role.manual + " " + i18n.ts.roles }}</template>
		<div :class="$style.roleGrid">
			<MkRolePreview v-for="role in rolesManual" :key="role.id" :role="role" :forModeration="false"/>
		</div>
	</MkFoldableSection>
	<MkFoldableSection>
		<template #header>{{ i18n.ts._role.conditional + " " + i18n.ts.roles }}</template>
		<div :class="$style.roleGrid">
			<MkRolePreview v-for="role in rolesConditional" :key="role.id" :role="role" :forModeration="false"/>
		</div>
	</MkFoldableSection>
	<MkFoldableSection>
		<template #header>{{ i18n.ts.community + " " + i18n.ts.roles }}</template>
		<div :class="$style.roleGrid">
			<MkRolePreview v-for="role in rolesCommunity" :key="role.id" :role="role" :forModeration="false"/>
		</div>
	</MkFoldableSection>
</MkSpacer>
</template>

<script lang="ts" setup>
import { } from 'vue';
import MkRolePreview from '@/components/MkRolePreview.vue';
import MkFoldableSection from '@/components/MkFoldableSection.vue';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';

let rolesManual = $ref();
let rolesConditional = $ref();
let rolesCommunity = $ref();

os.api('roles/list').then(res => {
	const roles = res.sort((a, b) => b.displayOrder - a.displayOrder);
	rolesManual = roles.filter(x => x.target === 'manual' && x.permissionGroup !== 'Community');
	rolesConditional = roles.filter(x => x.target === 'conditional' && x.permissionGroup !== 'Community');
	rolesCommunity = roles.filter(x => x.permissionGroup === 'Community');
});
</script>

<style lang="scss" module>
	.roleGrid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		grid-gap: var(--margin);
	}
</style>

