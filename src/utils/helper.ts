import vscode from 'vscode'
import { CONFIG_SECTION, REGEX_ESCAPE_CHARS } from '../constants'

export function getConfig<T = unknown>(key: string) {
  return vscode.workspace.getConfiguration(CONFIG_SECTION).get(key) as T
}

export function updateConfig<T = unknown>(key: string, value: T) {
  return vscode.workspace.getConfiguration(CONFIG_SECTION).update(key, value)
}

export function isEnabled(): boolean {
  return getConfig<boolean>('enabled') ?? false
}

export function showInstalledVersionLens(): boolean {
  return getConfig<boolean>('showInstalledVersionLens') ?? false
}

export function safeRegexString(s: string) {
  return s.replace(REGEX_ESCAPE_CHARS, (c) => `\\${c}`)
}
