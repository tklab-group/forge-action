import * as path from 'path'
import * as io from '@actions/io'
import * as fs from 'fs'
import * as ioutil from '@actions/io/lib/io-util'
import * as crypto from 'crypto'

export async function createTempDirectory(): Promise<string> {
  let tempDirectory: string = process.env['RUNNER_TEMP'] || ''

  if (tempDirectory === '') {
    throw Error('RUNNER_TEMP is empty. cannot use temporary directory')
  }

  const dst = path.join(tempDirectory, 'forge-action')
  await io.mkdirP(dst)

  return dst
}

export async function isFileExist(path: string): Promise<boolean> {
  const exist = await ioutil.exists(path)
  if (!exist) {
    return false
  }

  const isDirectory = await ioutil.isDirectory(path)
  if (isDirectory) {
    throw Error(`${path} is a directory. Expected a file or none`)
  }

  return true
}

export function isFileUpToDate(path: string, expectedContent: Buffer): boolean {
  const currentContent = fs.readFileSync(path)
  const currentHash = crypto.createHash('sha256')
  currentHash.update(currentContent)

  const expectedHash = crypto.createHash('sha256')
  expectedHash.update(expectedContent)

  return currentHash.digest().toString() === expectedHash.digest().toString()
}
