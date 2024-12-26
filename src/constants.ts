export const CONFIG_SECTION = 'pnpm-outdated'
export const ERRORS = {
  ERR_PNPM_OUTDATED_NO_LOCKFILE: 'e0001',
  ERR_PNPM_CANNOT_READ_PROPERTIES: 'e0002', // most likely no lock file yet
}
export const REGEX_ESCAPE_CHARS = /[\\^$.*+?()[\]{}|]/g
