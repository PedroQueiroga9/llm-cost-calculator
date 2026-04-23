'use client'
import { useState, useCallback, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Save, Zap } from 'lucide-react'
import { api, type MonthlyCalcResult, type ModelPricing } from '@/lib/api'
import { ModelSelector } from '@/components/ui/ModelSelector'
import { Card, MetricCard, SliderField, Toggle, SectionTitle, Divider, LoadingSpinner } from '@/components/ui'
import { fmtUSD, fmtBRL, fmtTokens, fmtNumber } from '@/lib/utils'

interface Props { models: ModelPricing[] }

const CHART_COLORS = ['#8250f5', '#10b981']

export function MonthlyCalcTab({ models }: Props) {
  const [modelId, setModelId] = useState(models[0]?.id || '')
  const [reqsPerDay, setReqsPerDay] = useState(500)
  const [inTok, setInTok] = useState(0)
  const [outTok, setOutTok] = useState(0)
  const [useCache, setUseCache] = useState(false)
  const [useBatch, setUseBatch] = useState(false)
  const [result, setResult] = useState<MonthlyCalcResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedModel = models.find(m => m.id === modelId)

  const calculate = useCallback(async (save = false) => {
    if (!modelId) return
    setLoading(true)
    try {
      const r = await api.calcMonthly({
        model_id: modelId, requests_per_day: reqsPerDay,
        input_tokens_per_req: inTok, output_tokens_per_req: outTok,
        use_cache: useCache, use_batch: useBatch, save,
        label: `${selectedModel?.name} — ${fmtNumber(reqsPerDay)} req/dia`,
      })
      setResult(r)
      if (save) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [modelId, reqsPerDay, inTok, outTok, useCache, useBatch, selectedModel])

  useEffect(() => {
    if (!modelId) return
    const id = setTimeout(() => calculate(), 400)
    return () => clearTimeout(id)
  }, [modelId, reqsPerDay, inTok, outTok, useCache, useBatch, calculate])

  const chartData = result ? [
    { name: 'Input tokens', value: result.cost_input_usd * reqsPerDay * 30 },
    { name: 'Output tokens', value: result.cost_output_usd * reqsPerDay * 30 },
  ] : []

  const totalMonthlyTokens = result
    ? ((result.total_input_tokens_monthly + result.total_output_tokens_monthly) / 1_000_000).toFixed(1)
    : '0'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Config */}
      <Card>
        <SectionTitle>Parâmetros do projeto</SectionTitle>
        <ModelSelector models={models} value={modelId} onChange={setModelId} />
        <Divider />
        <SliderField label="Requisições / dia" value={reqsPerDay} min={10} max={100000} step={10} display={fmtNumber(reqsPerDay)} onChange={setReqsPerDay} tooltip="Volume diário de chamadas à API" />
        <SliderField label="Tokens entrada / req" value={inTok} min={0} max={50000} step={100} display={fmtTokens(inTok)} onChange={setInTok} tooltip="Média de tokens enviados por requisição (prompt + contexto)" />
        <SliderField label="Tokens saída / req" value={outTok} min={0} max={8000} step={50} display={fmtTokens(outTok)} onChange={setOutTok} tooltip="Média de tokens gerados por resposta" />
        <Divider />
        <SectionTitle>Otimizações de custo</SectionTitle>
        {selectedModel?.cached_input_per_m && (
          <Toggle label="Prompt Cache" sub="Desconto de 90% em tokens de input já em cache" checked={useCache} onChange={setUseCache} />
        )}
        {selectedModel?.batch_available && (
          <Toggle label="Batch API" sub={`${selectedModel.batch_discount}% de desconto — processamento assíncrono (até 24h)`} checked={useBatch} onChange={setUseBatch} />
        )}
      </Card>

      {/* Results */}
      <div className="flex flex-col gap-4">
        <Card glow>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Estimativa mensal</SectionTitle>
            {loading && <LoadingSpinner size="sm" />}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <MetricCard label="Custo mensal" value={result ? fmtUSD(result.monthly_cost_usd) : '—'} sub="USD / mês" highlight />
            <MetricCard label="Em reais" value={result ? fmtBRL(result.monthly_cost_brl) : '—'} sub="mês" />
            <MetricCard label="Custo anual" value={result ? fmtUSD(result.annual_cost_usd) : '—'} sub="USD / ano" />
            <MetricCard label="Volume total" value={result ? `${totalMonthlyTokens}M` : '—'} sub="tokens / mês" />
          </div>

          {/* Donut chart */}
          {result && (
            <div>
              <SectionTitle>Distribuição de custo</SectionTitle>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={chartData} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                      {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtUSD(v)} contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {chartData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm" style={{ background: CHART_COLORS[i] }} />
                        <span className="text-slate-400 font-body">{d.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-white">{fmtUSD(d.value)}</span>
                        <span className="text-slate-600 ml-1">
                          ({chartData[0].value + chartData[1].value > 0 ? Math.round(d.value / (chartData[0].value + chartData[1].value) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={() => calculate(true)}
              disabled={loading || !result}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-brand-400 transition-colors font-body disabled:opacity-40"
            >
              {saved ? <><Zap className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Salvo!</span></> : <><Save className="w-3 h-3" />Salvar no histórico</>}
            </button>
          </div>
        </Card>

        {/* Volume projections table */}
        <Card>
          <SectionTitle>Custo por volume (mensal)</SectionTitle>
          {result && (
            <div className="space-y-1">
              {[
                { label: '100 req/dia', cost: result.cost_total_usd * 100 * 30 },
                { label: `${fmtNumber(reqsPerDay)} req/dia (atual)`, cost: result.monthly_cost_usd, highlight: true },
                { label: '10k req/dia', cost: result.cost_total_usd * 10000 * 30 },
                { label: '100k req/dia', cost: result.cost_total_usd * 100000 * 30 },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex justify-between items-center py-2 px-2 rounded-lg text-sm ${row.highlight ? 'bg-brand-950/40 border border-brand-900/40' : ''}`}
                >
                  <span className={`font-body ${row.highlight ? 'text-brand-300' : 'text-slate-400'}`}>{row.label}</span>
                  <div>
                    <span className={`font-mono ${row.highlight ? 'text-white' : 'text-slate-300'}`}>{fmtUSD(row.cost)}</span>
                    <span className="text-slate-600 text-xs ml-2 font-body">{fmtBRL(row.cost * 5.7)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
