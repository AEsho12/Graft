import { seedState } from '../data/mockData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { AppState, InstalledPlugin, Plugin, PluginVersion, UpdateRun, UpdateStage } from '../types'

const STORAGE_KEY = 'graft.app.state.v1'

const sleep = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

function normalizeState(state: Partial<AppState>): AppState {
  return {
    plugins: state.plugins ?? seedState.plugins,
    pluginVersions: state.pluginVersions ?? seedState.pluginVersions,
    installed: state.installed ?? seedState.installed,
    updates: state.updates ?? seedState.updates,
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return seedState
    }

    const parsed = JSON.parse(raw) as Partial<AppState>
    return normalizeState(parsed)
  } catch {
    return seedState
  }
}

function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

async function getSupabaseUserId(): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

function mapStages(input: unknown): UpdateStage[] {
  if (!Array.isArray(input)) return []
  return input.map((item) => {
    const record = item as Record<string, unknown>
    return {
      key: String(record.key ?? 'unknown'),
      label: String(record.label ?? 'Unknown'),
      status: (record.status as UpdateStage['status']) ?? 'pending',
      detail: record.detail ? String(record.detail) : undefined,
    }
  })
}

function toInstallCount(value: unknown): string {
  if (typeof value === 'number') {
    return `${value}`
  }
  if (typeof value === 'string') {
    return value
  }
  return '0'
}

async function fetchFromSupabaseOrNull(): Promise<AppState | null> {
  const userId = await getSupabaseUserId()
  if (!userId || !supabase) return null

  const [pluginsRes, versionsRes, installsRes, updatesRes] = await Promise.all([
    supabase.from('plugins').select('*').order('name', { ascending: true }),
    supabase.from('plugin_versions').select('*').order('released_at', { ascending: false }),
    supabase.from('installs').select('*').eq('user_id', userId),
    supabase.from('update_runs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ])

  if (pluginsRes.error || versionsRes.error || installsRes.error || updatesRes.error) {
    return null
  }

  const plugins: Plugin[] = (pluginsRes.data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name ?? ''),
    publisher: String(row.publisher ?? ''),
    category: String(row.category ?? 'Other'),
    appProfile: String(row.app_profile ?? 'unknown'),
    rating: Number(row.rating ?? 0),
    installs: toInstallCount(row.installs_count),
    version: String(row.latest_version ?? '0.0.0'),
    risk: (row.risk_level as Plugin['risk']) ?? 'Low',
    description: String(row.description ?? ''),
    featured: Boolean(row.featured),
  }))

  const pluginVersions: PluginVersion[] = (versionsRes.data ?? []).map((row) => ({
    pluginId: String(row.plugin_id),
    version: String(row.version),
    status: (row.status as PluginVersion['status']) ?? 'legacy',
    requiresReview: Boolean(row.requires_review),
    riskLevel: (row.risk_level as PluginVersion['riskLevel']) ?? 'Low',
    changelog: Array.isArray(row.changelog) ? row.changelog.map((entry: unknown) => String(entry)) : [],
    releasedAt: String(row.released_at ?? new Date().toISOString()),
    diff: {
      permissionsAdded: Array.isArray(row.permissions_added)
        ? row.permissions_added.map((entry: unknown) => String(entry))
        : [],
      permissionsRemoved: Array.isArray(row.permissions_removed)
        ? row.permissions_removed.map((entry: unknown) => String(entry))
        : [],
      capabilitiesAdded: Array.isArray(row.capabilities_added)
        ? row.capabilities_added.map((entry: unknown) => String(entry))
        : [],
      capabilitiesRemoved: Array.isArray(row.capabilities_removed)
        ? row.capabilities_removed.map((entry: unknown) => String(entry))
        : [],
      compatibilityBefore: String(row.compatibility_before ?? ''),
      compatibilityAfter: String(row.compatibility_after ?? ''),
      riskSummary: String(row.risk_summary ?? ''),
    },
  }))

  const installed: InstalledPlugin[] = (installsRes.data ?? []).map((row) => ({
    pluginId: String(row.plugin_id),
    status: (row.status as InstalledPlugin['status']) ?? 'Active',
    pinnedVersion: row.pinned_version ? String(row.pinned_version) : undefined,
    autoUpdate: Boolean(row.auto_update),
    installedVersion: String(row.installed_version ?? '0.0.0'),
  }))

  const updates: UpdateRun[] = (updatesRes.data ?? []).map((row) => ({
    id: String(row.id),
    pluginId: String(row.plugin_id),
    fromVersion: String(row.from_version ?? ''),
    toVersion: String(row.to_version ?? ''),
    summary: String(row.summary ?? ''),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    stages: mapStages(row.stages_json),
  }))

  return normalizeState({ plugins, pluginVersions, installed, updates })
}

export async function fetchAppState(): Promise<AppState> {
  await sleep()

  if (isSupabaseConfigured) {
    const remote = await fetchFromSupabaseOrNull()
    if (remote) {
      saveState(remote)
      return remote
    }
  }

  const state = loadState()
  saveState(state)
  return state
}

async function upsertInstallRemote(userId: string, pluginId: string, installedVersion: string): Promise<void> {
  if (!supabase) return
  await supabase.from('installs').upsert({
    user_id: userId,
    plugin_id: pluginId,
    installed_version: installedVersion,
    auto_update: true,
    status: 'Active',
  })
}

export async function installPlugin(pluginId: string): Promise<AppState> {
  await sleep()
  const state = loadState()
  const alreadyInstalled = state.installed.some((item) => item.pluginId === pluginId)

  if (alreadyInstalled) {
    return fetchAppState()
  }

  const plugin = state.plugins.find((item) => item.id === pluginId)
  if (!plugin) {
    return fetchAppState()
  }

  const userId = await getSupabaseUserId()
  if (userId) {
    await upsertInstallRemote(userId, pluginId, plugin.version)
    return fetchAppState()
  }

  const nextInstalled: InstalledPlugin = {
    pluginId,
    status: 'Active',
    autoUpdate: true,
    installedVersion: plugin.version,
  }

  const nextState: AppState = {
    ...state,
    installed: [...state.installed, nextInstalled],
  }

  saveState(nextState)
  return nextState
}

export async function uninstallPlugin(pluginId: string): Promise<AppState> {
  await sleep()
  const userId = await getSupabaseUserId()

  if (userId && supabase) {
    await supabase.from('installs').delete().eq('user_id', userId).eq('plugin_id', pluginId)
    return fetchAppState()
  }

  const state = loadState()
  const nextState: AppState = {
    ...state,
    installed: state.installed.filter((item) => item.pluginId !== pluginId),
  }

  saveState(nextState)
  return nextState
}

export async function pinPlugin(pluginId: string, version: string): Promise<AppState> {
  await sleep()
  const userId = await getSupabaseUserId()

  if (userId && supabase) {
    await supabase
      .from('installs')
      .update({ pinned_version: version, auto_update: false })
      .eq('user_id', userId)
      .eq('plugin_id', pluginId)
    return fetchAppState()
  }

  const state = loadState()
  const nextState: AppState = {
    ...state,
    installed: state.installed.map((item) =>
      item.pluginId === pluginId
        ? {
            ...item,
            pinnedVersion: version,
            autoUpdate: false,
          }
        : item,
    ),
  }

  saveState(nextState)
  return nextState
}

export async function rollbackPlugin(pluginId: string): Promise<AppState> {
  await sleep()
  const state = loadState()
  const run = state.updates.find((item) => item.pluginId === pluginId)

  if (!run) {
    return fetchAppState()
  }

  const userId = await getSupabaseUserId()
  if (userId && supabase) {
    await supabase
      .from('installs')
      .update({ installed_version: run.fromVersion, status: 'Active' })
      .eq('user_id', userId)
      .eq('plugin_id', pluginId)

    return fetchAppState()
  }

  const nextState: AppState = {
    ...state,
    installed: state.installed.map((item) =>
      item.pluginId === pluginId
        ? {
            ...item,
            status: 'Active',
            installedVersion: run.fromVersion,
          }
        : item,
    ),
  }

  saveState(nextState)
  return nextState
}

export async function updatePluginVersion(
  pluginId: string,
  toVersion: string,
  approveRisk: boolean,
): Promise<AppState> {
  await sleep()
  const state = loadState()
  const currentInstall = state.installed.find((item) => item.pluginId === pluginId)
  if (!currentInstall) {
    return fetchAppState()
  }

  const targetVersion = state.pluginVersions.find(
    (item) => item.pluginId === pluginId && item.version === toVersion,
  )

  if (!targetVersion) {
    throw new Error('Selected version was not found.')
  }

  if (targetVersion.requiresReview && !approveRisk) {
    throw new Error('This version requires explicit approval due to permission/capability risk.')
  }

  const newRun: UpdateRun = {
    id: crypto.randomUUID(),
    pluginId,
    fromVersion: currentInstall.installedVersion,
    toVersion,
    createdAt: new Date().toISOString(),
    summary: 'Update completed successfully.',
    stages: [
      { key: 'queued', label: 'Queued', status: 'success' },
      { key: 'download', label: 'Download', status: 'success' },
      { key: 'verify', label: 'Signature Verify', status: 'success' },
      { key: 'compat', label: 'Compatibility Check', status: 'success' },
      { key: 'migrate', label: 'Migrate Config', status: 'success' },
      { key: 'activate', label: 'Activate', status: 'success' },
      { key: 'health', label: 'Health Check', status: 'success' },
    ],
  }

  const userId = await getSupabaseUserId()
  if (userId && supabase) {
    await supabase
      .from('installs')
      .update({ installed_version: toVersion, status: 'Active' })
      .eq('user_id', userId)
      .eq('plugin_id', pluginId)

    await supabase.from('update_runs').insert({
      id: newRun.id,
      user_id: userId,
      plugin_id: pluginId,
      from_version: newRun.fromVersion,
      to_version: newRun.toVersion,
      summary: newRun.summary,
      stages_json: newRun.stages,
      created_at: newRun.createdAt,
    })

    return fetchAppState()
  }

  const nextState: AppState = {
    ...state,
    installed: state.installed.map((item) =>
      item.pluginId === pluginId
        ? {
            ...item,
            status: 'Active',
            installedVersion: toVersion,
          }
        : item,
    ),
    updates: [newRun, ...state.updates],
  }

  saveState(nextState)
  return nextState
}
