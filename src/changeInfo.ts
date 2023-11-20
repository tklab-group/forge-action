import { toMarkdownTable } from './util'
import { BaseImage, BuildStage, PackageInfo, Vdiff } from './vdiff'

export function changeInfoText(vdiffInfo: Vdiff): string {
  const needBuildStageHeader = vdiffInfo.buildStages.length > 1
  const text = vdiffInfo.buildStages
    .map((bs, index) => changeInfoBuildStage(bs, index, needBuildStageHeader))
    .join('\n\n\n')

  return text
}

function changeInfoBuildStage(
  buildStage: BuildStage,
  index: number,
  setHeader: boolean
): string {
  const elements: string[] = []

  if (setHeader) {
    let header = `## Build Stage ${index + 1}`
    if (buildStage.stageName !== '') {
      header += ` (${buildStage.stageName})`
    }
    elements.push(header)
  }

  const baseImageText = changeInfoBaseImage(buildStage.baseImage)
  elements.push(baseImageText)

  const packagesText = changeInfoPackages(buildStage.packages)
  elements.push(packagesText)

  return elements.join('\n\n')
}

function changeInfoBaseImage(baseImage: BaseImage): string {
  if (baseImage.moldfile1 === baseImage.moldfile2) {
    return 'No base image update'
  }

  const elements: string[] = []

  const header = '### Base Image Update'
  elements.push(header)

  const trimLongSha = (s: string) =>
    s.startsWith('@sha') ? `${s.substring(0, 20)}...` : s

  const before = trimLongSha(baseImage.moldfile1)
  const after = trimLongSha(baseImage.moldfile2)

  const table = toMarkdownTable(
    ['Image', 'Update'],
    [[baseImage.name, `\`${before}\` to \`${after}\``]]
  )
  elements.push(table)

  return elements.join('\n')
}

function changeInfoPackages(packages: PackageInfo[]): string {
  const elements: string[] = []

  const header = '### Package Updates'
  elements.push(header)

  const updatedPackages = packages.filter(p => p.moldfile1 !== p.moldfile2)

  if (updatedPackages.length === 0) {
    return 'No package update'
  }

  const top = ['Package', 'PackageManager', 'Update']

  const packageTableElements = updatedPackages.map(p => {
    const baseVersion = p.moldfile1 !== '' ? p.moldfile1 : '-'
    return [
      p.name,
      p.packageManager,
      `\`${baseVersion}\` to \`${p.moldfile2}\``
    ]
  })

  const table = toMarkdownTable(top, packageTableElements)
  elements.push(table)

  return elements.join('\n')
}
