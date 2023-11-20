import { BaseImage, BuildStage, PackageInfo, Vdiff } from './vdiff'

export function changeInfoText(vdiffInfo: Vdiff): string {
  const needBuildStageHeader = vdiffInfo.buildStages.length > 1
  const text = vdiffInfo.buildStages
    .map((bs, index) => changeInfoBuildStage(bs, index, needBuildStageHeader))
    .join('\n')

  return text
}

function changeInfoBuildStage(
  buildStage: BuildStage,
  index: number,
  setHeader: boolean
): string {
  const elements: string[] = []

  if (setHeader) {
    let header = `## Build Stage ${index}`
    if (buildStage.stageName !== '') {
      header += `: ${buildStage.stageName}`
    }
    elements.push(header)
  }

  const baseImageText = changeInfoBaseImage(buildStage.baseImage)
  elements.push(baseImageText)

  const packagesText = changeInfoPackages(buildStage.packages)
  elements.push(packagesText)

  return elements.join('\n')
}

function changeInfoBaseImage(baseImage: BaseImage): string {
  // TODO
  return ''
}

function changeInfoPackages(packages: PackageInfo[]): string {
  const updatedPackages = packages.filter(p => p.moldfile1 !== p.moldfile2)
  // TODO: Genarete markdown table
  return ''
}
