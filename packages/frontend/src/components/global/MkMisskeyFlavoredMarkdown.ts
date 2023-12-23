/*
 * SPDX-FileCopyrightText: syuilo and other misskey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { VNode, h } from 'vue';
import * as mfm from 'mfm-js';
import * as Misskey from 'misskey-js';
import MkUrl from '@/components/global/MkUrl.vue';
import MkTime from '@/components/global/MkTime.vue';
import MkLink from '@/components/MkLink.vue';
import MkMention from '@/components/MkMention.vue';
import MkEmoji from '@/components/global/MkEmoji.vue';
import MkCustomEmoji from '@/components/global/MkCustomEmoji.vue';
import MkEmojiKitchen from '@/components/global/MkEmojiKitchen.vue';
import MkCode from '@/components/MkCode.vue';
import MkGoogle from '@/components/MkGoogle.vue';
import MkSparkle from '@/components/MkSparkle.vue';
import MkA from '@/components/global/MkA.vue';
import { host } from '@/config.js';
import { defaultStore } from '@/store.js';
import { mixEmoji } from '@/scripts/emojiKitchen/emojiMixer.js';
import { nyaize as doNyaize } from '@/scripts/nyaize.js';

const QUOTE_STYLE = `
display: block;
margin: 8px;
padding: 6px 0 6px 12px;
color: var(--fg);
border-left: solid 3px var(--fg);
opacity: 0.7;
`.split('\n').join(' ');

const colorRegexp = /^([0-9a-f]{3,4}?|[0-9a-f]{6}?|[0-9a-f]{8}?)$/i;
function checkColorHex(text: string) {
	return colorRegexp.test(text);
}

const gradientCounterRegExp = /^(color|step)(\d+)/;

function toGradientText(args: Record<string, string>) {
	const colors: { index: number; step?: string, color?: string }[] = [];
	for (const k in args) {
		const matches = k.match(gradientCounterRegExp);
		if (matches == null) continue;
		const mindex = parseInt(matches[2]);
		let i = colors.findIndex(v => v.index === mindex);
		if (i === -1) {
			i = colors.length;
			colors.push({ index: mindex });
		}
		colors[i][matches[1]] = args[k];
	}
	let deg = parseFloat(args.deg || '90');
	let res = `linear-gradient(${deg}deg`;
	for (const colorProp of colors.sort((a, b) => a.index - b.index)) {
		let color = colorProp.color;
		if (!color || !checkColorHex(color)) color = 'f00';
		let step = parseFloat(colorProp.step ?? '');
		let stepText = isNaN(step) ? '' : ` ${step}%`;
		res += `, #${color}${stepText}`;
	}
	return res + ')';
}

type MfmProps = {
	text: string;
	plain?: boolean;
	nowrap?: boolean;
	author?: Misskey.entities.UserLite;
	isNote?: boolean;
	emojiUrls?: string[];
	rootScale?: number;
	nyaize?: boolean | 'respect';
	parsedNodes?: mfm.MfmNode[] | null;
	enableEmojiMenu?: boolean;
	enableEmojiMenuReaction?: boolean;
};

// eslint-disable-next-line import/no-default-export
export default function(props: MfmProps) {
	const isNote = props.isNote ?? true;
	const shouldNyaize = props.nyaize ? props.nyaize === 'respect' ? props.author?.isCat : false : false;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (props.text == null || props.text === '') return;

	const rootAst = props.parsedNodes ?? (props.plain ? mfm.parseSimple : mfm.parse)(props.text);

	const validTime = (t: string | null | undefined) => {
		if (t == null || typeof t === 'boolean') return null;
		return t.match(/^[0-9.]+s$/) ? t : null;
	};

	const useAnim = defaultStore.state.advancedMfm && defaultStore.state.animatedMfm;

	/**
	 * Gen Vue Elements from MFM AST
	 * @param ast MFM AST
	 * @param scale How times large the text is
	 * @param disableNyaize Whether nyaize is disabled or not
	 */
	const genEl = (ast: mfm.MfmNode[], scale: number, disableNyaize = false) => ast.map((token): VNode | string | (VNode | string)[] => {
		switch (token.type) {
			case 'text': {
				let text = token.props.text.replace(/(\r\n|\n|\r)/g, '\n');
				if (!disableNyaize && shouldNyaize) {
					text = doNyaize(text);
				}

				if (!props.plain) {
					const res: (VNode | string)[] = [];
					for (const t of text.split('\n')) {
						res.push(h('br'));
						res.push(t);
					}
					res.shift();
					return res;
				} else {
					return [text.replace(/\n/g, ' ')];
				}
			}

			case 'bold': {
				return [h('b', genEl(token.children, scale))];
			}

			case 'strike': {
				return [h('del', genEl(token.children, scale))];
			}

			case 'italic': {
				return h('i', {
					style: 'font-style: oblique;',
				}, genEl(token.children, scale));
			}

			case 'fn': {
				// TODO: CSSを文字列で組み立てていくと token.props.args.~~~ 経由でCSSインジェクションできるのでよしなにやる
				let style: string | undefined;
				switch (token.props.name) {
					case 'tada': {
						const speed = validTime(token.props.args.speed) ?? '1s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = 'font-size: 150%;' + (useAnim ? `animation: tada ${speed} linear infinite both; animation-delay: ${delay};` : '');
						break;
					}
					case 'jelly': {
						const speed = validTime(token.props.args.speed) ?? '1s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = (useAnim ? `animation: mfm-rubberBand ${speed} linear infinite both; animation-delay: ${delay};` : '');
						break;
					}
					case 'twitch': {
						const speed = validTime(token.props.args.speed) ?? '0.5s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = useAnim ? `animation: mfm-twitch ${speed} ease infinite; animation-delay: ${delay};` : '';
						break;
					}
					case 'shake': {
						const speed = validTime(token.props.args.speed) ?? '0.5s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = useAnim ? `animation: mfm-shake ${speed} ease infinite; animation-delay: ${delay};` : '';
						break;
					}
					case 'spin': {
						const direction =
							token.props.args.alternate ? 'alternate' :
							'normal';
						const anime =
							token.props.args.left ?
								token.props.args.x ? 'mfm-spinX-reverse' :
								token.props.args.y ? 'mfm-spinY-reverse' :
								'mfm-spin-reverse' :
							token.props.args.x ? 'mfm-spinX' :
							token.props.args.y ? 'mfm-spinY' :
							'mfm-spin';
						const speed = validTime(token.props.args.speed) ?? '1.5s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = useAnim ? `animation: ${anime} ${speed} linear infinite; animation-direction: ${direction}; animation-delay: ${delay};` : '';
						break;
					}
					case 'jump': {
						const speed = validTime(token.props.args.speed) ?? '0.75s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = useAnim ? `animation: mfm-jump ${speed} linear infinite; animation-delay: ${delay};` : '';
						break;
					}
					case 'bounce': {
						const speed = validTime(token.props.args.speed) ?? '0.75s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = useAnim ? `animation: mfm-bounce ${speed} linear infinite; transform-origin: center bottom; animation-delay: ${delay};` : '';
						break;
					}
					case 'flip': {
						const transform =
							(token.props.args.h && token.props.args.v) ? 'scale(-1, -1)' :
							token.props.args.v ? 'scaleY(-1)' :
							'scaleX(-1)';
						style = `transform: ${transform};`;
						break;
					}
					case 'x2': {
						return h('span', {
							class: defaultStore.state.advancedMfm ? 'mfm-x2' : '',
						}, genEl(token.children, scale * 2));
					}
					case 'x3': {
						return h('span', {
							class: defaultStore.state.advancedMfm ? 'mfm-x3' : '',
						}, genEl(token.children, scale * 3));
					}
					case 'x4': {
						return h('span', {
							class: defaultStore.state.advancedMfm ? 'mfm-x4' : '',
						}, genEl(token.children, scale * 4));
					}
					case 'font': {
						const family =
							token.props.args.serif ? 'serif' :
							token.props.args.monospace ? 'monospace' :
							token.props.args.cursive ? 'cursive' :
							token.props.args.fantasy ? 'fantasy' :
							token.props.args.emoji ? 'emoji' :
							token.props.args.math ? 'math' :
							null;
						if (family) style = `font-family: ${family};`;
						break;
					}
					case 'blur': {
						const radius = parseFloat(token.props.args.rad ?? '6');
						return h('span', {
							class: '_mfm_blur_',
							style: `--blur-px: ${radius}px;`
						}, genEl(token.children, scale));
					}
					case 'rainbow': {
						if (!useAnim) {
							return h('span', {
								class: '_mfm_rainbow_fallback_',
							}, genEl(token.children, scale));
						}
						const speed = validTime(token.props.args.speed) ?? '1s';
						const delay = validTime(token.props.args.delay) ?? '0s';
						style = `animation: mfm-rainbow ${speed} linear infinite; animation-delay: ${delay};`;
						break;
					}
					case 'sparkle': {
						if (!useAnim) {
							return genEl(token.children, scale);
						}
						return h(MkSparkle, {}, genEl(token.children, scale));
					}
					case 'rotate': {
						const degrees = parseFloat(token.props.args.deg ?? '90');
						let rotateText = `rotate(${degrees}deg)`;
						if (!token.props.args.deg && (token.props.args.x || token.props.args.y || token.props.args.z)) {
							rotateText = '';
						}
						if (token.props.args.x) {
							const degrees = parseFloat(token.props.args.x ?? '0');
							rotateText += ` rotateX(${degrees}deg)`;
						}
						if (token.props.args.y) {
							const degrees = parseFloat(token.props.args.y ?? '0');
							rotateText += ` rotateY(${degrees}deg)`;
						}
						if (token.props.args.z) {
							const degrees = parseFloat(token.props.args.z ?? '0');
							rotateText += ` rotateZ(${degrees}deg)`;
						}
						style = `transform: ${rotateText}; transform-origin: center center;`;
						break;
					}
					case 'position': {
						if (!defaultStore.state.advancedMfm) break;
						const x = parseFloat(token.props.args.x ?? '0');
						const y = parseFloat(token.props.args.y ?? '0');
						style = `transform: translateX(${x}em) translateY(${y}em);`;
						break;
					}
					case 'scale': {
						if (!defaultStore.state.advancedMfm) {
							style = '';
							break;
						}
						const x = Math.min(parseFloat(token.props.args.x ?? '1'), 5);
						const y = Math.min(parseFloat(token.props.args.y ?? '1'), 5);
						style = `transform: scale(${x}, ${y});`;
						scale = scale * Math.max(x, y);
						break;
					}
					case 'skew': {
						if (!defaultStore.state.advancedMfm) {
							style = '';
							break;
						}
						const x = parseFloat(token.props.args.x ?? '0');
						const y = parseFloat(token.props.args.y ?? '0');
						style = `transform: skew(${x}deg, ${y}deg);`;
						break;
					}
					case 'fgg': {
						if (!defaultStore.state.advancedMfm) break;
						style = `-webkit-background-clip: text; -webkit-text-fill-color: transparent; background-image: ${toGradientText(token.props.args)};`
						break;
					}
					case 'fg': {
						let color = token.props.args.color;
						if (!checkColorHex(color)) color = 'f00';
						style = `color: #${color};`;
						break;
					}
					case 'bgg': {
						if (!defaultStore.state.advancedMfm) break;
						style = `background-image: ${toGradientText(token.props.args)};`
						break;
					}
					case 'bg': {
						let color = token.props.args.color;
						if (!checkColorHex(color)) color = 'f00';
						style = `background-color: #${color};`;
						break;
					}
					case 'clip': {
						if (!defaultStore.state.advancedMfm) break;

						let path = '';
						if (token.props.args.circle) {
							const percent = parseFloat(token.props.args.circle ?? '');
							const percentText = isNaN(percent) ? '' : `${percent}%`;
							path = `circle(${percentText})`;
						}
						else {
							const top = parseFloat(token.props.args.t ?? '0');
							const bottom = parseFloat(token.props.args.b ?? '0');
							const left = parseFloat(token.props.args.l ?? '0');
							const right = parseFloat(token.props.args.r ?? '0');
							path = `inset(${top}% ${right}% ${bottom}% ${left}%)`;
						}
						style = `clip-path: ${path};`;
						break;
					}
					case 'move': {
						const speed = validTime(token.props.args.speed) ?? '1s';
						const fromX = parseFloat(token.props.args.fromx ?? '0');
						const fromY = parseFloat(token.props.args.fromy ?? '0');
						const toX = parseFloat(token.props.args.tox ?? '0');
						const toY = parseFloat(token.props.args.toy ?? '0');
						const ease =
							token.props.args.ease ? 'ease' :
							token.props.args.easein ? 'ease-in' :
							token.props.args.easeout ? 'ease-out' :
							token.props.args.easeinout ? 'ease-in-out' :
							'linear';
						const delay = validTime(token.props.args.delay) ?? '0s';
						const direction =
							token.props.args.rev && token.props.args.once ? 'reverse' :
							token.props.args.rev ? 'alternate-reverse' :
							token.props.args.once ? 'normal' :
							'alternate';
						style = useAnim ? `--move-fromX: ${fromX}em; --move-fromY: ${fromY}em; --move-toX: ${toX}em; --move-toY: ${toY}em; animation: ${speed} ${ease} ${delay} infinite ${direction} mfm-move;` : '';
						break;
					}
					case 'mix': {
						const ch = token.children;
						if (ch.length != 2 || ch.some(c => c.type !== 'unicodeEmoji')) {
							style = null;
							break;
						}

						const emoji1 = ch[0].props.emoji;
						const emoji2 = ch[1].props.emoji;

						const mixedEmojiUrl = mixEmoji(emoji1, emoji2);
						if (!mixedEmojiUrl) {
							style = null;
							break;
						}

						return h(MkEmojiKitchen, {
							key: Math.random(),
							name: emoji1 + emoji2,
							normal: props.plain,
							url: mixedEmojiUrl
						});
					}
					case 'ruby': {
						if (token.children.length === 1) {
							const child = token.children[0];
							let text = child.type === 'text' ? child.props.text : '';
							if (!disableNyaize && shouldNyaize) {
								text = doNyaize(text);
							}
							return h('ruby', {}, [text.split(' ')[0], h('rt', text.split(' ')[1])]);
						} else {
							const rt = token.children.at(-1)!;
							let text = rt.type === 'text' ? rt.props.text : '';
							if (!disableNyaize && shouldNyaize) {
								text = doNyaize(text);
							}
							return h('ruby', {}, [...genEl(token.children.slice(0, token.children.length - 1), scale), h('rt', text.trim())]);
						}
					}
					case 'unixtime': {
						const child = token.children[0];
						const unixtime = parseInt(child.type === 'text' ? child.props.text : '');
						return h('span', {
							style: 'display: inline-block; font-size: 90%; border: solid 1px var(--divider); border-radius: 999px; padding: 4px 10px 4px 6px;',
						}, [
							h('i', {
								class: 'ti ti-clock',
								style: 'margin-right: 0.25em;',
							}),
							h(MkTime, {
								key: Math.random(),
								time: unixtime * 1000,
								mode: 'detail',
							}),
						]);
					}
				}
				if (style === undefined) {
					return h('span', {}, ['$[', token.props.name, ' ', ...genEl(token.children, scale), ']']);
				} else {
					return h('span', {
						style: 'display: inline-block; ' + style,
					}, genEl(token.children, scale));
				}
			}

			case 'small': {
				return [h('small', {
					style: 'opacity: 0.7;',
				}, genEl(token.children, scale))];
			}

			case 'center': {
				return [h('div', {
					style: 'text-align:center;',
				}, genEl(token.children, scale))];
			}

			case 'url': {
				return [h(MkUrl, {
					key: Math.random(),
					url: token.props.url,
					rel: 'nofollow noopener',
				})];
			}

			case 'link': {
				return [h(MkLink, {
					key: Math.random(),
					url: token.props.url,
					rel: 'nofollow noopener',
				}, genEl(token.children, scale, true))];
			}

			case 'mention': {
				return [h(MkMention, {
					key: Math.random(),
					host: (token.props.host == null && props.author && props.author.host != null ? props.author.host : token.props.host) ?? host,
					username: token.props.username,
				})];
			}

			case 'hashtag': {
				return [h(MkA, {
					key: Math.random(),
					to: isNote ? `/tags/${encodeURIComponent(token.props.hashtag)}` : `/user-tags/${encodeURIComponent(token.props.hashtag)}`,
					style: 'color:var(--hashtag);',
				}, `#${token.props.hashtag}`)];
			}

			case 'blockCode': {
				return [h(MkCode, {
					key: Math.random(),
					code: token.props.code,
					lang: token.props.lang,
				})];
			}

			case 'inlineCode': {
				return [h(MkCode, {
					key: Math.random(),
					code: token.props.code,
					inline: true,
				})];
			}

			case 'quote': {
				if (!props.nowrap) {
					return [h('div', {
						style: QUOTE_STYLE,
					}, genEl(token.children, scale, true))];
				} else {
					return [h('span', {
						style: QUOTE_STYLE,
					}, genEl(token.children, scale, true))];
				}
			}

			case 'emojiCode': {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (props.author?.host == null) {
					return [h(MkCustomEmoji, {
						key: Math.random(),
						name: token.props.name,
						normal: props.plain,
						host: null,
						useOriginalSize: scale >= 2.5,
						menu: props.enableEmojiMenu,
						menuReaction: props.enableEmojiMenuReaction,
					})];
				} else {
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (props.emojiUrls && (props.emojiUrls[token.props.name] == null)) {
						return [h('span', `:${token.props.name}:`)];
					} else {
						return [h(MkCustomEmoji, {
							key: Math.random(),
							name: token.props.name,
							// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
							url: props.emojiUrls ? props.emojiUrls[token.props.name] : null,
							normal: props.plain,
							host: props.author.host,
							useOriginalSize: scale >= 2.5,
						})];
					}
				}
			}

			case 'unicodeEmoji': {
				return [h(MkEmoji, {
					key: Math.random(),
					emoji: token.props.emoji,
					menu: props.enableEmojiMenu,
					menuReaction: props.enableEmojiMenuReaction,
				})];
			}

			case 'mathInline': {
				return [h('code', token.props.formula)];
			}

			case 'mathBlock': {
				return [h('code', token.props.formula)];
			}

			case 'search': {
				return [h(MkGoogle, {
					key: Math.random(),
					q: token.props.query,
				})];
			}

			case 'plain': {
				return [h('span', genEl(token.children, scale, true))];
			}

			default: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				console.error('unrecognized ast type:', (token as any).type);

				return [];
			}
		}
	}).flat(Infinity) as (VNode | string)[];

	return h('span', {
		// https://codeday.me/jp/qa/20190424/690106.html
		style: props.nowrap ? 'white-space: pre; word-wrap: normal; overflow: hidden; text-overflow: ellipsis;' : 'white-space: pre-wrap;',
	}, genEl(rootAst, props.rootScale ?? 1));
}
