# forge-action

A GitHub action to update Moldfile with [forge](https://taskfile.dev/).

## Usage

```yaml
    runs-on: ubuntu-latest
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v4
      - uses: tklab-group/forge-action@latest
        with:
          build-context: '.'
          dockerfile: 'Dockerfile'
          moldfile: 'Dockerfile.mold'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Action inputs

| Name                | Required | Default  |
| ------------------- | -------- | -------- |
| `version`           |          | `latest` |
| `working-directory` |          | `.`      |
| `build-context`     | true     |          |
| `dockerfile`        | true     |          |
| `moldfile`          | true     |          |
| `update-style`      |          | `new-pr` |
| `github-token`      | true     |          |


### `version`

The version of forge to use.

### `working-directory`

Working directory to run forge. 
The following inputs are treated as an relative path from `working-directory`.

- `build-context`
- `dockerfile`
- `moldfile`

### `build-context`

The path to build the base Dockerfile and the Moldfile.
e.g. `.`

### `dockerfile`

The base Dockerfile to generate the Moldfile.
e.g. `Dockerfile`

### `moldfile`

The target Moldfile to update.
e.g. `Dockerfile.mold`

### `update-style`

The way to update a Moldfile. Required.

#### `new-pr`

Create a new pull request with an updated Moldfile. 

If the triggered event is `pull_request`, the action creates a new pull request to the triggered branch and notifies it on the triggered pull request.

#### `direct-commit`

Create an update commit and push it on the triggered branch.


### `github-token`

Token to push a commit and create a pull request.
Set `GITHUB_TOKEN` or Personal Access Token (PAT).

e.g. `${{ secrets.GITHUB_TOKEN }}`

## Example

### Update Moldfile when the base Dockerfile changed

After pushing a change of the base Dockerfile, the action pushes a commit to update Moldfile to the branch.

```yaml
on:
  push:
    - Dockerfile

jobs:
  example:
    runs-on: ubuntu-latest
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v4
      - uses: tklab-group/forge-action@latest
        with:
          build-context: '.'
          dockerfile: 'Dockerfile'
          moldfile: 'Dockerfile.mold'
          update-style: 'direct-commit'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Scheduled Moldfile update

Like dependabot, the action creates a pull request to update Moldfile based on a schedule.

```yaml
on:
  schedule:
    - cron: '0 0 0 0 1' # Every Monday

jobs:
  example:
    runs-on: ubuntu-latest
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v4
      - uses: tklab-group/forge-action@latest
        with:
          build-context: '.'
          dockerfile: 'Dockerfile'
          moldfile: 'Dockerfile.mold'
          update-style: 'new-pr'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Debug

ローカルで動作テストをするときの実行コマンド
```bash
npm run build && act -s GITHUB_TOKEN="$(gh auth token)" --env LOCAL_DEBUG=true
```