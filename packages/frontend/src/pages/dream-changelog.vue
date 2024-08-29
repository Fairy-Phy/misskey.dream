<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="900" :marginMin="20">
		<div class="_gaps">
			<MkFolder
				v-for="changelog in changelogs"
				:key="changelog.version"
				:defaultOpen="changelog.isDefault"
			>
				<template #label>{{ changelog.version }}</template>

				<div class="_gaps_m">
					<Mfm
						v-for="text, i in changelog.context"
						:key="changelog.version + i"
						:text="text"
						:isNote="false"
					/>
				</div>
			</MkFolder>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import MkFolder from '@/components/MkFolder.vue';

definePageMetadata(() => ({
	title: 'dream 変更履歴',
	icon: 'ti ti-logs',
}));

const headerActions = computed(() => []);
const headerTabs = computed(() => []);

const changelogs = [
	{
		isDefault: true,
		version: 'Dream 1.12.0',
		context: [
			'・ Update: 本家misskeyバージョンに追従し、2024.8.0にアップデートしました。',
			'・ Add: 絵文字の自作フラグの追加',
			'　・ この変更により従来の「ライセンス」という表記から「使用許諾と根拠」に変更になりました',
			'　・ この変更に伴い絵文字ガイドラインが更新されます',
			'・ Add: エンドポイント get-emoji-logs の追加',
			'・ Add: 横長ロゴの追加と表示対応',
			'　・ これにより以下が追加されています。',
			'　・ Add: メタデータに「longIconUrl」を追加',
			'　・ Add: long-logo.pngからデフォルトの横長ロゴを取得できように',
			'・ Change: 流れ星ローディングの太さを変更',
			'・ Change: 初期ロード時に横長ロゴのアニメーションを変更',
			'・ Change: 初期ロード時に回転ではなく星型ロードアイコンを使用するように変更',
			'・ Fix: 独自追加したエンドポイントのkindが設定されていない問題の修正',
			'　・ これにより権限「write:community-role」と「read:admin:emoji-log」が追加されました',
			'-----ここから下は直接的に動作に関係のないもの-----',
			'・ Fix: プロフィールにて適切な処理を踏んでいない問題の修正',
			'・ Fix: テストにコミュニティーロールを含めるように',
			'・ Fix: dockleのイメージ名を変更',
			'・ Fix: frontend及びbackendのtype error及びlintエラーの解消',
			'・ Update: misskey-jsのapi更新',
			'・ Fix: 非推奨i18n処理の変更',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.11.0',
		context: [
			'・ Update: 本家misskeyバージョンに追従し、2024.5.0にアップデートしました。',
			'・ Update: システムの使用ソフトウェアを変更しました。',
			'・ Add: アバターデコレーションに所有者・ソース元を明示できるようになりました。',
			'　・アップデート後の既存アバターデコレーションについては随時書き換え予定です。',
			'・ Add: タイムライン上部のバー情報を変更できるようになりました',
			'　・「設定」->「タイムラインバー」から変更できます。',
			'・ Add: ロール権限「絵文字インポートの許可」を追加',
			'・ Fix: タッチ系端末で絵文字ログが開けない問題の修正',
			'・ Fix: 絵文字マネージャーで正常にスクロールできない問題',
			'・ Fix: ロール付与された際にロール削除されると通知が見れなくなる問題の修正',
			'・ Fix: チャート取得処理が正常に動作していない問題の修正',
			'・ Revert: 今までのキューシステムから本家misskeyのキューシステムに戻しました',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.10.0',
		context: [
			'・ Add: Playでカスタム実績を発行できるようになりました',
			'　・これに伴い、新たな関数`Mk:claimAchieve(achieveId)`が追加されました',
			'・ Fix: アバターデコレーションの1番レイヤーのみ数字表記がない問題',
			'・ Fix: 絵文字追加ダイアログのタグ指定をする際にフォーカスが切れる問題',
			'・ Fix: 絵文字ピッカーが重複して表示されてしまっている問題',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.9.1',
		context: [
			'・ Add: 独自機能項目にはできる限りバッチをつけるように',
			'・ Add: ライセンスが指定されていないときに著作者かどうかを確認するように',
			'・ Add: ノートを猫モードにしていてもnayizeさせないような設定項目',
			'・ Outdated: 独自機能として導入したアバターデコレーションのX座標、Y座標は本家実装に伴い削除予定になりました。',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.9.0',
		context: [
			'・ Add: アバターデコレーションを移動、拡大縮小、不透明度を選択できるように',
			'・ Undo: アバターデコレーション画像指定を以前のurl指定でもできるようにしました',
			'・ Fix: Safari使用時のローディングアニメーションが正常に動作していない問題',
			'・ Fix: MFM`$[spin.left ]`を使用しているときにsafariでおかしくなる問題',
			'・ Fix: アバターデコレーションが名前の上に来てしまう問題',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.8.0',
		context: [
			'・ Add: プラグイン及びスクリプトデータをデバイス間で同期できるように',
			'　・これは`Mk:load`と`Mk:save`に新しく`option?: { toAccount?: bool }`が付き、`true`にするとアカウントレベルで保存されます。',
			'　・既存プラグインはローカルに保存されています。',
			'・ Add: アバターデコレーションを複数でレイヤー選択できるように',
			'　※レイヤーは最大5つまで追加できます。',
			'・ Add: プロフィール欄のロール一覧が折り畳めるように',
			'　※ロール数が一定数以上になると折りたたまれた状態で表示されます。',
			'・ Change: アバターデコレーションの画像指定をurlからドライブ指定に変更',
			'・ Fix: Jdenticonの初期アイコンが正常に表示されない問題',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.7.5',
		context: [
			'・ Fix: 自身のプロフィールのノートを取得する時に公開範囲がフォロワーのノートが表示されない',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.7.4',
		context: [
			'・ Fix: ノートを遡ろうとした際にフリーズする問題',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.7.3',
		context: [
			'・ Restore: 2023.10.0-beta1で実装された編集機能は本家では削除されましたがこちらでは残すこととなりました',
			'・ Add: プロフィール上の過去ノートを遡れるように',
			'・ Fix: 実質的なリレーショナル投稿を変更することでリレーショナルとして投稿されるのを防ぐように',
			'・ Fix: 小さいローディング時に別のローディングを入れるように',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.7.2',
		context: [
			'・ Update: misskey 2023.9.3へ更新',
			'・ Update: emojiKitchen定義ファイルの更新',
			'・ Remove: 一部サーバーステータスの削除',
			'・ Fix: `$[mix ]`がうまく機能しない問題',
			'・ Fix: 新規登録ができない問題',
			'・ Fix: 管理ページがエラーになる問題',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.7.1',
		context: [
			'・ Fix: 配送されない問題',
			'・ Fix: 管理ページがエラーになる問題',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.7.0',
		context: [
			'・ Update: misskeyバージョン2023.9.1へ更新',
			'・ Add: コミュニティーロールの追加',
			'　※この追加に伴い今まで追加されてきたロールはコミュニティーロールに順次変更されます。今まで追加されたロールは厳密には誰でも編集できるようになりますが、殆どの場合編集去れることは無いためもし保護を受けたい場合はモデレーターに連絡ください。',
			'・ Add: ナビゲーションバーに「ロールの管理」を追加',
			'　「ロールの管理」ではコミュニティーロールの作成や公開されているコミュニティーロールをつけたりできます。',
			'・ Add: ドライブ容量増加 & コミュニティーロール追加権限ポリシーの追加',
			'・ Add: ドライブフォルダー削除時に警告文を出すように',
			'・ Add: デフォルトナビゲーション配置に「絵文字の追加」と「ロールの管理」を追加',
			'・ Add: 「見つける」→「ロール」を各ロールグループでフォルダー分けされるように',
			'・ Add: プロフィール欄の通常ロールとコミュニティーロールで仕切られるように',
			'・ Change: 全般ローディングアニメーションの変更',
			'・ Change: 2023.9.xアップデート時にリアクションの幅が固定幅になっている状態をもとに戻す',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.6.2',
		context: [
			'・ Add: EmojiKitchen(ソース: https://emoji.supply/kitchen)ベースのmfm関数`mix`の追加',
			'　使い方: `$[mix <絵文字1><絵文字2>]`、尚mix内部には絵文字以外の要素は入れられません。',
			'・ Fix: 現タグでタグの操作を行う際に正常に入力できない問題',
			'・ Fix: アップデートポップアップの「更新履歴(Dream)」ボタンが正常に機能していない問題',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.6.1',
		context: [
			'・ Add: ナビゲーションバーに「絵文字を追加」を追加',
			'・ Add: 旧タグ指定(スペース区切り)を復活',
			'・ Add: 絵文字追加個数が10個未満のユーザーが追加する際に警告を表示するように',
			'・ Change: 絵文字追加時にライセンスを指定しなくてもAcctを自動挿入されるように',
			'・ Add: MFM関数`skew`の追加',
			'　・`$[skew.x=deg,y=deg ]`',
			'・ Remove: AiScriptのMk:apiの使用回数制限を削除',
			'・ Fix: relationalの場合にリアクションができない問題',
		],
	},
	{
		isDefault: false,
		version: 'Dream 1.6.0',
		context: [
			'・ Add: ChangeLogの追加',
			'・ Change: 初期ロード時のアニメーションを変更',
			'・ Add: MFM関数の追加',
			'　・`$[fgg.colorN=Hex,stepN=% ]`: 文字グラデーション',
			'　・`$[bgg.colorN=Hex,stepN=% ]`: 背景グラデーション',
			'　・`$[clip.t=%,b=%,l=%,r=%,circle(=%) ]`: 切り取り',
			'　・`$[move.fromx=em,fromy=em,tox=em,toy=em,speed=time,delay=time,rev,once,ease,easein,easeout,easeinout ]`: 移動アニメーション',
			'・ Change: 一部既存MFM関数の変更',
			'　・`$[rotate.x=deg,y=deg,z=deg ]`: xyzでの変更に対応',
			'　・`$[blur.rad=px ]`: blurの強度の変更に対応',
			'・ Fix: MFM色のHexがRGBAの一部しか対応していない問題',
			'・ Fix: 時間判定が一部おかしい問題',
			'・ Change: 絵文字をインポートする際に必ずライセンスを入力された状態でインポートする',
			'　※これによって誰でもインポートできるように変更されました',
			'・ Fix: サードパーティで一部ノートが正常に処理されない問題',
		],
	},
];
</script>
