import { Inputs, run } from './main'
import * as core from '@actions/core'

const inputs: Inputs = {
  version: core.getInput('version'),
  workingDirectory: core.getInput('working-directory'),
  buildContext: core.getInput('build-context'),
  dockerfile: core.getInput('dockerfile'),
  moldfile: core.getInput('moldfile'),
  githubToken: core.getInput('github-token')
}

run(inputs)
