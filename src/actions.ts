import * as gh from '@actions/github'
import { Context } from '@actions/github/lib/context'

export interface ActionInfo {
  context: Context
  repositoryOwner: string
  repositoryName: string
  eventName: string
  triggerdBranch: string
  pullRequestId?: number
}

export function getRunningActionInfo(): ActionInfo {
  // https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables

  const context = gh.context

  const { owner, repo } = context.repo

  const eventName = context.eventName

  const triggerdBranch = process.env.GITHUB_REF_NAME
  if (!triggerdBranch) {
    throw Error('GITHUB_REF_NAME is unset')
  }

  const pullRequestId = context.payload.pull_request?.number

  return {
    context: context,
    repositoryOwner: owner,
    repositoryName: repo,
    eventName: eventName,
    triggerdBranch: triggerdBranch,
    pullRequestId: pullRequestId
  }
}
