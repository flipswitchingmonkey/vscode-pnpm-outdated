import { SemVer } from 'semver'

export type Result<T, E = Error> = { ok: true; value: T; meta?: any } | { ok: false; error: E; meta?: any }

export type PnpmListResponse = PnpmListResponseItem[]
export type PnpmListResponseSectionItem = {
  from: string
  version: string
  resolved: string
  path: string
}
export type PnpmListResponseItem = {
  dependencies?: {
    [key: string]: PnpmListResponseSectionItem
  }
  devDependencies?: {
    [key: string]: PnpmListResponseSectionItem
  }
  optionalDependencies?: {
    [key: string]: PnpmListResponseSectionItem
  }
  peerDependencies?: {
    [key: string]: PnpmListResponseSectionItem
  }
}

export type PnpmOutdatedResponse = {
  [key: string]: {
    current: string
    latest: string
    wanted: string
    isDeprecated: boolean
    dependencyType: string
  }
}

export interface DependenciesSchema {}

type PackageJsonDependencies = { [key: string]: string }
export interface PackageJsonSchema extends DependenciesSchema {
  dependencies: PackageJsonDependencies
  devDependencies: PackageJsonDependencies
  optionalDependencies: PackageJsonDependencies
  peerDependencies: PackageJsonDependencies
}

type PnpmWorkspaceDependencies = { [key: string]: string }
export interface PnpmWorkspaceSchema extends DependenciesSchema {
  packages: string[]
  catalog: PnpmWorkspaceDependencies
}

export function isNpmjsResponse(value: unknown): value is NpmjsResponse {
  const candidate = value as NpmjsResponse
  return candidate.name !== undefined && candidate._id !== undefined && Object.keys(candidate.versions).length > 0
}

export type NpmjsResponse = {
  _id: string
  _rev: string
  name: string
  'dist-tags': {
    [key: string]: string
  }
  bin: {
    [key: string]: string
  }
  engines: {
    [key: string]: string
  }
  scripts: {
    [key: string]: string
  }
  dependencies: {
    [key: string]: string
  }
  devDependencies: {
    [key: string]: string
  }
  optionalDependencies: {
    [key: string]: string
  }
  versions: {
    [key: string]: {
      _id: string
      name: string
      version: string
      description: string
      main: string
      keywords: string[]
      author?: {
        name?: string
        email?: string
        url?: string
      }
      maintainers?: {
        name?: string
        email?: string
        url?: string
      }[]
      contributors?: {
        name?: string
        email?: string
        url?: string
      }[]
      license: string
      repository: {
        type: string
        url: string
      }
      bugs: {
        url: string
      }
      homepage: string
      c8: {
        reporter: string[]
      }
      gitHead: string
      _nodeVersion: string
      _npmVersion: string
      dist: {
        integrity: string
        shasum: string
        tarball: string
        fileCount: number
        unpackedSize: number
        signatures: [
          {
            keyid: string
            sig: string
          }
        ]
      }
      _npmUser: {
        name: string
        email: string
      }
      directories: {
        [key: string]: string
      }
      _npmOperationalInternal: {
        host: string
        tmp: string
      }
      _hasShrinkwrap: boolean
    }
  }
  time: {
    [key: string]: string
    created: string
    modified: string
  }
  bugs: {
    url: string
  }
  author: {
    name: string
  }
  license: string
  homepage: string
  keywords: string[]
  repository: {
    type: string
    url: string
  }
  description: string
  contributors: [
    {
      name: string
      email: string
      url: string
    }
  ]
  maintainers: {
    name: string
    email: string
  }[]
  readme: string
  readmeFilename: string
}
