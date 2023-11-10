import * as core from '@actions/core'
import * as exec from '@actions/exec'

export async function run(): Promise<void> {
  try {
    await installForge(core.getInput('version'))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function installForge(version: string) {
  try {
    let output = await exec.getExecOutput('which go')
    core.debug('stdout of `which go`:' + output.stdout)
  } catch (error) {
    if (error instanceof Error) console.log(error.message)
    throw new Error('Setup Go environment before using this action')
  }

  // TODO: install forge
}
