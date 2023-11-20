import * as core from '@actions/core'
import * as io from '@actions/io'
import { generateMoldfile, getVdiff, installForge } from './forge'
import { createTempDirectory, isFileExist, isFileUpToDate } from './util'
import * as path from 'path'
import * as fs from 'fs'
import { getNewBranchName, newGitManager } from './git'
import { ActionInfo, getRunningActionInfo } from './actions'
import { newGitHubManager } from './github'
import { Vdiff } from './vdiff'
import { changeInfoText } from './changeInfo'

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

    core.startGroup('Get vdiff')
    const vdiffInfo = await getVdiff(vdiffBaseFilePath, tmpMoldfile)
    core.endGroup()

    await replaceWithUpdatedMoldfile(moldfilePath, tmpMoldfile)

    switch (inputs.updateStyle) {
      case 'new-pr':
        core.group('Push updated Moldfile with a new pull requesl', () =>
          pushUpdateWithNewPr(actionInfo, inputs, vdiffInfo, moldfilePath)
        )
        break
      case 'direct-commit':
        core.group('Push update Moldfile to the same branch', () =>
          pushUpdateAsDirectCommit(actionInfo, inputs)
        )
        break
    }

    console.log('Done')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function replaceWithUpdatedMoldfile(path: string, tmpMoldfile: string) {
  await io.cp(tmpMoldfile, path)
}

async function pushUpdateWithNewPr(
  actionInfo: ActionInfo,
  inputs: Inputs,
  vdiff: Vdiff,
  moldfilePath: string
) {
  const newBranchName = getNewBranchName()

  const gitManager = newGitManager()
  await gitManager.setup()
  await gitManager.switchBranch(newBranchName, true)
  await gitManager.commitChange(`Update ${inputs.moldfile} with forge-action`)
  await gitManager.pushBranch(newBranchName)

  let prTitle = `Update ${inputs.moldfile} with forge-action`
  let descriotion = `New ${inputs.moldfile} generated based on ${inputs.dockerfile}`
  if (actionInfo.pullRequestId) {
    prTitle += ` for #${actionInfo.pullRequestId}`
    descriotion += ` for #${actionInfo.pullRequestId}`
  } else if (
    !(
      actionInfo.triggerdBranch === 'main' ||
      actionInfo.triggerdBranch === ' master'
    )
  ) {
    prTitle += ` for ${actionInfo.triggerdBranch}`
    descriotion += ` for ${actionInfo.triggerdBranch}`
  }

  descriotion += '\n\n'
  descriotion += changeInfoText(vdiff)

  const githubManager = newGitHubManager(actionInfo.context, inputs.githubToken)
  const newPrId = await githubManager.createPullRequest(
    actionInfo.triggerdBranch,
    newBranchName,
    prTitle,
    descriotion
  )

  core.error(`Merge #${newPrId} to update`, {
    title: "This Moldfile isn't up-to-date",
    file: moldfilePath
  })
}

async function pushUpdateAsDirectCommit(
  actionInfo: ActionInfo,
  inputs: Inputs
) {
  const gitManager = newGitManager()
  await gitManager.setup()
  await gitManager.switchBranch(actionInfo.triggerdBranch, false)
  await gitManager.commitChange(`Update ${inputs.moldfile} with forge-action`)
  await gitManager.pushBranch(actionInfo.triggerdBranch)
}
