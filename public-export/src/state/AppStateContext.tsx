import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  fetchAppState,
  installPlugin as installPluginRequest,
  pinPlugin as pinPluginRequest,
  rollbackPlugin as rollbackPluginRequest,
  uninstallPlugin as uninstallPluginRequest,
  updatePluginVersion as updatePluginVersionRequest,
} from '../api/client'
import { useAuth } from './AuthContext'
import type { AppState } from '../types'

type AppStateContextValue = {
  state: AppState | null
  loading: boolean
  refresh: () => Promise<void>
  installPlugin: (pluginId: string) => Promise<void>
  uninstallPlugin: (pluginId: string) => Promise<void>
  pinPlugin: (pluginId: string, version: string) => Promise<void>
  rollbackPlugin: (pluginId: string) => Promise<void>
  updatePluginVersion: (pluginId: string, version: string, approveRisk: boolean) => Promise<void>
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<AppState | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    const nextState = await fetchAppState()
    setState(nextState)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
  }, [user?.id])

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      loading,
      refresh,
      installPlugin: async (pluginId: string) => {
        const nextState = await installPluginRequest(pluginId)
        setState(nextState)
      },
      uninstallPlugin: async (pluginId: string) => {
        const nextState = await uninstallPluginRequest(pluginId)
        setState(nextState)
      },
      pinPlugin: async (pluginId: string, version: string) => {
        const nextState = await pinPluginRequest(pluginId, version)
        setState(nextState)
      },
      rollbackPlugin: async (pluginId: string) => {
        const nextState = await rollbackPluginRequest(pluginId)
        setState(nextState)
      },
      updatePluginVersion: async (pluginId: string, version: string, approveRisk: boolean) => {
        const nextState = await updatePluginVersionRequest(pluginId, version, approveRisk)
        setState(nextState)
      },
    }),
    [state, loading],
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
