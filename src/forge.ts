import * as exec from '@actions/exec'
import * as core from '@actions/core'
import * as fs from 'fs'
import { Vdiff } from './vdiff'
import { createTempDirectory } from './util'
import * as path from 'path'
import * as semver from 'semver'

const requiredForgeVersion = '>=v0.0.4'

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

  await validateInstalledVersion()
}

async function installPrivateForge(version: string, githubToken: string) {
  await exec.exec(
    `git config --global url."https://${githubToken}:x-oauth-basic@github.com/".insteadOf "https://github.com/"`
  )
  await exec.exec('go', ['env', '-w', 'GOPRIVATE=github.com/tklab-group'])

  await exec.exec('go', ['install', `github.com/tklab-group/forge@${version}`])
}

async function validateInstalledVersion() {
  const versionOutput = await exec.getExecOutput('forge', ['--version'])
  const match = versionOutput.stdout.match(/forge version (.+)/)
  if (!match || match.length !== 2) {
    throw Error('`forge --version` output is unexpected format')
  }

  const installedVersion = match[1]
  console.log('installed forge version', installedVersion)

  if (!semver.satisfies(installedVersion, requiredForgeVersion)) {
    throw Error(
      `This action required forge ${requiredForgeVersion} but installed ${installedVersion}`
    )
  }
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

export async function getVdiff(
  moldfile1: string,
  moldfile2: string
): Promise<Vdiff> {
  const tempDir = await createTempDirectory()
  const outputFile = path.join(tempDir, 'vdiff.json')

  await exec.exec('forge', [
    'vdiff',
    '--output',
    outputFile,
    moldfile1,
    moldfile2
  ])

  const content = fs.readFileSync(outputFile)
  const vdiff: Vdiff = JSON.parse(content.toString())

  core.debug(JSON.stringify(vdiff))

  return vdiff
}
