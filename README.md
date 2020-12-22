# 00013-fframe
javascript functional framework

# fframeフレームワークについて
ブラウザJavaScript用に変数同期、バリデーション、SPA機能を提供します
いわゆるフレームワークと異なりformやページ単位で包括せずに一つの入力項目にだけ機能を提供するといった使い方ができます

## 使い方
JQueryを使用していますのでJQueryを読み込んでから使って下さい
フレームワーク本体はソースをコピーして使って下さい（https://github.com/ikuo0/00013-fframe/blob/master/js/fframe.js）

## 変数ffが予約変数となります
例えばSPA(ルーター）の起動は次のようになります

```
ff.ApplyRouter("./source", $("body"), {"ajax-cache": false});
```

ルーターについてはこちらのソースを参考にして下さい
https://github.com/ikuo0/00013-fframe/blob/master/index.html

テキストの変数同期と自動検証は次のように書きます

```
var obj = {
    "OnChange": function(id, val) {
        var obj = this;
        print("obj[" + id + "]=" + obj[id] + "");
    }
};
ff.AddSyncroAndValid_Text(obj, "#input-text", {"value": "HOGE", "min": 3, "max": 15});
```

バリデーションについてはこちらのソースを参考にして下さい
https://github.com/ikuo0/00013-fframe/blob/master/source/input-form.js

