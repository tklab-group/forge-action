import * as gh from '@actions/github'
import { Context } from '@actions/github/lib/context'
import { isLocalDebug } from './util'

export interface GitHubManagerInterface {
  createPullRequest(
    baseBranch: string,
    headBranch: string,
    title: string,
    description: string
  ): Promise<number>
  commentOnPullRequest(pullRequestId: number, comment: string): Promise<void>
}

export function newGitHubManager(context: Context, githubToken: string) {
  if (isLocalDebug()) {
    console.log('Use GitHubMockManager')
    return new GitHubMockManager()
  } else {
    return new GitHubManager(context, githubToken)
  }
}

class GitHubManager implements GitHubManagerInterface {
  githubToken: string
  context: Context

  constructor(context: Context, githubToken: string) {
    this.githubToken = githubToken
    this.context = context
  }

  async createPullRequest(
    baseBranch: string,
    headBranch: string,
    title: string,
    description: string
  ): Promise<number> {
    const octkit = gh.getOctokit(this.githubToken)

    const { data } = await octkit.rest.pulls.create({
      ...this.context.repo,
      base: baseBranch,
      head: headBranch,
      title: title,
      body: description
    })

    return data.number
  }

  async commentOnPullRequest(
    pullRequestId: number,
    comment: string
  ): Promise<void> {
    const octkit = gh.getOctokit(this.githubToken)

    await octkit.rest.issues.createComment({
      ...this.context.repo,
      issue_number: pullRequestId,
      body: comment
    })
  }
}

class GitHubMockManager implements GitHubManagerInterface {
  async createPullRequest(
    baseBranch: string,
    headBranch: string,
    title: string,
    description: string
  ): Promise<number> {
    console.log('Skip to create a pull request')
    console.log(`base: ${baseBranch} <- head: ${headBranch}`)
    console.log(`title: ${title}`)
    console.log(`description: ${description}`)

    return 0
  }

  async commentOnPullRequest(
    pullRequestId: number,
    comment: string
  ): Promise<void> {
    console.log('Skip to comment on a pull request')
    console.log(`target: ${pullRequestId}`)
    console.log(`comment: ${comment}`)
  }
}
