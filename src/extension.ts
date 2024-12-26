import * as vscode from 'vscode'
import PnpmOutdatedCodeLensProvider from './providers/codelens'
import { spawnSync } from 'child_process'
import { registerCommands } from './commands'
import { workspace } from 'vscode'
import { CONFIG_SECTION } from './constants'

export function activate(context: vscode.ExtensionContext) {
  const checkForPnpm = spawnSync('pnpm', ['--version'])
  if (checkForPnpm.error) {
    if (checkForPnpm.error['code' as keyof Error] === 'ENOENT') {
      vscode.window.showErrorMessage('pnpm outdated: Could not find `pnpm` command')
    } else {
      vscode.window.showErrorMessage(checkForPnpm.error.message)
    }
    return
  }

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  // context.subscriptions.push(
  //   vscode.commands.registerCommand('vscode-pnpm-outdated.helloWorld', () => {
  //     vscode.window.showInformationMessage('Hello World from pnpm outdated!')
  //   })
  // )
  registerCommands(context)

  vscode.languages.registerCodeLensProvider(
    { language: 'json', pattern: '**/package.json', scheme: 'file' },
    PnpmOutdatedCodeLensProvider
  )
  vscode.languages.registerCodeLensProvider(
    { language: 'yaml', pattern: '**/pnpm-workspace.yaml', scheme: 'file' },
    PnpmOutdatedCodeLensProvider
  )
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration(CONFIG_SECTION)) {
        return
      }
      // updateConfigAndEverything()
      console.log('pnpm outdated config changed')
    })
  )
  context.subscriptions.push(
    workspace.onDidSaveTextDocument((e) => {
      console.log('pnpm outdated: document saved')
    })
  )
}

// This method is called when your extension is deactivated
export function deactivate() {}
