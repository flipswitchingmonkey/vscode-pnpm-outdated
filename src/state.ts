import { PnpmListResponse, PnpmOutdatedResponse } from './types'

export abstract class State {
  static PnpmList: {
    [uri: string]: {
      lastFetched: Date | null
      items: PnpmListResponse
    }
  } = {}

  static PnpmOutdated: {
    [uri: string]: {
      lastFetched: Date | null
      items: PnpmOutdatedResponse
    }
  } = {}
}
