import * as core from '@actions/core'
import * as io from '@actions/io'
import { generateMoldfile, getVdiff, installForge } from './forge'
import { createTempDirectory, isFileExist, isFileUpToDate } from './util'
import * as path from 'path'
import * as fs from 'fs'
import { getNewBranchName, newGitManager } from './git'
import { getRunningActionInfo } from './actions'

export type UpdateStyle = 'new-pr' | 'direct-commit'

export interface Inputs {
  version: string
  workingDirectory: string
  buildContext: string
  dockerfile: string
  moldfile: string
  updateStyle: UpdateStyle
  githubToken: string
}

export async function run(inputs: Inputs): Promise<void> {
  try {
    const actionInfo = getRunningActionInfo()
    console.log('Running action information', actionInfo)

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

    console.log('Is Moldfile up-to-date:', isMoldfileUpToDate)

    if (isMoldfileUpToDate) {
      core.info('Moldfile is up-to-date')
      return
    }

    let vdiffBaseFilePath = moldfilePath
    if (!moldfileExist) {
      vdiffBaseFilePath = path.join(inputs.workingDirectory, inputs.dockerfile)
    }

    core.group('Get vdiff', () => getVdiff(vdiffBaseFilePath, tmpMoldfile))

    await replaceWithUpdatedMoldfile(moldfilePath, tmpMoldfile)

    const branchName = getNewBranchName()

    core.startGroup('Git operation')
    const gitManager = newGitManager()
    await gitManager.setup()
    await gitManager.switchBranch(branchName, true)
    await gitManager.commitChange(`Update ${inputs.moldfile} with forge-action`)
    await gitManager.pushBranch(branchName)
    core.endGroup()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function replaceWithUpdatedMoldfile(path: string, tmpMoldfile: string) {
  await io.cp(tmpMoldfile, path)
}
