export interface ActionInfo {
  repository: string // e.g. 'octcat/Hello-World'
  eventName?: string
  triggerdBranch: string
  pullRequestId?: string
}

export function getRunningActionInfo(): ActionInfo {
  // https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables

  const repository = process.env.GITHUB_REPOSITORY
  if (!repository) {
    throw Error('GITHUB_REPOSITOY is unset')
  }

  const eventName = process.env.GTIHUB_EVENT_NAME

  const triggerdBranch = process.env.GITHUB_REF_NAME
  if (!triggerdBranch) {
    throw Error('GITHUB_REF_NAME is unset')
  }

  let pullRequestId: string | undefined

  const githubRef = process.env.GTIHUB_REF
  if (githubRef) {
    if (githubRef.startsWith('refs/pull/')) {
      pullRequestId = githubRef.match(/refs\/pull\/(.+)\/merge/)?.at(1)
    }
  }

  return {
    repository: repository,
    eventName: eventName,
    triggerdBranch: triggerdBranch,
    pullRequestId: pullRequestId
  }
}
