'use client'
import { useEffect, useState, useCallback } from 'react'
import { api, type ModelPricing, type Provider } from '@/lib/api'

export function useModels() {
  const [models, setModels] = useState<ModelPricing[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [m, p] = await Promise.all([api.getModels(), api.getProviders()])
      setModels(m)
      setProviders(p)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar modelos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const byProvider = (providerId: string) => models.filter(m => m.provider_id === providerId)

  return { models, providers, loading, error, reload: load, byProvider }
}
