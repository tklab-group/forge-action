# Development

## Debug

[nektos/act: Run your GitHub Actions locally 🚀](https://github.com/nektos/act)を使用

ローカルで動作テストをするときの実行コマンド
```bash
npm run build && act -s GITHUB_TOKEN="$(gh auth token)" --env LOCAL_DEBUG=true -j 'debug'
```

## Build Artifacts

GitHub Actionsとしての使用時に参照されるのは`dist/`以下のファイル。これは`npm run build`を実行すると更新される。

実行し忘れによる`src/`以下のコードと`dist/`以下の対応が取れなくなることを防止するために、mainブランチに更新があると自動で`npm run build`を実行し、`dist/`以下に差分があれば自動でコミットするようにしてある。

関連ファイル:
- `.github/workflows/build.yaml`


## Release

1. gitタグを`v0.0.0`形式(e.g. `v1.2.3`)で作成してpush
2. [New release · tklab-group/forge-action](https://github.com/tklab-group/forge-action/releases/new)から作成したgitタグを選択し、新規リリースを作成する

`README.md`の使用例にバージョン指定の記述があるので、それも最新のリリースバージョンに更新する。