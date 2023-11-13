import * as path from 'path'
import * as io from '@actions/io'

export async function createTempDirectory(): Promise<string> {
  let tempDirectory: string = process.env['RUNNER_TEMP'] || ''

  if (tempDirectory === '') {
    throw Error('RUNNER_TEMP is empty. cannot use temporary directory')
  }

  const dst = path.join(tempDirectory, 'forge-action')
  await io.mkdirP(dst)

  return dst
}
