import { pnpmInstall } from '../utils/pnpmcli'
import { parse } from 'path'
import refreshOutdated from './refreshOutdated'

export default function runPnpmInstall(uri: string, cwd?: string) {
  cwd = cwd ?? parse(uri).dir
  pnpmInstall(cwd)
  refreshOutdated(uri, cwd)
}
