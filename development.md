# Development

## Debug

[nektos/act: Run your GitHub Actions locally 🚀](https://github.com/nektos/act)を使用

ローカルで動作テストをするときの実行コマンド
```bash
npm run build && act -s GITHUB_TOKEN="$(gh auth token)" --env LOCAL_DEBUG=true -j 'debug'
```