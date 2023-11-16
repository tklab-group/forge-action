import * as core from '@actions/core'
import { generateMoldfile, getVdiff, installForge } from './forge'
import { createTempDirectory, isFileExist, isFileUpToDate } from './util'
import * as path from 'path'
import * as fs from 'fs'
import { gitUserSetup } from './git'

export interface Inputs {
  version: string
  workingDirectory: string
  buildContext: string
  dockerfile: string
  moldfile: string
  updateStyle: string
  githubToken: string
}

export async function run(inputs: Inputs): Promise<void> {
  try {
    await core.group('Install forge', () =>
      installForge(inputs.version, inputs.githubToken)
    )

    const tmpDir = await createTempDirectory()
    const tmpMoldfile = path.join(tmpDir, 'Dockerfile.mold')

    await core.group('Generate Moldfile', () =>
      generateMoldfile(
        inputs.workingDirectory,
        inputs.buildContext,
        inputs.dockerfile,
        tmpMoldfile
      )
    )

    let isMoldfileUpToDate = false

    const moldfilePath = path.join(inputs.workingDirectory, inputs.moldfile)
    const moldfileExist = await isFileExist(moldfilePath)

    if (moldfileExist) {
      const generatedMoldfileContent = fs.readFileSync(tmpMoldfile)
      isMoldfileUpToDate = isFileUpToDate(
        moldfilePath,
        generatedMoldfileContent
      )
    }

    if (isMoldfileUpToDate) {
      core.info('Moldfile is up-to-date')
      return
    }

    console.log('Is Moldfile up-to-date:', isMoldfileUpToDate)

    let vdiffBaseFilePath = moldfilePath
    if (!moldfileExist) {
      vdiffBaseFilePath = path.join(inputs.workingDirectory, inputs.dockerfile)
    }

    core.group('Get vdiff', () => getVdiff(vdiffBaseFilePath, tmpMoldfile))

    core.group('Setup git', () => gitUserSetup())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
