import vscode from 'vscode'
import { spawnSync } from 'child_process'
import { PnpmListResponse, PnpmOutdatedResponse, Result } from '../types'
import { ERRORS } from '../constants'

export function pnpmInstall(cwd: string) {
  const pnpmOutput = spawnSync('pnpm', ['install'], { cwd })
  if (pnpmOutput.error) {
    vscode.window.showErrorMessage(pnpmOutput.error.message)
    return {
      ok: false,
      error: pnpmOutput.error,
    }
  }
  const stdout = pnpmOutput.stdout.toString()
  console.log(stdout)
}

export function pnpmList(cwd: string, depth?: string): Result<PnpmListResponse | null> {
  const pnpmOutput = spawnSync('pnpm', ['list', '--json'], { cwd })
  if (pnpmOutput.error) {
    vscode.window.showErrorMessage(pnpmOutput.error.message)
    return {
      ok: false,
      error: pnpmOutput.error,
    }
  }
  const stdout = pnpmOutput.stdout.toString()
  try {
    const json = JSON.parse(stdout) as PnpmListResponse
    if (Array.isArray(json) && json.length > 0) {
      return {
        ok: true,
        value: json,
      }
    }
  } catch (error) {
    return { ok: false, error: error as Error }
  }
  return {
    ok: true,
    value: null,
  }
}

export function pnpmOutdated(cwd: string, packageName?: string): Result<PnpmOutdatedResponse | null> {
  const pnpmOutput = packageName
    ? spawnSync('pnpm', ['-r', 'outdated', packageName, '--format', 'json'], { cwd })
    : spawnSync('pnpm', ['-r', 'outdated', '--format', 'json'], { cwd })
  if (pnpmOutput.error) {
    vscode.window.showErrorMessage(pnpmOutput.error.message)
    return {
      ok: false,
      error: pnpmOutput.error,
    }
  }
  const stdout = pnpmOutput.stdout.toString()
  // console.log(stdout)
  if (stdout.startsWith('ERR_PNPM_OUTDATED_NO_LOCKFILE')) {
    return { ok: false, error: new Error(stdout), meta: { code: ERRORS.ERR_PNPM_OUTDATED_NO_LOCKFILE } }
  }
  if (stdout.includes('cannot read properties')) {
    vscode.window.showErrorMessage('Error while running pnpm outdated - you may be missing a lock file?')
    return { ok: false, error: new Error(stdout), meta: { code: ERRORS.ERR_PNPM_CANNOT_READ_PROPERTIES } }
  }
  try {
    const json = JSON.parse(stdout) as PnpmOutdatedResponse
    if (json && Object.values(json).length > 0 && Object.values(json)[0].current) {
      return {
        ok: true,
        value: json,
      }
    }
  } catch (error) {
    return { ok: false, error: error as Error }
  }
  return {
    ok: true,
    value: null,
  }
}

export function pnpmUpdate(cwd: string, packageName?: string): Result<PnpmOutdatedResponse | null> {
  const pnpmOutput = packageName ? spawnSync('pnpm', ['up', packageName], { cwd }) : spawnSync('pnpm', ['up'], { cwd })
  if (pnpmOutput.error) {
    vscode.window.showErrorMessage(pnpmOutput.error.message)
    return {
      ok: false,
      error: pnpmOutput.error,
    }
  }
  const stdout = pnpmOutput.stdout.toString()
  console.log(stdout)
  if (stdout.startsWith('ERR_PNPM_OUTDATED_NO_LOCKFILE')) {
    return { ok: false, error: new Error(stdout), meta: { code: ERRORS.ERR_PNPM_OUTDATED_NO_LOCKFILE } }
  }
  if (stdout.includes('cannot read properties')) {
    vscode.window.showErrorMessage('Error while running pnpm outdated - you may be missing a lock file?')
    return { ok: false, error: new Error(stdout), meta: { code: ERRORS.ERR_PNPM_CANNOT_READ_PROPERTIES } }
  }
  try {
    const json = JSON.parse(stdout) as PnpmOutdatedResponse
    if (json && Object.values(json).length > 0 && Object.values(json)[0].current) {
      return {
        ok: true,
        value: json,
      }
    }
  } catch (error) {
    return { ok: false, error: error as Error }
  }
  return {
    ok: true,
    value: null,
  }
}
