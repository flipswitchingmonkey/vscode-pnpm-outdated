import vscode from 'vscode'
import disableExtension from './commands/disableExtension'
import enableExtension from './commands/enableExtension'
import runPnpmInstall from './commands/runPnpmInstall'
import refreshOutdated from './commands/refreshOutdated'
import updateVersionString from './commands/updateVersionString'
import debugOutput from './commands/debugOutput'
import runPnpmUpdate from './commands/runPnpmUpdate'

export const Command = {
  Enable: 'vscode-pnpm-outdated.enable',
  Disable: 'vscode-pnpm-outdated.disable',
  Install: 'vscode-pnpm-outdated.install',
  Update: 'vscode-pnpm-outdated.update',
  Refresh: 'vscode-pnpm-outdated.refreshOutdated',
  Debug: 'vscode-pnpm-outdated.debug',
  UpdateVersionString: 'vscode-pnpm-outdated.update-version-string',
} as const

export function registerCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(Command.Enable, enableExtension))
  context.subscriptions.push(vscode.commands.registerCommand(Command.Disable, disableExtension))
  context.subscriptions.push(vscode.commands.registerCommand(Command.Install, runPnpmInstall))
  context.subscriptions.push(vscode.commands.registerCommand(Command.Update, runPnpmUpdate))
  context.subscriptions.push(vscode.commands.registerCommand(Command.Refresh, refreshOutdated))
  context.subscriptions.push(vscode.commands.registerCommand(Command.UpdateVersionString, updateVersionString))
  context.subscriptions.push(vscode.commands.registerCommand(Command.Debug, debugOutput))
}
