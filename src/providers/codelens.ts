import vscode, { TextLine } from 'vscode'
import { isEnabled, safeRegexString, showInstalledVersionLens } from '../utils/helper'
import type { DependenciesSchema, PackageJsonSchema, PnpmWorkspaceSchema } from '../types'
import YAML from 'yaml'
import { Dependency } from '../dependencies'
import { parse as parsePath } from 'path'
import { Command } from '../commands'
import { State } from '../state'
import { satisfies } from 'semver'
import refreshOutdated from '../commands/refreshOutdated'

class PnpmOutdatedCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>()
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event

  constructor() {
    console.log('constructed')
  }

  provideCodeLenses = async (
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeLens[]> => {
    if (!isEnabled()) return []

    const uri = document.uri.toString()
    const cwd = parsePath(document.uri.fsPath).dir

    const content = document.getText()

    const isPackageJson = document.fileName.endsWith('package.json')
    const isPnpmWorkspaceYaml = document.fileName.endsWith('pnpm-workspace.yaml')

    const lenses: vscode.CodeLens[] = []
    const dependencies: Dependency[] = []

    const parseEntries = <T extends DependenciesSchema>(data: T, key: keyof T) => {
      const section = data[key]
      if (!section) return
      Object.entries(section).forEach(([name, current]) => {
        if (!current || typeof current !== 'string') return
        const dependency = Dependency.fromDependencyString(name, current, key as string, cwd)
        dependencies.push(dependency)
      })
    }

    try {
      if (isPackageJson) {
        const json = JSON.parse(content) as PackageJsonSchema
        if (!json) return lenses
        for (const key of [
          'dependencies',
          'devDependencies',
          'optionalDependencies',
          'peerDependencies',
        ] as (keyof PackageJsonSchema)[]) {
          if (!(key in json)) continue
          parseEntries<PackageJsonSchema>(json, key)
        }
      }

      if (isPnpmWorkspaceYaml) {
        const yaml = YAML.parse(content) as PnpmWorkspaceSchema
        if (!yaml) return lenses

        // vscode.window.showInformationMessage(Object.keys(yaml.catalog).join())
        for (const key of ['catalog'] as (keyof PnpmWorkspaceSchema)[]) {
          if (!(key in yaml)) continue
          parseEntries<PnpmWorkspaceSchema>(yaml, key)
        }
      }

      // console.debug(`dependencies: ${dependencies.length}`)

      if (dependencies.length === 0) return lenses

      if (!(uri in State.PnpmList) || !(uri in State.PnpmOutdated)) {
        refreshOutdated(uri, cwd)
      }

      const listResponse = State.PnpmList[uri]?.items ?? []
      const outdatedResponse = State.PnpmOutdated[uri]?.items ?? []

      for (const dependency of dependencies) {
        dependency.updateFromPnpmListResponse(listResponse)
        dependency.updateFromPnpmOutdatedResponse(outdatedResponse)
        const regexForDependency = new RegExp(
          `^\\s*"?${safeRegexString(dependency.name)}"?:\\s*"?${safeRegexString(dependency.currentString)}"?`,
          'gm'
        )
        const lineMatch = content.matchAll(regexForDependency)
        for (const matchingLine of lineMatch) {
          // console.log(matchingLine.index)
          const documentLine = document.lineAt(document.positionAt(matchingLine.index))
          // console.log(dependency.current?.toString(), dependency.latest?.toString())

          const managedByWorkspace = dependency.currentString === 'catalog:'

          let isLatest = true
          if (dependency.latest && dependency.current) isLatest = dependency.current.compare(dependency.latest) === 0

          let satisfiesRange = false
          if (dependency.current && dependency.range) {
            satisfiesRange = satisfies(dependency.current, dependency.range)
            isLatest = satisfiesRange && isLatest
          }

          if (managedByWorkspace) {
            const icon = '$(info)'
            if (showInstalledVersionLens())
              lenses.push(
                new vscode.CodeLens(documentLine.range, {
                  title: `${icon} Managed by workspace | $(warning) change local to ${dependency.getRangeString()}`,
                  command: Command.UpdateVersionString,
                  arguments: [vscode.window.activeTextEditor, documentLine, dependency],
                  tooltip: [
                    `*${dependency.name}*`,
                    `Current: ${dependency.current?.toString()}`,
                    `Range: ${dependency.range?.range}`,
                  ].join('\n'),
                })
              )
          } else {
            let icon = '$(circle-outline)'
            if (!isLatest) icon = '$(info)'
            if (!satisfiesRange) icon = '$(warning)'

            if (!isLatest)
              lenses.push(
                new vscode.CodeLens(documentLine.range, {
                  title: `${icon} newer available: ${dependency.getRangeString()}`,
                  command: Command.UpdateVersionString,
                  arguments: [vscode.window.activeTextEditor, documentLine, dependency],
                  tooltip: [
                    `*${dependency.name}*`,
                    `This will replace ${dependency.currentString} with ${dependency.getRangeString()} in ${uri}`,
                  ].join('\n'),
                })
              )
            if (showInstalledVersionLens() || !isLatest)
              lenses.push(
                new vscode.CodeLens(documentLine.range, {
                  title: `(installed ${dependency.current?.toString()} ${
                    satisfiesRange ? 'satisfies ' : 'does NOT satisfy'
                  } ${dependency.range?.range})`,
                  command: Command.Debug,
                  arguments: [dependency],
                  tooltip: [
                    `*${dependency.name}*`,
                    `Current: ${dependency.current?.toString()}`,
                    `Range: ${dependency.range?.range}`,
                  ].join('\n'),
                })
              )
            // lenses.push(
            //   new vscode.CodeLens(documentLine.range, {
            //     title: `$(update) pnpm update`,
            //     command: Command.Update,
            //     arguments: [uri, cwd, dependency.name],
            //   })
            // )
          }
        }
      }

      let installLensLines: TextLine[] = []
      if (isPnpmWorkspaceYaml) {
        const regexForInstallLens = new RegExp(`^\\s*catalog:\\s*$`, 'gm')
        const matchingIndex = content.search(regexForInstallLens)
        if (matchingIndex > -1) {
          const documentLine = document.lineAt(document.positionAt(matchingIndex))
          if (documentLine) installLensLines.push(documentLine)
        }
      }
      if (isPackageJson) {
        const regexForInstallLens = new RegExp(`^\\s*\"dependencies|devDependencies\":`, 'gm')
        const matches = content.matchAll(regexForInstallLens)
        for (const match of matches) {
          if (match.index > -1) {
            const documentLine = document.lineAt(document.positionAt(match.index))
            if (documentLine) installLensLines.push(documentLine)
          }
        }
      }

      for (const documentLine of installLensLines) {
        lenses.push(
          new vscode.CodeLens(documentLine.range, {
            title: 'Run pnpm install',
            command: Command.Install,
            arguments: [uri, cwd],
          })
        )
        lenses.push(
          new vscode.CodeLens(documentLine.range, {
            title: 'Run pnpm outdated',
            command: Command.Refresh,
            arguments: [uri, cwd],
          })
        )
      }
      return lenses
    } catch (error) {
      console.log(error)
      return []
    }
  }

  refresh = (): void => {
    vscode.workspace.onDidChangeConfiguration(() => {
      this._onDidChangeCodeLenses.fire()
    })
  }
}

export default new PnpmOutdatedCodeLensProvider()
