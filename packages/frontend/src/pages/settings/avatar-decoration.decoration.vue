<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div
	:class="[$style.root, { [$style.active]: active }]"
	@click="emit('click')"
>
	<div :class="$style.name"><MkCondensedLine :minScale="0.5">{{ decoration.name }}</MkCondensedLine></div>
	<MkAvatar style="width: 60px; height: 60px;" :user="$i" :decorations="[{ url: decoration.url, angle, flipH, offsetX, offsetY, scale, moveX, moveY, opacity }]" forceShowDecoration/>
	<i v-if="decoration.roleIdsThatCanBeUsedThisDecoration.length > 0 && !$i.roles.some(r => decoration.roleIdsThatCanBeUsedThisDecoration.includes(r.id))" :class="$style.lock" class="ti ti-lock"></i>
	<!-- <span v-if="$i.avatarDecorations.some(x => x.id === avatarDecoration.id)" :class="$style.layerNum">{{ indexOfDecoration(v => v.id === avatarDecoration.id) + 1 }}</span> -->
</div>
</template>


<script lang="ts" setup>
import { } from 'vue';
import { $i } from '@/account.js';

const props = defineProps<{
	active?: boolean;
	decoration: {
		id: string;
		url: string;
		name: string;
		roleIdsThatCanBeUsedThisDecoration: string[];
	};
	angle?: number;
	flipH?: boolean;
	offsetX?: number;
	offsetY?: number;
	scale?: number;
	moveX?: number;
	moveY?: number;
	opacity?: number;
}>();

const emit = defineEmits<{
	(ev: 'click'): void;
}>();

function indexOfDecoration(f) {
	let result = -1;
	$i.avatarDecorations.some((e, i) => {
		if (f(e)) {
			result = i;
			return true;
		}
		return false;
	});
	return result;
}
</script>

<style lang="scss" module>
.root {
	cursor: pointer;
	padding: 16px 16px 28px 16px;
	border: solid 2px var(--divider);
	border-radius: 8px;
	text-align: center;
	font-size: 90%;
	overflow: clip;
	contain: content;
}

.active {
	background-color: var(--accentedBg);
	border-color: var(--accent);
}

.name {
	position: relative;
	z-index: 10;
	font-weight: bold;
	margin-bottom: 20px;
}

.lock {
	position: absolute;
	bottom: 12px;
	right: 12px;
}

.layerNum {
	position: absolute;
	left: 0;
	top: 0;
	margin: 10px;
	color: var(--accent);
	border: solid 1px var(--accent);
	padding: 0 5px;
	border-radius: 4px;
	font-weight: bold;
}
</style>
