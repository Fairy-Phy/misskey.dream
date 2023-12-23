<template>
	<span :class="$style.badge">{{ i18n.ts.badgeNameOfDream }}</span>
</template>

<script lang="ts" setup>
import { i18n } from '@/i18n.js';
</script>

<style lang="scss" module>
.badge {
	margin-left: 0.7em;
	font-size: 65%;
	padding: 2px 3px;
	color: var(--accent);
	border: solid 1px var(--accent);
	border-radius: 4px;
	vertical-align: middle;
}
</style>
