import type { ActivityEntry, AppState } from '../types'

const STORAGE_KEY = 'graft.app.state.v1'
const ACTIVITY_STORAGE_KEY = 'graft.activity.v1'

export function readCachedAppState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AppState
    if (!parsed || typeof parsed !== 'object') return null
    if (!Array.isArray(parsed.plugins)) return null
    if (!Array.isArray(parsed.pluginVersions)) return null
    if (!Array.isArray(parsed.installed)) return null
    if (!Array.isArray(parsed.updates)) return null
    return parsed
  } catch {
    return null
  }
}

export function readCachedActivityLog(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as ActivityEntry[]
  } catch {
    return []
  }
}
