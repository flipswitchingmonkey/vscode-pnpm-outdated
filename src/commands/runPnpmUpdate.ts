import { pnpmUpdate } from '../utils/pnpmcli'
import { parse } from 'path'
import refreshOutdated from './refreshOutdated'

export default function runPnpmUpdate(uri: string, cwd?: string, packageName?: string) {
  cwd = cwd ?? parse(uri).dir
  pnpmUpdate(cwd, packageName)
  refreshOutdated(uri, cwd)
}
