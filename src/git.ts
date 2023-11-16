import * as exec from '@actions/exec'
import { currentUnixTimestamp } from './util'

export async function gitUserSetup() {
  // Use "github-action[bot]" user to commit
  // https://github.com/orgs/community/discussions/26560
  exec.exec('git', ['config', 'user.name', '"github-actions[bot]"'])
  exec.exec('git', [
    'config',
    'user.email',
    '41898282+github-actions[bot]@users.noreply.github.com'
  ])
}

export function getNewBranchName(): string {
  return `forge-action/${currentUnixTimestamp()}`
}

export async function switchBranch(branchName: string, needCreate: boolean) {
  let args: string[]
  if (needCreate) {
    args = ['switch', '-c', branchName]
  } else {
    args = ['switch', branchName]
  }

  exec.exec('git', args)

  console.log('Switch branch to', branchName)
}
