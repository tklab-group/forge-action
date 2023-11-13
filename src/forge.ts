import * as exec from '@actions/exec'
import * as core from '@actions/core'
import * as fs from 'fs'

export async function installForge(version: string, githubToken: string) {
  try {
    let output = await exec.getExecOutput('which go')
    core.debug('stdout of `which go`:' + output.stdout)
  } catch (error) {
    if (error instanceof Error) console.log(error.message)
    throw new Error('Setup Go environment before using this action')
  }

  // TODO: Remove and improve after the repository becoming public
  await installPrivateForge(version, githubToken)

  await exec.exec('forge', ['--version'])
}

async function installPrivateForge(version: string, githubToken: string) {
  await exec.exec(
    `git config --global url."https://${githubToken}:x-oauth-basic@github.com/".insteadOf "https://github.com/"`
  )
  await exec.exec('go', ['env', '-w', 'GOPRIVATE=github.com/tklab-group'])

  await exec.exec('go', ['install', `github.com/tklab-group/forge@${version}`])
}

export async function generateMoldfile(
  workingDir: string,
  buildContext: string,
  dockerfile: string,
  moldfile: string
) {
  await exec.exec(
    'forge',
    ['mold', buildContext, '--dockerfile', dockerfile, '--moldfile', moldfile],
    {
      cwd: workingDir
    }
  )

  // debug
  const generatedContent = fs.readFileSync(moldfile)

  core.debug(`generated Moldfile content:\n${generatedContent.toString()}`)
}
