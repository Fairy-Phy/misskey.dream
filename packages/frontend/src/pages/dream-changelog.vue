<template>
<MkStickyContainer>
	<MkSpacer :contentMax="600" :marginMin="20">
		<div class="_gaps">
			<Mfm :text="text" :isNote="false"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
let text = '$[x2 ChangeLog]\n\n';

text += "$[tada.speed=0s 【 Dream 1.6.2 】]\n\
\n\
・ Add: EmojiKitchen(ソース: https://emoji.supply/kitchen)ベースのmfm関数`mix`の追加\n\
　使い方: `$[mix <絵文字1><絵文字2>]`、尚mix内部には絵文字以外の要素は入れられません。\n\
\n\
・ Fix: 現タグでタグの操作を行う際に正常に入力できない問題\n\
\n\
・ Fix: アップデートポップアップの「更新履歴(Dream)」ボタンが正常に機能していない問題\n";

text += "\n\n";

text += "$[tada.speed=0s 【 Dream 1.6.1 】]\n\
\n\
・ Add: ナビゲーションバーに「絵文字を追加」を追加\n\
\n\
・ Add: 旧タグ指定(スペース区切り)を復活\n\
\n\
・ Add: 絵文字追加個数が10個未満のユーザーが追加する際に警告を表示するように\n\
\n\
・ Change: 絵文字追加時にライセンスを指定しなくてもAcctを自動挿入されるように\n\
\n\
・ Add: MFM関数`skew`の追加\n\
　・`$[skew.x=deg,y=deg ]`\n\
\n\
・ Remove: AiScriptのMk:apiの使用回数制限を削除\n\
\n\
・ Fix: relationalの場合にリアクションができない問題\n";

text += "\n\n";

text += "$[tada.speed=0s 【 Dream 1.6.0 】]\n\
\n\
・ Add: ChangeLogの追加\n\
\n\
・ Change: 初期ロード時のアニメーションを変更\n\
\n\
・ Add: MFM関数の追加\n\
　・`$[fgg.colorN=Hex,stepN=% ]`: 文字グラデーション\n\
　・`$[bgg.colorN=Hex,stepN=% ]`: 背景グラデーション\n\
　・`$[clip.t=%,b=%,l=%,r=%,circle(=%) ]`: 切り取り\n\
　・`$[move.fromx=em,fromy=em,tox=em,toy=em,speed=time,delay=time,rev,once,ease,easein,easeout,easeinout ]`: 移動アニメーション\n\
\n\
・ Change: 一部既存MFM関数の変更\n\
　・`$[rotate.x=deg,y=deg,z=deg ]`: xyzでの変更に対応\n\
　・`$[blur.rad=px ]`: blurの強度の変更に対応\n\
\n\
・ Fix: MFM色のHexがRGBAの一部しか対応していない問題\n\
\n\
・ Fix: 時間判定が一部おかしい問題\n\
\n\
・ Change: 絵文字をインポートする際に必ずライセンスを入力された状態でインポートする\n\
　※これによって誰でもインポートできるように変更されました\n\
\n\
・ Fix: サードパーティで一部ノートが正常に処理されない問題";
</script>
