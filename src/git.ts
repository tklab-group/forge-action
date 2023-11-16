import * as exec from '@actions/exec'
import { currentUnixTimestamp, isLocalDebug } from './util'

export interface GitManagerInterface {
  setup(): Promise<void>
  switchBranch(branchName: string, needCreate: boolean): Promise<void>
  commitChange(message: string): Promise<void>
  pushBranch(branchName: string): Promise<void>
}

export function newGitManager(): GitManagerInterface {
  if (isLocalDebug()) {
    console.log('Use GitMockManager')
    return new GitMockManager()
  } else {
    return new GitManager()
  }
}

class GitManager implements GitManagerInterface {
  async setup(): Promise<void> {
    await gitUserSetup()
  }

  async switchBranch(branchName: string, needCreate: boolean): Promise<void> {
    await gitSwitchBranch(branchName, needCreate)
  }

  async commitChange(message: string): Promise<void> {
    await gitCommitChange(message)
  }

  async pushBranch(branchName: string): Promise<void> {
    await gitPushBranch(branchName)
  }
}

// GitMockManager mocks methods to effect existing repositories.
class GitMockManager implements GitManagerInterface {
  async setup(): Promise<void> {
    await gitUserSetup()
  }

  async switchBranch(branchName: string, needCreate: boolean): Promise<void> {
    await gitSwitchBranch(branchName, needCreate)
  }

  async commitChange(message: string): Promise<void> {
    await gitCommitChange(message)
  }

  async pushBranch(branchName: string): Promise<void> {
    console.log('Skip pushing branch', branchName)
  }
}

async function gitUserSetup() {
  // Use "github-action[bot]" user to commit
  // https://github.com/orgs/community/discussions/26560
  await exec.exec('git', ['config', 'user.name', '"github-actions[bot]"'])
  await exec.exec('git', [
    'config',
    'user.email',
    '41898282+github-actions[bot]@users.noreply.github.com'
  ])
}

async function gitSwitchBranch(branchName: string, needCreate: boolean) {
  let args: string[]
  if (needCreate) {
    args = ['switch', '-c', branchName]
  } else {
    args = ['switch', branchName]
  }

  await exec.exec('git', args)

  console.log('Switch branch to', branchName)
}

async function gitCommitChange(message: string) {
  await exec.exec('git', ['add', '.'])
  await exec.exec('git', ['commit', '-m', message])
}

async function gitPushBranch(branchName: string) {
  await exec.exec('git', ['push', 'origin', branchName])
}

export function getNewBranchName(): string {
  return `forge-action/${currentUnixTimestamp()}`
}
