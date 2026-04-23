'use client'
import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Zap } from 'lucide-react'
import { api, type SingleCalcResult, type ModelPricing } from '@/lib/api'
import { ModelSelector } from '@/components/ui/ModelSelector'
import { Card, MetricCard, SliderField, Toggle, SectionTitle, Divider, LoadingSpinner } from '@/components/ui'
import { fmtUSD, fmtBRL, fmtNumber, fmtTokens } from '@/lib/utils'

interface Props { models: ModelPricing[] }

export function SingleCalcTab({ models }: Props) {
  const [modelId, setModelId] = useState(models[0]?.id || '')
  const [inputTokens, setInputTokens] = useState(0)
  const [outputTokens, setOutputTokens] = useState(0)
  const [useCache, setUseCache] = useState(false)
  const [useBatch, setUseBatch] = useState(false)
  const [result, setResult] = useState<SingleCalcResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const selectedModel = models.find(m => m.id === modelId)

  const calculate = useCallback(async (save = false) => {
    if (!modelId) return
    setLoading(true)
    try {
      const r = await api.calcSingle({ model_id: modelId, input_tokens: inputTokens, output_tokens: outputTokens, use_cache: useCache, use_batch: useBatch, save, label: `${selectedModel?.name} — ${fmtTokens(inputTokens)} in / ${fmtTokens(outputTokens)} out` })
      setResult(r)
      if (save) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [modelId, inputTokens, outputTokens, useCache, useBatch, selectedModel])

  useEffect(() => {
    if (!modelId) return
    const id = setTimeout(() => calculate(), 400)
    return () => clearTimeout(id)
  }, [modelId, inputTokens, outputTokens, useCache, useBatch, calculate])

  const projections = result ? [
    { label: '100 req/dia', monthly: result.cost_total_usd * 100 * 30 },
    { label: '1.000 req/dia', monthly: result.cost_total_usd * 1000 * 30 },
    { label: '10.000 req/dia', monthly: result.cost_total_usd * 10000 * 30 },
    { label: '100.000 req/dia', monthly: result.cost_total_usd * 100000 * 30 },
  ] : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Config */}
      <Card>
        <SectionTitle>Configuração</SectionTitle>
        <ModelSelector models={models} value={modelId} onChange={setModelId} />
        <Divider />
        <SliderField
          label="Tokens de entrada (prompt)"
          value={inputTokens}
          min={0}
          max={200000}
          step={100}
          display={fmtTokens(inputTokens) + ' tokens'}
          onChange={setInputTokens}
          tooltip="Inclui system prompt, histórico e a mensagem do usuário. 1 token ≈ 0,6 palavras em português."
        />
        <SliderField
          label="Tokens de saída (resposta)"
          value={outputTokens}
          min={0}
          max={8000}
          step={50}
          display={fmtTokens(outputTokens) + ' tokens'}
          onChange={setOutputTokens}
          tooltip="Tokens gerados pelo modelo. Output é geralmente 3–10x mais caro que input."
        />
        <Divider />
        <SectionTitle>Otimizações</SectionTitle>
        {selectedModel?.cached_input_per_m && (
          <Toggle
            label="Prompt Cache"
            sub={`Reduz custo de input em 90% (cache hit) · $${selectedModel.cached_input_per_m}/M`}
            checked={useCache}
            onChange={setUseCache}
          />
        )}
        {selectedModel?.batch_available && (
          <Toggle
            label="Batch API"
            sub={`${selectedModel.batch_discount}% desconto em input e output (processamento async)`}
            checked={useBatch}
            onChange={setUseBatch}
          />
        )}
        {!selectedModel?.cached_input_per_m && !selectedModel?.batch_available && (
          <p className="text-xs text-slate-600 font-body italic">Este modelo não suporta cache ou batch API.</p>
        )}
      </Card>

      {/* Right: Results */}
      <div className="flex flex-col gap-4">
        <Card glow>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle>Resultado por requisição</SectionTitle>
            {loading && <LoadingSpinner size="sm" />}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <MetricCard label="Custo total" value={result ? fmtUSD(result.cost_total_usd) : '—'} sub="USD" highlight />
            <MetricCard label="Em reais" value={result ? fmtBRL(result.cost_total_brl) : '—'} sub="USD × 5,70" />
            <MetricCard label="Custo input" value={result ? fmtUSD(result.cost_input_usd) : '—'} sub={`${fmtNumber(inputTokens)} tokens`} />
            <MetricCard label="Custo output" value={result ? fmtUSD(result.cost_output_usd) : '—'} sub={`${fmtNumber(outputTokens)} tokens`} />
          </div>
          {result && (result.cache_applied || result.batch_applied) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {result.cache_applied && <span className="text-[10px] px-2 py-0.5 rounded bg-brand-950/60 text-brand-400 border border-brand-800/40">✓ Cache aplicado</span>}
              {result.batch_applied && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">✓ Batch aplicado</span>}
            </div>
          )}
          <button
            onClick={() => calculate(true)}
            disabled={loading || !result}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-brand-400 transition-colors font-body disabled:opacity-40"
          >
            {saved ? <><Zap className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Salvo!</span></> : <><Save className="w-3 h-3" />Salvar no histórico</>}
          </button>
        </Card>

        {/* Projections */}
        <Card>
          <SectionTitle>Projeções por volume (mensal)</SectionTitle>
          <div className="space-y-2">
            {projections.map((p) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-sm text-slate-400 font-body">{p.label}</span>
                <div className="text-right">
                  <span className="text-sm font-mono text-white">{fmtUSD(p.monthly)}</span>
                  <span className="text-xs text-slate-600 ml-2 font-body">{fmtBRL(p.monthly * 5.7)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Model tip */}
        {selectedModel && (
          <Card>
            <SectionTitle>Para quê usar</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {selectedModel.best_for.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] text-slate-400 border border-white/[0.06] font-body">
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
