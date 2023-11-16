import * as exec from '@actions/exec'

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
