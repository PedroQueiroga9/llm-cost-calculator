'use client'
import { motion } from 'framer-motion'
import { cn, PROVIDER_COLORS, TIER_LABELS } from '@/lib/utils'
import { type ReactNode, type ChangeEvent, type ElementType, useState, useEffect } from 'react'
import { Info } from 'lucide-react'

/* ── Card ─────────────────────────────────────────────────────────────── */
export function Card({
  children,
  className,
  glow,
}: {
  children: ReactNode
  className?: string
  glow?: boolean
}) {
  return (
    <div
      className={cn(
        'glass rounded-2xl p-5',
        glow && 'glow-purple-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ── MetricCard ───────────────────────────────────────────────────────── */
export function MetricCard({
  label,
  value,
  sub,
  highlight,
  className,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        'rounded-xl p-4 border',
        highlight
          ? 'bg-brand-950/80 border-brand-700/50'
          : 'bg-white/[0.03] border-white/[0.06]',
        className,
      )}
    >
      <p className="text-xs text-slate-500 font-body mb-1.5 uppercase tracking-wide">{label}</p>
      <p className={cn('text-2xl font-display leading-none', highlight ? 'text-gradient' : 'text-white')}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-600 mt-1.5 font-mono">{sub}</p>}
    </motion.div>
  )
}

/* ── ProviderBadge ────────────────────────────────────────────────────── */
export function ProviderBadge({ providerId, name }: { providerId: string; name: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-body', `badge-${providerId}`)}>
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: PROVIDER_COLORS[providerId] || '#6b7280' }}
      />
      {name}
    </span>
  )
}

/* ── TierBadge ────────────────────────────────────────────────────────── */
export function TierBadge({ tier }: { tier: string }) {
  return (
    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-body font-medium uppercase tracking-wide', `tier-${tier}`)}>
      {TIER_LABELS[tier] || tier}
    </span>
  )
}

/* ── SliderField ──────────────────────────────────────────────────────── */
export function SliderField({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  tooltip,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
  tooltip?: string
}) {
  const [inputVal, setInputVal] = useState(String(value))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setInputVal(String(value))
  }, [value, focused])

  function commitInput(raw: string) {
    const n = parseInt(raw, 10)
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)))
    else setInputVal(String(value))
    setFocused(false)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <label className="text-sm text-slate-400 font-body">{label}</label>
          {tooltip && (
            <div className="group relative">
              <Info className="w-3 h-3 text-slate-600 cursor-help" />
              <div className="absolute left-4 top-0 w-48 glass rounded-lg p-2 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={focused ? inputVal : display}
          onFocus={() => { setFocused(true); setInputVal(String(value)) }}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={(e) => commitInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commitInput(inputVal) }}
          className="text-sm font-mono text-brand-300 bg-transparent border-b border-transparent focus:border-brand-500 outline-none text-right w-28"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-slate-700 font-mono">
          {min >= 1000 ? `${min / 1000}k` : min}
        </span>
        <span className="text-[10px] text-slate-700 font-mono">
          {max >= 1000000 ? `${max / 1000000}M` : max >= 1000 ? `${max / 1000}k` : max}
        </span>
      </div>
    </div>
  )
}

/* ── SelectField ──────────────────────────────────────────────────────── */
export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <div className={cn('mb-4', className)}>
      <label className="block text-sm text-slate-400 font-body mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white font-body focus:outline-none focus:border-brand-600/60 transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/* ── Toggle ───────────────────────────────────────────────────────────── */
export function Toggle({
  label,
  checked,
  onChange,
  sub,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  sub?: string
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1.5">
      <div>
        <p className="text-sm text-slate-300 font-body">{label}</p>
        {sub && <p className="text-xs text-slate-600 font-body">{sub}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          checked ? 'bg-brand-600' : 'bg-white/10',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  )
}

/* ── SectionTitle ─────────────────────────────────────────────────────── */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-body font-medium uppercase tracking-widest text-slate-500 mb-4">
      {children}
    </h3>
  )
}

/* ── Divider ──────────────────────────────────────────────────────────── */
export function Divider({ className }: { className?: string }) {
  return <div className={cn('border-t border-white/[0.06] my-5', className)} />
}

/* ── LoadingSpinner ───────────────────────────────────────────────────── */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return (
    <div className={cn('border-2 border-white/10 border-t-brand-500 rounded-full animate-spin', sz)} />
  )
}

/* ── EmptyState ───────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, sub }: { icon: ElementType; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-600" />
      </div>
      <p className="text-slate-400 font-body text-sm font-medium mb-1">{title}</p>
      <p className="text-slate-600 font-body text-xs">{sub}</p>
    </div>
  )
}
