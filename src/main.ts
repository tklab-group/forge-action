import * as core from '@actions/core'
import { installForge } from './forge'

export interface Inputs {
  version: string
  workingDirectory: string
  buildContext: string
  dockerfile: string
  moldfile: string
  githubToken: string
}

export async function run(inputs: Inputs): Promise<void> {
  try {
    await core.group('Install forge', () =>
      installForge(inputs.version, inputs.githubToken)
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
