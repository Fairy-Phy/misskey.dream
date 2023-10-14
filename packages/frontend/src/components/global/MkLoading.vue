<!--
SPDX-FileCopyrightText: syuilo and other misskey contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, { [$style.inline]: inline, [$style.colored]: colored, [$style.mini]: mini, [$style.em]: em }]">
	<div v-if="em" :class="$style.container">
		<svg xmlns="http://www.w3.org/2000/svg" :class="[$style.starSingle, $style.bg]" viewBox="0 0 63.29 66.05">
			<polygon points="38.99 2.5 41.8 23.63 60.79 33.3 41.56 42.49 38.24 63.55 23.55 48.11 2.5 51.45 12.65 32.71 2.96 13.72 23.93 17.58 38.99 2.5" />
		</svg>
		<svg xmlns="http://www.w3.org/2000/svg" :class="[$style.starSingle, $style.fg]" viewBox="0 0 63.29 66.05">
			<polygon points="38.99 2.5 41.8 23.63 60.79 33.3 41.56 42.49 38.24 63.55 23.55 48.11 2.5 51.45 12.65 32.71 2.96 13.72 23.93 17.58 38.99 2.5" />
		</svg>
	</div>
	<div v-else :class="$style.container">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 204.04 203.66" :class="[$style.line, { [$style.static]: static }]">
			<line :class="[$style.lineC]" x1="38.71" y1="54.13" x2="143.49" y2="150.61" />
			<line :class="[$style.lineT]" x1="30.64" y1="1.5" x2="136" y2="98.52" />
			<line :class="[$style.lineB]" x1="1.5" y1="58.83" x2="96.68" y2="146.43" />
		</svg>
		<svg xmlns="http://www.w3.org/2000/svg" :class="[$style.starT, { [$style.static]: static }]" viewBox="0 0 31.15 31.77">
			<polygon points="28.08 5.5 24.19 14.8 29.65 23.28 19.6 22.46 13.22 30.27 10.9 20.46 1.5 16.81 10.11 11.57 10.68 1.5 18.33 8.07 28.08 5.5" />
		</svg>
		<svg xmlns="http://www.w3.org/2000/svg" :class="[$style.starC, { [$style.static]: static }]" viewBox="0 0 63.29 66.05">
			<polygon points="38.99 2.5 41.8 23.63 60.79 33.3 41.56 42.49 38.24 63.55 23.55 48.11 2.5 51.45 12.65 32.71 2.96 13.72 23.93 17.58 38.99 2.5" />
		</svg>
		<svg xmlns="http://www.w3.org/2000/svg" :class="[$style.starB, { [$style.static]: static }]" viewBox="0 0 22.62 22.2">
			<polygon points="21.62 14.67 14.4 15.04 10.61 21.2 8.03 14.45 1 12.75 6.62 8.21 6.06 1 12.12 4.94 18.8 2.18 16.93 9.16 21.62 14.67" />
		</svg>
	</div>
</div>
</template>

<script lang="ts" setup>
import { } from 'vue';

const props = withDefaults(defineProps<{
	static?: boolean;
	inline?: boolean;
	colored?: boolean;
	mini?: boolean;
	em?: boolean;
}>(), {
	static: false,
	inline: false,
	colored: true,
	mini: false,
	em: false,
});
</script>

<style lang="scss" module>
@keyframes lineStroke {
	0% {
		stroke-dashoffset: 144;
	}
	25% {
		stroke-dashoffset: 144;
	}
	50% {
		stroke-dashoffset: 0;
	}
	75% {
		stroke-dashoffset: 0;
	}
	100% {
		stroke-dashoffset: -144;
	}
}

@keyframes starRolling {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(720deg);
	}
}
@keyframes starFading {
	0% {
		opacity: 0;
	}
	25% {
		opacity: 0;
	}
	50% {
		opacity: 1;
	}
	75% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}
@keyframes starMoving {
	0% {
		left: var(--startL, 0%);
		top: var(--startT, 0%);
	}
	25% {
		left: var(--startL, 0%);
		top: var(--startT, 0%);
	}
	50% {
		left: var(--endL);
		top: var(--endT);
	}
}


@keyframes spinner {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

.root {
	padding: 32px;
	text-align: center;
	cursor: wait;

	--size: 95px;

	&.colored {
		color: var(--accent);
	}

	&.inline {
		display: inline;
		--size: 80px;
	}

	&.mini {
		padding: 16px;
		--size: 80px;
	}

	&.em {
		display: inline-block;
		vertical-align: middle;
		padding: 0;
		--size: 1em;
	}
}

.container {
	position: relative;
	width: var(--size);
	height: var(--size);
	margin: 0 auto;
	--animTime: 5s;
	--lineDelay: .5s;
	--delayTimeT: .3s;
	--delayTimeB: .75s;
}

.line, .starC, .starT, .starB {
	fill:none;
	stroke-linecap:round;
	position: absolute;
	width: 100%;
}
.line, .starT {
	stroke-width:3px;
}

.line {
	stroke-miterlimit:10;
	stroke-dasharray: 144;
	stroke-dashoffset: 0;
	top: 0;
	left: 0;
}
.lineC {
	stroke:#A190FF;
}
.lineT {
	stroke:#FF8DDF;
	--delayTime: var(--delayTimeT);
}
.lineB {
	stroke:#F0FF8D;
	--delayTime: var(--delayTimeB);
}

.starC {
	stroke-width:5px;
	stroke:#7DB9F5;
	--endL: 69%;
	--endT: 68%;
	width: 29%;
}
.starT {
	stroke:#F57D9D;
	--startL: 15%;
	--endL: 66%;
	--endT: 46%;
	--delayTime: var(--delayTimeT);
	width: 15%;
}
.starB {
	stroke-width:2px;
	stroke:#7DF5B9;
	--startT: 25%;
	--endL: 47%;
	--endT: 70%;
	--delayTime: var(--delayTimeB);
	width: 10%;
}

:is(.lineC, .lineT, .lineB):not(.static) {
	stroke-dashoffset: 144;
	animation: var(--animTime) ease-in-out calc(var(--lineDelay) + var(--delayTime, 0s)) infinite lineStroke;
}

.starC, .starT, .starB {
	opacity: 1;
	transform-origin: center center;
	left: var(--endL);
	top: var(--endT);
	stroke-linejoin: round;
}

:is(.starC, .starT, .starB):not(.static) {
	opacity: 0;
	animation:
		var(--animTime) ease-in-out var(--delayTime, 0s) infinite starFading,
		var(--animTime) linear var(--delayTime, 0s) infinite starRolling,
		var(--animTime) ease-in-out var(--delayTime, 0s) infinite starMoving;
}

@keyframes starStroke {
	0% {
		stroke-dashoffset: 107;
	}
	100% {
		stroke-dashoffset: -107;
	}
}

.starSingle {
	fill:none;
	stroke-linecap:round;
	position: absolute;
	transform-origin: center center;
	stroke-linejoin: round;
	stroke-width: 8px;
	stroke: currentColor;
	width: 100%;
	height: 100%;
	top: -1px;
	left: -1px;

	&.bg {
		opacity: .5;
	}

	&.fg {
		stroke-dasharray: 107;
		stroke-dashoffset: 0;
		animation: 2s linear 0s infinite backwards starStroke;
	}
}
</style>
