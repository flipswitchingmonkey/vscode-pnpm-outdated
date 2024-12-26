import { updateConfig } from '../utils/helper'

export default function disableExtension() {
  updateConfig<boolean>('enabled', false)
}
