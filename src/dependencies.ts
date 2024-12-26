import vscode from 'vscode'
import { parse, SemVer, minVersion, Range } from 'semver'
import { spawnSync } from 'child_process'
import { ERRORS } from './constants'
import {
  PnpmListResponse,
  PnpmOutdatedResponse,
  Result,
  PnpmListResponseItem,
  PnpmListResponseSectionItem,
} from './types'
import { pnpmOutdated } from './utils/pnpmcli'
import { fetchPackageInfo } from './utils/npmjs'

export class Dependency {
  public current: SemVer | null = null
  public range: Range | null = null
  public rangeOperator: string = ''
  public latest: SemVer | null = null
  public wanted: SemVer | null = null
  public isDeprecated: boolean = false
  public hint: string = ''

  constructor(public name: string, public currentString: string, public dependencyType: string, public cwd: string) {
    if (!(currentString === 'catalog:')) {
      try {
        this.current = minVersion(currentString)
        this.range = new Range(currentString)
        if (this.range) {
          this.rangeOperator = this.range.raw.match(/^[~<>=^\-|\s]+/g)?.[0] ?? ''
        }
      } catch {}
    }
    this.hint = this.current ? this.current.toString() : 'could not parse version'
  }

  get key() {
    return `${this.dependencyType}::${this.name}`
  }

  get value() {
    return `${this.currentString}`
  }

  // updateHash() {
  //   this.hash = sha1.update(this.key).digest('base64')
  // }

  checkOutdated() {
    const result = pnpmOutdated(this.cwd, this.name)
    if (result.ok && result.value) {
      this.updateFromPnpmOutdatedResponse(result.value)
    }
  }

  async fetchRegistryInfo() {
    const result = await fetchPackageInfo(this.name)
    if (result.ok) {
      const pkg = result.value
      console.log(result.value)
      const versions = Object.keys(pkg.versions)
      this.latest = parse(versions[versions.length - 1])
      if ('latest' in pkg['dist-tags']) {
        this.latest = parse(pkg['dist-tags']['latest']) ?? this.latest
      }
    }
  }

  // checkOutdated(): Result<PnpmOutdatedResponse | null> {
  //   const pnpmOutput = spawnSync('pnpm', ['outdated', this.name, '--format', 'json'], { cwd: this.cwd })
  //   console.log(`checkOutdated ${this.name}`)
  //   if (pnpmOutput.error) {
  //     vscode.window.showErrorMessage(pnpmOutput.error.message)
  //     return {
  //       ok: false,
  //       error: pnpmOutput.error,
  //     }
  //   }
  //   const stdout = pnpmOutput.stdout.toString()
  //   console.log(stdout)
  //   if (stdout.startsWith('ERR_PNPM_OUTDATED_NO_LOCKFILE')) {
  //     return { ok: false, error: new Error(stdout), meta: { code: ERRORS.ERR_PNPM_OUTDATED_NO_LOCKFILE } }
  //   }
  //   try {
  //     const json = JSON.parse(stdout) as PnpmOutdatedResponse
  //     if (json && Object.values(json).length > 0 && Object.values(json)[0].current) {
  //       this.updateFromPnpmOutdatedResponse(json)
  //       return {
  //         ok: true,
  //         value: json,
  //       }
  //     }
  //   } catch (error) {
  //     return { ok: false, error: error as Error }
  //   }
  //   return {
  //     ok: true,
  //     value: null,
  //   }
  // }

  updateFromPnpmListResponse(json: PnpmListResponse) {
    json.map((e) => {
      const sectionKey = this.dependencyType as keyof PnpmListResponseItem['dependencies']
      if (sectionKey in e) {
        if (this.name in e[sectionKey]) {
          const v = e[sectionKey][this.name] as PnpmListResponseSectionItem
          this.current = parse(v.version)
        }
      }
    })
  }

  updateFromPnpmOutdatedResponse(json: PnpmOutdatedResponse) {
    const v = Object.entries(json).find(([k, v]) => k === this.name)?.[1]
    if (!v) return
    this.isDeprecated = v.isDeprecated
    this.current = parse(v.current)
    this.latest = parse(v.latest)
    this.wanted = parse(v.wanted)
  }

  getRangeString(target?: string | SemVer | null) {
    if (!target) target = this.latest ?? this.current
    if (!target) return null
    const rangeString =
      typeof target === 'string' ? `${this.rangeOperator}${target}` : `${this.rangeOperator}${target.toString()}`
    return rangeString
  }

  static fromDependencyString(name: string, versionString: string, dependencyType: string, cwd: string): Dependency {
    return new Dependency(name, versionString, dependencyType, cwd)
  }
}
