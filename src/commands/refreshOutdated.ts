import { pnpmList, pnpmOutdated } from '../utils/pnpmcli'
import { parse } from 'path'
import { State } from '../state'

export default function refreshOutdated(uri: string, cwd?: string): { outdatedOk: boolean; listOk: boolean } {
  cwd = cwd ?? parse(uri).dir

  const resultOutdated = pnpmOutdated(cwd)
  const resultList = pnpmList(cwd)

  if (resultList.ok && resultList.value) {
    State.PnpmList[uri] = {
      lastFetched: new Date(),
      items: resultList.value,
    }
  }

  if (resultOutdated.ok && resultOutdated.value) {
    State.PnpmOutdated[uri] = {
      lastFetched: new Date(),
      items: resultOutdated.value,
    }
  }

  return {
    outdatedOk: resultOutdated.ok,
    listOk: resultList.ok,
  }
}
