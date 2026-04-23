'use client'
import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TrendingDown } from 'lucide-react'
import { api, type CompareResult, type ModelPricing } from '@/lib/api'
import { Card, SectionTitle, SliderField, TierBadge, ProviderBadge, LoadingSpinner, Divider } from '@/components/ui'
import { fmtUSD, fmtBRL, fmtTokens, fmtContextWindow, PROVIDER_COLORS } from '@/lib/utils'

interface Props { models: ModelPricing[] }

const TIER_FILTER_OPTIONS = ['Todos', 'economy', 'standard', 'premium', 'frontier']

export function CompareTab({ models }: Props) {
  const [inTok, setInTok] = useState(2000)
  const [outTok, setOutTok] = useState(500)
  const [reqsDay, setReqsDay] = useState(1000)
  const [results, setResults] = useState<CompareResult[]>([])
  const [loading, setLoading] = useState(false)
  const [tierFilter, setTierFilter] = useState('Todos')
  const [provFilter, setProvFilter] = useState('Todos')

  const allProviders = ['Todos', ...Array.from(new Set(models.map(m => m.provider)))]

  const compare = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.compare({ input_tokens: inTok, output_tokens: outTok, requests_per_day: reqsDay })
      setResults(r)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [inTok, outTok, reqsDay])

  useEffect(() => {
    const id = setTimeout(() => compare(), 400)
    return () => clearTimeout(id)
  }, [inTok, outTok, reqsDay, compare])

  const filtered = results.filter(r =>
    (tierFilter === 'Todos' || r.tier === tierFilter) &&
    (provFilter === 'Todos' || r.provider === provFilter)
  )

  const top5 = filtered.slice(0, 5)

  const cheapest = filtered[0]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <SectionTitle>Parâmetros de comparação</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
          <SliderField label="Tokens entrada / req" value={inTok} min={100} max={50000} step={100} display={fmtTokens(inTok)} onChange={setInTok} />
          <SliderField label="Tokens saída / req" value={outTok} min={50} max={8000} step={50} display={fmtTokens(outTok)} onChange={setOutTok} />
          <SliderField label="Volume (req/dia)" value={reqsDay} min={100} max={100000} step={100} display={`${(reqsDay / 1000).toFixed(1)}k`} onChange={setReqsDay} />
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-body">Tier:</span>
            {TIER_FILTER_OPTIONS.map(t => (
              <button key={t} onClick={() => setTierFilter(t)}
                className={`text-xs px-2.5 py-1 rounded-lg font-body transition-colors ${tierFilter === t ? 'bg-brand-700/40 text-brand-300' : 'text-slate-500 hover:text-slate-300'}`}>
                {t === 'Todos' ? 'Todos' : { economy: 'Econômico', standard: 'Padrão', premium: 'Premium', frontier: 'Frontier' }[t]}
              </button>
            ))}
          </div>
          <Divider className="my-0 w-px h-5 border-l border-t-0 inline-block mx-1" />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-600 font-body">Provedor:</span>
            {allProviders.map(p => (
              <button key={p} onClick={() => setProvFilter(p)}
                className={`text-xs px-2.5 py-1 rounded-lg font-body transition-colors ${provFilter === p ? 'bg-brand-700/40 text-brand-300' : 'text-slate-500 hover:text-slate-300'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          {/* Summary + chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <SectionTitle>Top 5 — custo por requisição</SectionTitle>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={top5} layout="vertical" margin={{ left: 0, right: 60, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="model_name" width={160} tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'DM Sans' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v: number) => [fmtUSD(v), 'Custo/req']}
                    />
                    <Bar dataKey="cost_per_request_usd" radius={[0, 4, 4, 0]}>
                      {top5.map((r, i) => (
                        <Cell key={i} fill={PROVIDER_COLORS[r.provider_id] || '#8250f5'} opacity={1 - i * 0.12} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {cheapest && (
              <Card glow>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <SectionTitle>Melhor custo-benefício</SectionTitle>
                </div>
                <ProviderBadge providerId={cheapest.provider_id} name={cheapest.provider} />
                <p className="text-lg font-display text-white mt-2 mb-1">{cheapest.model_name}</p>
                <p className="text-3xl font-display text-gradient mb-1">{fmtUSD(cheapest.cost_per_request_usd)}</p>
                <p className="text-xs text-slate-500 font-body mb-4">por requisição</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-body">Mensal ({(reqsDay / 1000).toFixed(1)}k req/dia)</span>
                    <span className="font-mono text-white">{fmtUSD(cheapest.monthly_cost_usd)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-body">Em reais</span>
                    <span className="font-mono text-slate-300">{fmtBRL(cheapest.monthly_cost_brl)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-body">Contexto</span>
                    <span className="font-mono text-slate-300">{fmtContextWindow(cheapest.context_window)}</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1">
                  {cheapest.best_for.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-500 border border-white/[0.06] font-body">{tag}</span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Full table */}
          <Card>
            <SectionTitle>Comparativo completo ({filtered.length} modelos)</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Modelo', 'Provedor', 'Input /1M', 'Output /1M', 'Custo/req', 'Mensal', 'Contexto', 'Custo relativo'].map(h => (
                      <th key={h} className="text-left py-2.5 px-2 text-xs text-slate-600 font-body font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <motion.tr
                      key={r.model_id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="font-body text-white">{r.model_name}</span>
                          <TierBadge tier={r.tier} />
                          {i === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 font-body">Mais barato</span>}
                        </div>
                      </td>
                      <td className="py-3 px-2"><ProviderBadge providerId={r.provider_id} name={r.provider} /></td>
                      <td className="py-3 px-2 font-mono text-slate-300 text-xs">${r.input_per_m.toFixed(2)}</td>
                      <td className="py-3 px-2 font-mono text-slate-300 text-xs">${r.output_per_m.toFixed(2)}</td>
                      <td className="py-3 px-2 font-mono text-white font-medium">{fmtUSD(r.cost_per_request_usd)}</td>
                      <td className="py-3 px-2">
                        <span className="font-mono text-slate-300">{fmtUSD(r.monthly_cost_usd)}</span>
                        <span className="text-slate-600 text-xs ml-1 font-body block">{fmtBRL(r.monthly_cost_brl)}</span>
                      </td>
                      <td className="py-3 px-2 font-mono text-xs text-slate-500">{fmtContextWindow(r.context_window)}</td>
                      <td className="py-3 px-2 w-28">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${r.relative_cost_pct}%`, background: PROVIDER_COLORS[r.provider_id] || '#8250f5' }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-600 w-8">{r.relative_cost_pct}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
