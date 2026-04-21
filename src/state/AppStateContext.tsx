import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { readCachedActivityLog, readCachedAppState } from './appStateCache'
import type { ActivityEntry, AppState } from '../types'

type AppStateContextValue = {
  state: AppState | null
  activity: ActivityEntry[]
  loading: boolean
  refresh: () => Promise<void>
  prefetchCoreData: () => Promise<void>
  installPlugin: (pluginId: string) => Promise<void>
  uninstallPlugin: (pluginId: string) => Promise<void>
  pinPlugin: (pluginId: string, version: string) => Promise<void>
  rollbackPlugin: (pluginId: string) => Promise<void>
  updatePluginVersion: (pluginId: string, version: string, approveRisk: boolean) => Promise<void>
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)
type ApiClientModule = typeof import('../api/client')
let apiClientPromise: Promise<ApiClientModule> | null = null

async function loadApiClient(): Promise<ApiClientModule> {
  if (!apiClientPromise) {
    apiClientPromise = import('../api/client')
  }
  return apiClientPromise
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<AppState | null>(() => readCachedAppState())
  const [activity, setActivity] = useState<ActivityEntry[]>(() => readCachedActivityLog())
  const [loading, setLoading] = useState(state === null)
  const prefetchPromiseRef = useRef<Promise<void> | null>(null)
  const lastPrefetchAtRef = useRef(0)

  const refresh = useCallback(async () => {
    if (!state) setLoading(true)
    const apiClient = await loadApiClient()
    const [nextState, nextActivity] = await Promise.all([
      apiClient.fetchAppState(),
      apiClient.fetchActivityLog(),
    ])
    setState(nextState)
    setActivity(nextActivity)
    setLoading(false)
  }, [state])

  useEffect(() => {
    void refresh()
  }, [user?.id])

  const prefetchCoreData = useCallback(async () => {
    const now = Date.now()
    if (prefetchPromiseRef.current) {
      await prefetchPromiseRef.current
      return
    }
    if (now - lastPrefetchAtRef.current < 30_000) {
      return
    }

    prefetchPromiseRef.current = (async () => {
      const apiClient = await loadApiClient()
      const [nextState, nextActivity] = await Promise.all([
        apiClient.fetchAppState(),
        apiClient.fetchActivityLog(),
      ])
      setState(nextState)
      setActivity(nextActivity)
      lastPrefetchAtRef.current = Date.now()
    })()

    try {
      await prefetchPromiseRef.current
    } finally {
      prefetchPromiseRef.current = null
    }
  }, [])

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      activity,
      loading,
      refresh,
      prefetchCoreData,
      installPlugin: async (pluginId: string) => {
        const apiClient = await loadApiClient()
        const nextState = await apiClient.installPlugin(pluginId)
        const nextActivity = await apiClient.fetchActivityLog()
        setState(nextState)
        setActivity(nextActivity)
      },
      uninstallPlugin: async (pluginId: string) => {
        const apiClient = await loadApiClient()
        const nextState = await apiClient.uninstallPlugin(pluginId)
        const nextActivity = await apiClient.fetchActivityLog()
        setState(nextState)
        setActivity(nextActivity)
      },
      pinPlugin: async (pluginId: string, version: string) => {
        const apiClient = await loadApiClient()
        const nextState = await apiClient.pinPlugin(pluginId, version)
        const nextActivity = await apiClient.fetchActivityLog()
        setState(nextState)
        setActivity(nextActivity)
      },
      rollbackPlugin: async (pluginId: string) => {
        const apiClient = await loadApiClient()
        const nextState = await apiClient.rollbackPlugin(pluginId)
        const nextActivity = await apiClient.fetchActivityLog()
        setState(nextState)
        setActivity(nextActivity)
      },
      updatePluginVersion: async (pluginId: string, version: string, approveRisk: boolean) => {
        const apiClient = await loadApiClient()
        try {
          const nextState = await apiClient.updatePluginVersion(pluginId, version, approveRisk)
          setState(nextState)
        } finally {
          const nextActivity = await apiClient.fetchActivityLog()
          setActivity(nextActivity)
        }
      },
    }),
    [state, activity, loading, prefetchCoreData],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }

  return context
}
