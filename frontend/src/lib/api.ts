import { getSupabaseClient } from './supabase/client'

const API_BASE = '/api'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await getSupabaseClient().auth.getSession()
  if (!session) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export interface ModelPricing {
  id: string
  provider: string
  provider_id: string
  name: string
  input_per_m: number
  output_per_m: number
  cached_input_per_m: number | null
  context_window: number
  tier: 'economy' | 'standard' | 'premium' | 'frontier'
  strengths: string[]
  best_for: string[]
  batch_available: boolean
  batch_discount: number
  docs_url: string
}

export interface Provider {
  id: string
  name: string
  color: string
  description: string
  model_count: number
}

export interface SingleCalcResult {
  model_id: string
  model_name: string
  provider: string
  input_tokens: number
  output_tokens: number
  cost_input_usd: number
  cost_output_usd: number
  cost_total_usd: number
  cost_total_brl: number
  cache_applied: boolean
  batch_applied: boolean
}

export interface MonthlyCalcResult extends SingleCalcResult {
  requests_per_day: number
  total_monthly_requests: number
  total_input_tokens_monthly: number
  total_output_tokens_monthly: number
  monthly_cost_usd: number
  monthly_cost_brl: number
  annual_cost_usd: number
  annual_cost_brl: number
  projections: {
    '100_reqs_day': number
    '1000_reqs_day': number
    '10000_reqs_day': number
  }
}

export interface CompareResult {
  model_id: string
  model_name: string
  provider: string
  provider_id: string
  tier: string
  input_per_m: number
  output_per_m: number
  context_window: number
  cost_per_request_usd: number
  monthly_cost_usd: number
  monthly_cost_brl: number
  batch_available: boolean
  strengths: string[]
  best_for: string[]
  relative_cost_pct: number
}

export interface AgentResult {
  agent_name: string
  model_name: string
  provider: string
  requests_per_day: number
  cost_per_request_usd: number
  daily_cost_usd: number
  monthly_cost_usd: number
  monthly_cost_brl: number
  percentage_of_total: number
}

export interface AgentSystemResult {
  agents: AgentResult[]
  total_daily_usd: number
  total_monthly_usd: number
  total_monthly_brl: number
  total_annual_usd: number
  total_annual_brl: number
}

export interface HistoryRecord {
  id: number
  type: string
  label: string
  params: Record<string, unknown>
  result: Record<string, unknown>
  created_at: string
}

// Rotas de pricing não requerem auth (dados públicos de preço)
export const api = {
  getModels: () => request<ModelPricing[]>('/pricing/models'),
  getProviders: () => request<Provider[]>('/pricing/providers'),

  calcSingle: (data: {
    model_id: string
    input_tokens: number
    output_tokens: number
    use_cache?: boolean
    use_batch?: boolean
    save?: boolean
    label?: string
  }) =>
    request<SingleCalcResult>('/calculator/single', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  calcMonthly: (data: {
    model_id: string
    requests_per_day: number
    input_tokens_per_req: number
    output_tokens_per_req: number
    use_cache?: boolean
    use_batch?: boolean
    save?: boolean
    label?: string
  }) =>
    request<MonthlyCalcResult>('/calculator/monthly', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  compare: (data: {
    input_tokens: number
    output_tokens: number
    requests_per_day?: number
  }) =>
    request<CompareResult[]>('/calculator/compare', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  calcAgents: (data: {
    agents: Array<{
      name: string
      model_id: string
      requests_per_day: number
      input_tokens: number
      output_tokens: number
      use_cache?: boolean
      use_batch?: boolean
    }>
    save?: boolean
    label?: string
  }) =>
    request<AgentSystemResult>('/calculator/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getHistory: (limit?: number) =>
    request<HistoryRecord[]>(`/history${limit ? `?limit=${limit}` : ''}`),

  deleteHistory: (id: number) =>
    request<{ deleted: boolean }>(`/history/${id}`, { method: 'DELETE' }),
}
