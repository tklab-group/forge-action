import * as exec from '@actions/exec'
import * as core from '@actions/core'
import * as io from '@actions/io'
import * as fs from 'fs'
import { Vdiff } from './vdiff'
import { createTempDirectory } from './util'
import * as path from 'path'
import * as semver from 'semver'

const requiredForgeVersion = '>=v1.0.0'

export async function installForge(version: string) {
  try {
    const goExecPath = await io.which('go', true)
    core.debug('stdout of `which go`:' + goExecPath)
  } catch (error) {
    if (error instanceof Error) console.log(error.message)
    throw new Error('Setup Go environment before using this action')
  }

  await exec.exec('go', ['install', `github.com/tklab-group/forge@${version}`])

  await validateInstalledVersion()
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
