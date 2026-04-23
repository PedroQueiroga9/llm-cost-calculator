'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Clock, RefreshCw } from 'lucide-react'
import { api, type HistoryRecord } from '@/lib/api'
import { Card, SectionTitle, EmptyState, LoadingSpinner } from '@/components/ui'
import { fmtUSD, fmtBRL } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  single: 'Por requisição',
  monthly: 'Mensal',
  agents: 'Sistema de agentes',
}

export function HistoryTab() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { setRecords(await api.getHistory(50)) } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const remove = async (id: number) => {
    await api.deleteHistory(id)
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  useEffect(() => { load() }, [])

  const fmt = (dt: string) => new Date(dt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

  const getCost = (record: HistoryRecord) => {
    const r = record.result as Record<string, number>
    return r.cost_total_usd || r.monthly_cost_usd || r.total_monthly_usd || 0
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500 font-body">{records.length} cálculos salvos</span>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors font-body">
          <RefreshCw className="w-3.5 h-3.5" />
          Atualizar
        </button>
      </div>

      {records.length === 0 ? (
        <Card><EmptyState icon={Clock} title="Nenhum cálculo salvo" sub="Salve cálculos usando o botão 'Salvar no histórico' nas outras abas" /></Card>
      ) : (
        <div className="space-y-3">
          {records.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand-950/60 text-brand-400 border border-brand-900/30 font-body">
                        {TYPE_LABELS[r.type] || r.type}
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">{fmt(r.created_at)}</span>
                    </div>
                    <p className="text-sm font-body text-white truncate mb-2">{r.label || '—'}</p>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-brand-300">{fmtUSD(getCost(r))}</span>
                      <span className="text-slate-600">{fmtBRL(getCost(r) * 5.7)}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(r.id)} className="text-slate-700 hover:text-red-400 transition-colors flex-shrink-0 mt-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
