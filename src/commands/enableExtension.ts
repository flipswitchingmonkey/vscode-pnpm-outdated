import { updateConfig } from '../utils/helper'

export default function enableExtension() {
  updateConfig<boolean>('enabled', true)
}
