import { exit } from 'process'
import { Inputs, UpdateStyle, run } from './main'
import * as core from '@actions/core'

const updateStyleStr = core.getInput('update-style')
let updateStyle: UpdateStyle

switch (updateStyleStr) {
  case 'new-pr':
  case 'direct-commit':
    updateStyle = updateStyleStr
    break
  default:
    core.error(
      `"update-style" must be "new-pr" or "direct-commit" but "${updateStyleStr}"`
    )
    exit(1)
}

const inputs: Inputs = {
  version: core.getInput('version'),
  workingDirectory: core.getInput('working-directory'),
  buildContext: core.getInput('build-context'),
  dockerfile: core.getInput('dockerfile'),
  moldfile: core.getInput('moldfile'),
  updateStyle: updateStyle,
  githubToken: core.getInput('github-token')
}

run(inputs)
