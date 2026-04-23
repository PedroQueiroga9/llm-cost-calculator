'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Plus, Trash2, Bot, Save, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { api, type AgentSystemResult, type ModelPricing } from '@/lib/api'
import { ModelSelector } from '@/components/ui/ModelSelector'
import { Card, MetricCard, SectionTitle, Divider, Toggle, LoadingSpinner, EmptyState } from '@/components/ui'
import { fmtUSD, fmtBRL, fmtNumber, PROVIDER_COLORS } from '@/lib/utils'

interface AgentConfig {
  id: string
  name: string
  modelId: string
  requestsPerDay: number
  inputTokens: number
  outputTokens: number
  useCache: boolean
  useBatch: boolean
  expanded: boolean
}

interface Props { models: ModelPricing[] }

function newAgent(models: ModelPricing[], idx: number): AgentConfig {
  return {
    id: crypto.randomUUID(),
    name: `Agente ${idx + 1}`,
    modelId: models[0]?.id || '',
    requestsPerDay: 200,
    inputTokens: 0,
    outputTokens: 0,
    useCache: false,
    useBatch: false,
    expanded: true,
  }
}

const PRESET_AGENTS = [
  { name: 'Agente WhatsApp', modelId: 'claude-haiku-4-5', requestsPerDay: 500, inputTokens: 3000, outputTokens: 600 },
  { name: 'Agente de Análise RAG', modelId: 'claude-sonnet-4-6', requestsPerDay: 100, inputTokens: 15000, outputTokens: 2000 },
  { name: 'Agente de Código', modelId: 'gpt-5-2', requestsPerDay: 50, inputTokens: 8000, outputTokens: 3000 },
]

const CHART_COLORS = ['#8250f5','#10b981','#3b82f6','#f59e0b','#ef4444','#06b6d4','#ec4899']

export function AgentTab({ models }: Props) {
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [result, setResult] = useState<AgentSystemResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateAgent = (id: string, patch: Partial<AgentConfig>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a))
  }

  const removeAgent = (id: string) => setAgents(prev => prev.filter(a => a.id !== id))

  const addAgent = () => setAgents(prev => [...prev, newAgent(models, prev.length)])

  const loadPresets = () => {
    const preset: AgentConfig[] = PRESET_AGENTS.map((p, i) => ({
      id: crypto.randomUUID(),
      ...p,
      useCache: false, useBatch: false, expanded: false,
    }))
    setAgents(preset)
  }

  const calculate = useCallback(async (save = false) => {
    if (agents.length === 0) return
    setLoading(true)
    try {
      const r = await api.calcAgents({
        agents: agents.map(a => ({
          name: a.name,
          model_id: a.modelId,
          requests_per_day: a.requestsPerDay,
          input_tokens: a.inputTokens,
          output_tokens: a.outputTokens,
          use_cache: a.useCache,
          use_batch: a.useBatch,
        })),
        save,
        label: `Sistema com ${agents.length} agentes`,
      })
      setResult(r)
      if (save) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [agents])

  const chartData = result?.agents.map((a, i) => ({
    name: a.agent_name,
    value: a.monthly_cost_usd,
    color: CHART_COLORS[i % CHART_COLORS.length],
  })) || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Agent list */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-body font-medium text-slate-400">
            {agents.length === 0 ? 'Nenhum agente configurado' : `${agents.length} agente${agents.length > 1 ? 's' : ''}`}
          </h3>
          <div className="flex items-center gap-2">
            {agents.length === 0 && (
              <button onClick={loadPresets} className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-body border border-brand-800/40 rounded-lg px-3 py-1.5">
                Carregar exemplos
              </button>
            )}
            <button
              onClick={addAgent}
              className="flex items-center gap-1.5 text-xs font-body text-white bg-brand-700/50 hover:bg-brand-700/70 border border-brand-600/40 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar agente
            </button>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {agents.length === 0 && (
            <Card>
              <EmptyState icon={Bot} title="Nenhum agente adicionado" sub="Clique em 'Adicionar agente' ou carregue os exemplos para começar" />
            </Card>
          )}

          {agents.map((agent, idx) => {
            const model = models.find(m => m.id === agent.modelId)
            return (
              <motion.div
                key={agent.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <Card>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-950/60 border border-brand-800/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-mono text-brand-400">{idx + 1}</span>
                    </div>
                    <input
                      type="text"
                      value={agent.name}
                      onChange={e => updateAgent(agent.id, { name: e.target.value })}
                      className="flex-1 bg-transparent text-sm font-body font-medium text-white outline-none border-b border-transparent focus:border-brand-700/50 transition-colors pb-0.5"
                    />
                    <button
                      onClick={() => updateAgent(agent.id, { expanded: !agent.expanded })}
                      className="text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      {agent.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button onClick={() => removeAgent(agent.id)} className="text-slate-700 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {agent.expanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <ModelSelector models={models} value={agent.modelId} onChange={v => updateAgent(agent.id, { modelId: v })} label="Modelo" />
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {[
                            { label: 'Req/dia', key: 'requestsPerDay', min: 1, max: 50000 },
                            { label: 'Tokens entrada', key: 'inputTokens', min: 100, max: 100000 },
                            { label: 'Tokens saída', key: 'outputTokens', min: 50, max: 10000 },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="text-xs text-slate-500 font-body block mb-1.5">{f.label}</label>
                              <input
                                type="number"
                                min={f.min}
                                max={f.max}
                                value={agent[f.key as keyof AgentConfig] as number}
                                onChange={e => {
                                  const val = parseInt(e.target.value)
                                  if (!isNaN(val)) updateAgent(agent.id, { [f.key]: Math.max(f.min, val) })
                                }}
                                onBlur={e => {
                                  const val = parseInt(e.target.value)
                                  updateAgent(agent.id, { [f.key]: isNaN(val) ? f.min : Math.max(f.min, val) })
                                }}
                                className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-2.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-700/50 transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                        {(model?.cached_input_per_m || model?.batch_available) && (
                          <div className="flex gap-6">
                            {model?.cached_input_per_m && <Toggle label="Cache" sub="90% off input" checked={agent.useCache} onChange={v => updateAgent(agent.id, { useCache: v })} />}
                            {model?.batch_available && <Toggle label="Batch" sub={`${model.batch_discount}% off`} checked={agent.useBatch} onChange={v => updateAgent(agent.id, { useBatch: v })} />}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {agents.length > 0 && (
          <button
            onClick={() => calculate()}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-700/50 hover:bg-brand-600/50 border border-brand-600/40 text-sm font-body text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="sm" /> : <Zap className="w-4 h-4" />}
            Calcular sistema de agentes
          </button>
        )}
      </div>

      {/* Results panel */}
      <div className="space-y-4">
        {result ? (
          <>
            <Card glow>
              <SectionTitle>Custo total do sistema</SectionTitle>
              <div className="space-y-3 mb-4">
                <MetricCard label="Custo mensal" value={fmtUSD(result.total_monthly_usd)} sub="USD / mês" highlight />
                <MetricCard label="Em reais" value={fmtBRL(result.total_monthly_brl)} sub="BRL / mês" />
                <MetricCard label="Custo anual" value={fmtUSD(result.total_annual_usd)} />
              </div>
              <button
                onClick={() => calculate(true)}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-brand-400 transition-colors font-body"
              >
                {saved ? <><Zap className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Salvo!</span></> : <><Save className="w-3 h-3" />Salvar histórico</>}
              </button>
            </Card>

            {/* Pie chart */}
            {chartData.length > 1 && (
              <Card>
                <SectionTitle>Distribuição por agente</SectionTitle>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                      {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => fmtUSD(v)}
                      contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Per-agent breakdown */}
            <Card>
              <SectionTitle>Por agente</SectionTitle>
              <div className="space-y-2">
                {result.agents.map((a, i) => (
                  <div key={a.agent_name} className="flex items-start justify-between py-2 border-b border-white/[0.04] last:border-0 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <div className="min-w-0">
                        <p className="text-xs font-body text-white truncate">{a.agent_name}</p>
                        <p className="text-[10px] text-slate-600 font-body">{a.model_name}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-mono text-white">{fmtUSD(a.monthly_cost_usd)}</p>
                      <p className="text-[10px] text-slate-600 font-body">{a.percentage_of_total}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <EmptyState icon={Bot} title="Sem resultados ainda" sub="Configure seus agentes e clique em calcular" />
          </Card>
        )}
      </div>
    </div>
  )
}
