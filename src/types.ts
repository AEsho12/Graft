export type StageStatus = 'success' | 'running' | 'failed' | 'pending'

export type Plugin = {
  id: string
  name: string
  publisher: string
  category: string
  appProfile: string
  rating: number
  installs: string
  version: string
  risk: 'Low' | 'Medium' | 'High'
  description: string
  featured?: boolean
}

export type PluginVersionStatus = 'active' | 'legacy' | 'blocked' | 'revoked'

export type PluginDiff = {
  permissionsAdded: string[]
  permissionsRemoved: string[]
  capabilitiesAdded: string[]
  capabilitiesRemoved: string[]
  compatibilityBefore: string
  compatibilityAfter: string
  riskSummary: string
}

export type PluginVersion = {
  pluginId: string
  version: string
  changelog: string[]
  status: PluginVersionStatus
  requiresReview: boolean
  riskLevel: 'Low' | 'Medium' | 'High'
  diff: PluginDiff
  releasedAt: string
}

export type InstalledPlugin = {
  pluginId: string
  status: 'Active' | 'Needs Attention' | 'Quarantined'
  pinnedVersion?: string
  autoUpdate: boolean
  installedVersion: string
}

export type UpdateStage = {
  key: string
  label: string
  status: StageStatus
  detail?: string
}

export type UpdateRun = {
  id: string
  pluginId: string
  fromVersion: string
  toVersion: string
  summary: string
  stages: UpdateStage[]
  createdAt: string
}

export type AppState = {
  plugins: Plugin[]
  pluginVersions: PluginVersion[]
  installed: InstalledPlugin[]
  updates: UpdateRun[]
}

export type ActivityStatus = 'success' | 'failed' | 'info'
export type ActivityAction = 'install' | 'uninstall' | 'update' | 'pin' | 'rollback'

export type ActivityEntry = {
  id: string
  pluginId: string
  pluginName: string
  action: ActivityAction
  status: ActivityStatus
  message: string
  createdAt: string
}
