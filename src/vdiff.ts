export interface Vdiff {
  buildStages: BuildStage[]
}

export interface BuildStage {
  baseImage: BaseImage
  packages: PackageInfo[]
}

export interface BaseImage {
  name: string
  moldfile1: string
  moldfile2: string
}

export interface PackageInfo {
  packageManager: string
  name: string
  moldfile1: string
  moldfile2: string
}
